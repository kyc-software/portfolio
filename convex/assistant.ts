import { v } from "convex/values";

import { normalizeAssistantQuestion } from "../src/lib/assistant-copy";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
} from "./_generated/server";
import { createEmbedding, EMBEDDING_VERSION } from "./embeddings";
import { FAQ_CATALOG_VERSION, PREPARED_QUESTION_COUNT, SEEDED_FAQS } from "./faqCatalog";

const QUESTION_LIMIT = 10;
const QUOTA_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const CATALOG_CONFIG_KEY = "faqCatalogVersion";
const GENERATION_STAGGER_MS = 200;

function remaining(used: number) {
  return Math.max(0, QUESTION_LIMIT - used);
}

async function reconcileCatalog(ctx: MutationCtx, force: boolean) {
  const now = Date.now();
  let audioScheduled = 0;
  let embeddingsScheduled = 0;

  for (const [index, seed] of SEEDED_FAQS.entries()) {
    const existing = await ctx.db
      .query("faqs")
      .withIndex("by_key", (query) => query.eq("key", seed.key))
      .unique();
    const delay = index * GENERATION_STAGGER_MS;

    if (!existing) {
      const faqId = await ctx.db.insert("faqs", {
        ...seed,
        sortOrder: index,
        aliases: [...seed.aliases],
        matchSignals: [...seed.matchSignals],
        audioStatus: "pending",
        ...(seed.intent
          ? {
              embeddingStatus: "pending" as const,
              embeddingVersion: EMBEDDING_VERSION,
            }
          : {}),
        updatedAt: now,
      });
      await ctx.scheduler.runAfter(delay, internal.assistant.generateFaqAudio, {
        faqId,
      });
      audioScheduled += 1;
      if (seed.intent) {
        await ctx.scheduler.runAfter(delay, internal.assistant.generateFaqEmbedding, {
          faqId,
        });
        embeddingsScheduled += 1;
      }
      continue;
    }

    const answerChanged = existing.answer !== seed.answer;
    const orderChanged = existing.sortOrder !== index;
    const questionChanged = existing.question !== seed.question;
    const aliasesChanged =
      JSON.stringify(existing.aliases) !== JSON.stringify(seed.aliases);
    const intentChanged = existing.intent !== seed.intent;
    const signalsChanged =
      JSON.stringify(existing.matchSignals ?? []) !== JSON.stringify(seed.matchSignals);
    const needsAudio =
      answerChanged ||
      !existing.audioStorageId ||
      existing.audioStatus === "failed" ||
      (force && existing.audioStatus !== "ready");
    const needsEmbedding =
      Boolean(seed.intent) &&
      (intentChanged ||
        !existing.embedding ||
        existing.embeddingStatus === "failed" ||
        existing.embeddingVersion !== EMBEDDING_VERSION ||
        (force && existing.embeddingStatus !== "ready"));

    if (
      answerChanged ||
      orderChanged ||
      questionChanged ||
      aliasesChanged ||
      intentChanged ||
      signalsChanged ||
      needsAudio ||
      needsEmbedding
    ) {
      await ctx.db.patch(existing._id, {
        answer: seed.answer,
        sortOrder: index,
        question: seed.question,
        aliases: [...seed.aliases],
        intent: seed.intent,
        matchSignals: [...seed.matchSignals],
        ...(needsAudio ? { audioStatus: "pending" as const } : {}),
        ...(needsEmbedding
          ? {
              embedding: undefined,
              embeddingStatus: "pending" as const,
              embeddingVersion: EMBEDDING_VERSION,
            }
          : {}),
        updatedAt: now,
      });
    }

    if (needsAudio && (answerChanged || existing.audioStatus !== "pending" || force)) {
      await ctx.scheduler.runAfter(delay, internal.assistant.generateFaqAudio, {
        faqId: existing._id,
      });
      audioScheduled += 1;
    }
    if (
      needsEmbedding &&
      (intentChanged ||
        existing.embeddingVersion !== EMBEDDING_VERSION ||
        existing.embeddingStatus !== "pending" ||
        force)
    ) {
      await ctx.scheduler.runAfter(delay, internal.assistant.generateFaqEmbedding, {
        faqId: existing._id,
      });
      embeddingsScheduled += 1;
    }
  }

  const config = await ctx.db
    .query("assistantConfig")
    .withIndex("by_key", (query) => query.eq("key", CATALOG_CONFIG_KEY))
    .unique();
  if (config)
    await ctx.db.patch(config._id, { value: FAQ_CATALOG_VERSION, updatedAt: now });
  else
    await ctx.db.insert("assistantConfig", {
      key: CATALOG_CONFIG_KEY,
      value: FAQ_CATALOG_VERSION,
      updatedAt: now,
    });

  return { audioScheduled, embeddingsScheduled };
}

