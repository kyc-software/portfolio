import { v } from "convex/values";

import {
  INITIAL_GREETING,
  normalizeAssistantQuestion,
  WHO_ARE_YOU_ALIASES,
  WHO_ARE_YOU_ANSWER,
} from "../src/lib/assistant-copy";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { createEmbedding } from "./embeddings";

const QUESTION_LIMIT = 10;
const QUOTA_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const SEEDED_FAQS = [
  {
    key: "greeting",
    question: "",
    answer: INITIAL_GREETING,
    aliases: [] as string[],
    intent: "",
    matchSignals: [] as string[],
  },
  {
    key: "who-are-you",
    question: "Who are you?",
    answer: WHO_ARE_YOU_ANSWER,
    aliases: [...WHO_ARE_YOU_ALIASES],
    intent: "Questions asking the AI assistant to identify itself or explain its role.",
    matchSignals: ["identify yourself", "yourself", "your role", "assistant"],
  },
  {
    key: "profile-overview",
    question: "What does Anthony do?",
    answer:
      "Anthony is a senior software engineer and product builder with over ten years of experience. He has also worked as an agile coach and engineering leader.",
    aliases: [
      "what does anthony do",
      "what is anthony s background",
      "tell me about anthony",
      "describe anthony",
      "what is anthony s profile",
      "what does he do",
      "what is his background",
      "tell me about him",
      "describe him",
      "what is his profile",
    ],
    intent:
      "Questions asking for an overview of Anthony's professional profile, background, career, or what he does.",
    matchSignals: [
      "profile",
      "background",
      "career",
      "professional",
      "what does anthony do",
      "what does tony do",
      "tell me about anthony",
      "describe anthony",
    ],
  },
  {
    key: "nextjs-experience",
    question: "Has Anthony worked with Next.js?",
    answer:
      "Yes. Anthony has used Next.js across several products, including Bisonflow, Pixlr, and earlier project management platforms.",
    aliases: [
      "does anthony know next js",
      "has anthony worked with next js",
      "does anthony have next js experience",
      "what is anthony s experience with next js",
      "has tony worked with next js",
      "does he know next js",
      "has he worked with next js",
      "does he have next js experience",
      "what is his experience with next js",
    ],
    intent:
      "Questions asking whether Anthony or Tony has experience using Next.js or the Next framework.",
    matchSignals: ["next js", "nextjs", "next framework"],
  },
  {
    key: "latest-projects",
    question: "What are Anthony's latest projects?",
    answer:
      "Anthony's latest projects include this portfolio, Bragi Notes, Tingshuo, Loany, and a Biotech concept prototype. Which one would you like to explore?",
    aliases: [
      "what are anthony s latest projects",
      "what recent projects has anthony worked on",
      "tell me about anthony s latest projects",
      "what has anthony built recently",
      "what are tony s latest projects",
      "what are his latest projects",
      "what recent projects has he worked on",
      "tell me about his latest projects",
      "what has he built recently",
    ],
    intent:
      "Questions asking about Anthony's latest, newest, current, or recent projects, products, work, or things he has built.",
    matchSignals: [
      "latest project",
      "latest projects",
      "latest work",
      "recent project",
      "recent projects",
      "recent work",
      "newest project",
      "current project",
      "building lately",
      "built lately",
      "working on lately",
      "built recently",
      "shipped recently",
    ],
  },
  {
    key: "location",
    question: "Where is Anthony based?",
    answer:
      "Anthony is currently based in Taiwan and works remotely. His earlier career includes several roles in France.",
    aliases: [
      "where is anthony based",
      "where does anthony live",
      "is anthony based in taiwan",
      "is anthony in france",
      "where is tony based",
      "where is he based",
      "where does he live",
      "is he based in taiwan",
      "is he in france",
    ],
    intent: "Questions asking where Anthony lives, is based, is located, or works from.",
    matchSignals: ["where", "based", "live", "living", "located", "location"],
  },
  {
    key: "working-style",
    question: "What is Anthony's working style?",
    answer:
      "Anthony works with high ownership and prefers durable, simple solutions. He moves comfortably between product decisions, architecture, implementation, and team coaching.",
    aliases: [
      "how does anthony work",
      "what is anthony s working style",
      "describe anthony s working style",
      "how does tony work",
      "what is it like to work with anthony",
      "how does he work",
      "what is his working style",
      "what is his work style",
      "what is it like to work with him",
    ],
    intent:
      "Questions asking about Anthony's working style, approach, collaboration, ownership, or what he is like to work with.",
    matchSignals: [
      "working style",
      "work style",
      "does he work",
      "how he works",
      "work with",
      "colleague",
      "collaborate",
      "collaboration",
      "approach",
      "ownership",
    ],
  },
] as const;

