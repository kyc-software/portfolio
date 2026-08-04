import { v } from "convex/values";

import { normalizeAssistantQuestion } from "../src/lib/assistant-copy";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import { cosineSimilarity, createEmbedding } from "./embeddings";

const SEMANTIC_MATCH_THRESHOLD = 0.43;
const SEMANTIC_MATCH_MARGIN = 0.08;

function containsPhrase(question: string, phrase: string) {
  return ` ${question} `.includes(` ${phrase} `);
}

export function hasPortfolioReferent(question: string) {
  const words = new Set(question.split(" "));
  return ["anthony", "tony", "he", "him", "his"].some((word) => words.has(word));
}

export function hasSemanticSignal(question: string, signals: string[]) {
  return signals.some((signal) => containsPhrase(question, signal));
}

function confidentSemanticMatch(ranked: Array<{ faq: Doc<"faqs">; score: number }>) {
  const best = ranked[0];
  const runnerUp = ranked[1];
  const margin = best ? best.score - (runnerUp?.score ?? -1) : 0;
  return best && best.score >= SEMANTIC_MATCH_THRESHOLD && margin >= SEMANTIC_MATCH_MARGIN
    ? best.faq
    : null;
}

type RouteResult =
  | {
      kind: "cached";
      match: "exact" | "semantic";
      answer: string;
      audioStorageId?: Doc<"faqs">["audioStorageId"];
      remaining: number;
    }
  | { kind: "realtime"; remaining: number }
  | { kind: "rate_limited"; retryAfter: number }
  | { kind: "limited"; remaining: 0 };

type QuotaResult = { allowed: boolean; remaining: number };

export const routeTurn = internalAction({
  args: {
    visitorToken: v.string(),
    question: v.string(),
  },
  handler: async (ctx, { visitorToken, question }): Promise<RouteResult> => {
    const turnLimit = await ctx.runMutation(internal.assistant.limitTurn, {
      visitorToken,
    });
    if (!turnLimit.ok)
      return {
        kind: "rate_limited" as const,
        retryAfter: turnLimit.retryAfter,
      };

    const normalized = normalizeAssistantQuestion(question);
    const faqs = await ctx.runQuery(internal.assistant.faqsForMatching, {});
    const exact = faqs.find((faq) => faq.aliases.includes(normalized));

    if (exact) {
      const quota: QuotaResult = await ctx.runMutation(internal.assistant.updateQuota, {
        visitorToken,
        reserve: false,
      });
      return {
        kind: "cached" as const,
        match: "exact" as const,
        answer: exact.answer,
        audioStorageId: exact.audioStorageId,
        remaining: quota.remaining,
      };
    }

    const currentQuota: QuotaResult = await ctx.runMutation(
      internal.assistant.updateQuota,
      { visitorToken, reserve: false },
    );
    if (currentQuota.remaining === 0) return { kind: "limited" as const, remaining: 0 };

    const questionWords = normalized.split(" ");
    const semanticCandidateMetadata = faqs.filter(
      (faq) =>
        faq.matchSignals &&
        hasSemanticSignal(normalized, faq.matchSignals) &&
        (hasPortfolioReferent(normalized) ||
          (faq.key === "who-are-you" &&
            ["you", "your", "yourself"].some((word) => questionWords.includes(word)))),
    );

    if (semanticCandidateMetadata.length > 0) {
      try {
        const semanticCandidates: Doc<"faqs">[] = await ctx.runQuery(
          internal.assistant.faqEmbeddings,
          { faqIds: semanticCandidateMetadata.map(({ _id }) => _id) },
        );
        const questionEmbedding = await createEmbedding(question);
        const ranked = semanticCandidates
          .map((faq) => ({
            faq,
            score: cosineSimilarity(questionEmbedding, faq.embedding ?? []),
          }))
          .sort((left, right) => right.score - left.score);
        const best =
          confidentSemanticMatch(
            ranked.filter(({ faq }) => (faq.source ?? "seeded") === "seeded"),
          ) ??
          confidentSemanticMatch(ranked.filter(({ faq }) => faq.source === "candidate"));

        if (best) {
          return {
            kind: "cached" as const,
            match: "semantic" as const,
            answer: best.answer,
            audioStorageId: best.audioStorageId,
            remaining: currentQuota.remaining,
          };
        }
      } catch (error) {
        console.error("Semantic FAQ matching unavailable", error);
      }
    }

    const quota: QuotaResult = await ctx.runMutation(internal.assistant.updateQuota, {
      visitorToken,
      reserve: true,
    });
    if (!quota.allowed) return { kind: "limited" as const, remaining: 0 };
    return { kind: "realtime" as const, remaining: quota.remaining };
  },
});

export const diagnoseTurn = internalAction({
  args: { question: v.string() },
  handler: async (ctx, { question }) => {
    const normalized = normalizeAssistantQuestion(question);
    const metadata = await ctx.runQuery(internal.assistant.faqsForMatching, {});
    const faqs: Doc<"faqs">[] = await ctx.runQuery(internal.assistant.faqEmbeddings, {
      faqIds: metadata.map(({ _id }) => _id),
    });
    const embedding = await createEmbedding(question);
    const ranked = faqs
      .filter((faq) => faq.embedding)
      .map((faq) => ({
        key: faq.key,
        score: cosineSimilarity(embedding, faq.embedding ?? []),
        signal: hasSemanticSignal(normalized, faq.matchSignals ?? []),
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, 5);

    return { normalized, portfolioReferent: hasPortfolioReferent(normalized), ranked };
  },
});