export const provisionCatalog = internalMutation({
  args: { force: v.boolean() },
  handler: (ctx, { force }) => reconcileCatalog(ctx, force),
});

export const initialize = internalMutation({
  args: { visitorToken: v.string() },
  handler: async (ctx, { visitorToken }) => {
    const now = Date.now();
    let visitor = await ctx.db
      .query("visitors")
      .withIndex("by_token", (query) => query.eq("token", visitorToken))
      .unique();

    if (!visitor) {
      const visitorId = await ctx.db.insert("visitors", {
        token: visitorToken,
        used: 0,
        windowStartedAt: 0,
        updatedAt: now,
      });
      visitor = await ctx.db.get(visitorId);
    } else if (
      visitor.windowStartedAt > 0 &&
      now - visitor.windowStartedAt >= QUOTA_WINDOW_MS
    ) {
      await ctx.db.patch(visitor._id, {
        used: 0,
        windowStartedAt: 0,
        updatedAt: now,
      });
      visitor = { ...visitor, used: 0, windowStartedAt: 0, updatedAt: now };
    }

    const greeting = await ctx.db
      .query("faqs")
      .withIndex("by_key", (query) => query.eq("key", "greeting"))
      .unique();

    return {
      remaining: remaining(visitor?.used ?? 0),
      greeting: greeting
        ? {
            answer: greeting.answer,
            audioStorageId: greeting.audioStorageId,
          }
        : null,
    };
  },
});

export const catalogStatus = internalQuery({
  args: {},
  handler: async (ctx) => {
    const expectedKeys = new Set(SEEDED_FAQS.map(({ key }) => key));
    const faqs = (await ctx.db.query("faqs").collect()).filter(({ key }) =>
      expectedKeys.has(key),
    );
    const config = await ctx.db
      .query("assistantConfig")
      .withIndex("by_key", (query) => query.eq("key", CATALOG_CONFIG_KEY))
      .unique();

    return {
      version: config?.value ?? null,
      expectedRecords: SEEDED_FAQS.length,
      preparedQuestions: PREPARED_QUESTION_COUNT,
      records: faqs.length,
      audioReady: faqs.filter(({ audioStatus }) => audioStatus === "ready").length,
      audioFailed: faqs.filter(({ audioStatus }) => audioStatus === "failed").length,
      embeddingsReady: faqs.filter(
        ({ embeddingStatus, embeddingVersion }) =>
          embeddingStatus === "ready" && embeddingVersion === EMBEDDING_VERSION,
      ).length,
      embeddingsFailed: faqs.filter(({ embeddingStatus }) => embeddingStatus === "failed")
        .length,
    };
  },
});

export const faqsForMatching = internalQuery({
  args: {},
  handler: async (ctx) =>
    (await ctx.db.query("faqs").collect()).map(
      ({ _id, key, answer, aliases, matchSignals, audioStorageId }) => ({
        _id,
        key,
        answer,
        aliases,
        matchSignals,
        audioStorageId,
      }),
    ),
});

export const faqEmbeddings = internalQuery({
  args: { faqIds: v.array(v.id("faqs")) },
  handler: async (ctx, { faqIds }) =>
    (await Promise.all(faqIds.map((faqId) => ctx.db.get(faqId)))).flatMap((faq) =>
      faq?.embedding ? [faq] : [],
    ),
});

export const freeQuestions = internalQuery({
  args: {},
  handler: async (ctx) =>
    (await ctx.db.query("faqs").collect())
      .filter(
        (faq) =>
          faq.key !== "greeting" &&
          Boolean(faq.question) &&
          faq.audioStatus === "ready" &&
          Boolean(faq.audioStorageId),
      )
      .sort((left, right) => (left.sortOrder ?? 999) - (right.sortOrder ?? 999))
      .map(({ key, question }) => ({ key, question: question ?? "" })),
});

export const updateQuota = internalMutation({
  args: {
    visitorToken: v.string(),
    reserve: v.boolean(),
  },
  handler: async (ctx, { visitorToken, reserve }) => {
    let visitor = await ctx.db
      .query("visitors")
      .withIndex("by_token", (query) => query.eq("token", visitorToken))
      .unique();
    const now = Date.now();

    if (!visitor) {
      const visitorId = await ctx.db.insert("visitors", {
        token: visitorToken,
        used: 0,
        windowStartedAt: 0,
        updatedAt: now,
      });
      visitor = await ctx.db.get(visitorId);
    }

    if (!visitor) throw new Error("Visitor could not be initialized");

    if (visitor.windowStartedAt > 0 && now - visitor.windowStartedAt >= QUOTA_WINDOW_MS) {
      await ctx.db.patch(visitor._id, {
        used: 0,
        windowStartedAt: 0,
        updatedAt: now,
      });
      visitor = { ...visitor, used: 0, windowStartedAt: 0, updatedAt: now };
    }

    if (!reserve) return { allowed: true, remaining: remaining(visitor.used) };
    if (visitor.used >= QUESTION_LIMIT) return { allowed: false, remaining: 0 };

    const used = visitor.used + 1;
    await ctx.db.patch(visitor._id, {
      used,
      windowStartedAt: visitor.windowStartedAt || now,
      updatedAt: now,
    });

    return { allowed: true, remaining: remaining(used) };
  },
});