function remaining(used: number) {
  return Math.max(0, QUESTION_LIMIT - used);
}

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

    for (const seed of SEEDED_FAQS) {
      const existing = await ctx.db
        .query("faqs")
        .withIndex("by_key", (query) => query.eq("key", seed.key))
        .unique();

      if (!existing) {
        const faqId = await ctx.db.insert("faqs", {
          ...seed,
          aliases: [...seed.aliases],
          matchSignals: [...seed.matchSignals],
          audioStatus: "pending",
          ...(seed.intent ? { embeddingStatus: "pending" as const } : {}),
          updatedAt: now,
        });
        await ctx.scheduler.runAfter(0, internal.assistant.generateFaqAudio, {
          faqId,
        });
        if (seed.intent)
          await ctx.scheduler.runAfter(0, internal.assistant.generateFaqEmbedding, {
            faqId,
          });
      } else if (existing.audioStatus === "failed") {
        await ctx.db.patch(existing._id, { audioStatus: "pending", updatedAt: now });
        await ctx.scheduler.runAfter(0, internal.assistant.generateFaqAudio, {
          faqId: existing._id,
        });
      }

      if (existing) {
        const questionChanged = existing.question !== seed.question;
        const aliasesChanged =
          JSON.stringify(existing.aliases) !== JSON.stringify(seed.aliases);
        const intentChanged = existing.intent !== seed.intent;
        const signalsChanged =
          JSON.stringify(existing.matchSignals ?? []) !==
          JSON.stringify(seed.matchSignals);
        const needsEmbedding =
          Boolean(seed.intent) &&
          (intentChanged || !existing.embedding || existing.embeddingStatus === "failed");

        if (
          questionChanged ||
          aliasesChanged ||
          intentChanged ||
          signalsChanged ||
          needsEmbedding
        ) {
          await ctx.db.patch(existing._id, {
            question: seed.question,
            aliases: [...seed.aliases],
            intent: seed.intent,
            matchSignals: [...seed.matchSignals],
            ...(needsEmbedding
              ? { embedding: undefined, embeddingStatus: "pending" as const }
              : {}),
            updatedAt: now,
          });
        }
        if (
          seed.intent &&
          needsEmbedding &&
          (intentChanged || existing.embeddingStatus !== "pending")
        )
          await ctx.scheduler.runAfter(0, internal.assistant.generateFaqEmbedding, {
            faqId: existing._id,
          });
      }
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

export const faqsForMatching = internalQuery({
  args: {},
  handler: (ctx) => ctx.db.query("faqs").collect(),
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
    await ctx.db.patch(faqId, {
      audioStatus: status,
      audioStorageId,
      updatedAt: Date.now(),
    });
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
      embedding,
      updatedAt: Date.now(),
    });
  },
});

export const generateFaqEmbedding = internalAction({
  args: { faqId: v.id("faqs") },
  handler: async (ctx, { faqId }) => {
    const faq = await ctx.runQuery(internal.assistant.faqForGeneration, { faqId });
    if (!faq || faq.embeddingStatus === "ready" || !faq.intent) return;

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
