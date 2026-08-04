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
    updatedAt: v.number(),
  }).index("by_question", ["normalizedQuestion"]),
});