export const recordCandidate = internalMutation({
  args: {
    question: v.string(),
    answer: v.string(),
  },
  handler: async (ctx, { question, answer }) => {
    const normalizedQuestion = normalizeAssistantQuestion(question);
    if (!normalizedQuestion) return;

    const cached = (await ctx.db.query("faqs").collect()).some((faq) =>
      faq.aliases.includes(normalizedQuestion),
    );
    if (cached) return;

    const existing = await ctx.db
      .query("candidates")
      .withIndex("by_question", (query) =>
        query.eq("normalizedQuestion", normalizedQuestion),
      )
      .unique();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        question,
        answer,
        occurrences: existing.occurrences + 1,
        updatedAt: now,
      });
      return;
    }

    await ctx.db.insert("candidates", {
      normalizedQuestion,
      question,
      answer,
      occurrences: 1,
      updatedAt: now,
    });
  },
});

export const faqForGeneration = internalQuery({
  args: { faqId: v.id("faqs") },
  handler: (ctx, { faqId }) => ctx.db.get(faqId),
});

export const finishFaqAudio = internalMutation({
  args: {
    faqId: v.id("faqs"),
    status: v.union(v.literal("ready"), v.literal("failed")),
    audioStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { faqId, status, audioStorageId }) => {
    const faq = await ctx.db.get(faqId);
    await ctx.db.patch(faqId, {
      audioStatus: status,
      ...(status === "ready" ? { audioStorageId } : {}),
      updatedAt: Date.now(),
    });
    if (
      status === "ready" &&
      faq?.audioStorageId &&
      audioStorageId &&
      faq.audioStorageId !== audioStorageId
    )
      await ctx.storage.delete(faq.audioStorageId);
  },
});

export const generateFaqAudio = internalAction({
  args: { faqId: v.id("faqs") },
  handler: async (ctx, { faqId }) => {
    const faq = await ctx.runQuery(internal.assistant.faqForGeneration, { faqId });
    if (!faq || faq.audioStatus === "ready") return;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      await ctx.runMutation(internal.assistant.finishFaqAudio, {
        faqId,
        status: "failed",
      });
      return;
    }

    try {
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          voice: "marin",
          input: faq.answer,
          instructions: "Speak naturally, warmly, and concisely.",
          response_format: "mp3",
        }),
      });

      if (!response.ok) throw new Error(`Speech generation failed: ${response.status}`);
      const audioStorageId = await ctx.storage.store(
        new Blob([await response.arrayBuffer()], { type: "audio/mpeg" }),
      );
      await ctx.runMutation(internal.assistant.finishFaqAudio, {
        faqId,
        status: "ready",
        audioStorageId,
      });
    } catch (error) {
      console.error(error);
      await ctx.runMutation(internal.assistant.finishFaqAudio, {
        faqId,
        status: "failed",
      });
    }
  },
});

export const finishFaqEmbedding = internalMutation({
  args: {
    faqId: v.id("faqs"),
    status: v.union(v.literal("ready"), v.literal("failed")),
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, { faqId, status, embedding }) => {
    await ctx.db.patch(faqId, {
      embeddingStatus: status,
      embeddingVersion: EMBEDDING_VERSION,
      embedding,
      updatedAt: Date.now(),
    });
  },
});

export const generateFaqEmbedding = internalAction({
  args: { faqId: v.id("faqs") },
  handler: async (ctx, { faqId }) => {
    const faq = await ctx.runQuery(internal.assistant.faqForGeneration, { faqId });
    if (
      !faq ||
      (faq.embeddingStatus === "ready" && faq.embeddingVersion === EMBEDDING_VERSION) ||
      !faq.intent
    )
      return;

    try {
      const embedding = await createEmbedding(faq.intent);
      await ctx.runMutation(internal.assistant.finishFaqEmbedding, {
        faqId,
        status: "ready",
        embedding,
      });
    } catch (error) {
      console.error(
        "FAQ embedding generation failed",
        error instanceof Error ? error.message : "Error",
      );
      await ctx.runMutation(internal.assistant.finishFaqEmbedding, {
        faqId,
        status: "failed",
      });
    }
  },
});
