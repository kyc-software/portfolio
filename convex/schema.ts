import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  visitors: defineTable({
    token: v.string(),
    used: v.number(),
    windowStartedAt: v.number(),
    updatedAt: v.number(),
  }).index("by_token", ["token"]),

  faqs: defineTable({
    key: v.string(),
    sortOrder: v.optional(v.number()),
    question: v.optional(v.string()),
    answer: v.string(),
    aliases: v.array(v.string()),
    intent: v.optional(v.string()),
    matchSignals: v.optional(v.array(v.string())),
    audioStatus: v.union(v.literal("pending"), v.literal("ready"), v.literal("failed")),
    audioStorageId: v.optional(v.id("_storage")),
    embeddingStatus: v.optional(
      v.union(v.literal("pending"), v.literal("ready"), v.literal("failed")),
    ),
    embeddingVersion: v.optional(v.string()),
    embedding: v.optional(v.array(v.float64())),
    source: v.optional(v.union(v.literal("seeded"), v.literal("candidate"))),
    active: v.optional(v.boolean()),
    learnedAliases: v.optional(v.array(v.string())),
    candidateId: v.optional(v.id("candidates")),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  assistantConfig: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  candidates: defineTable({
    normalizedQuestion: v.string(),
    question: v.string(),
    answer: v.string(),
    occurrences: v.number(),
    uniqueVisitors: v.optional(v.number()),
    visitorTokens: v.optional(v.array(v.string())),
    variants: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(
        v.literal("collecting"),
        v.literal("queued"),
        v.literal("preparing"),
        v.literal("ready_for_review"),
        v.literal("published"),
        v.literal("rejected"),
        v.literal("failed"),
        v.literal("rolled_back"),
      ),
    ),
    embedding: v.optional(v.array(v.float64())),
    embeddingVersion: v.optional(v.string()),
    profileVersion: v.optional(v.string()),
    preparationCountedAt: v.optional(v.number()),
    attempts: v.optional(v.number()),
    lastError: v.optional(v.string()),
    proposal: v.optional(
      v.object({
        canonicalQuestion: v.string(),
        answer: v.string(),
        intent: v.string(),
        aliases: v.array(v.string()),
        matchSignals: v.array(v.string()),
        evidence: v.array(v.string()),
        existingFaqKey: v.string(),
      }),
    ),
    stagedAudioStorageId: v.optional(v.id("_storage")),
    stagedEmbedding: v.optional(v.array(v.float64())),
    publishedFaqKey: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_question", ["normalizedQuestion"])
    .index("by_status", ["status"]),

  candidateOccurrences: defineTable({
    visitorToken: v.string(),
    normalizedQuestion: v.string(),
    question: v.string(),
    answer: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("clustered"),
      v.literal("discarded"),
      v.literal("failed"),
    ),
    attempts: v.number(),
    candidateId: v.optional(v.id("candidates")),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"]),
});
