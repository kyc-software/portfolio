import assert from "node:assert/strict";
import test from "node:test";
import { cosineSimilarity } from "../convex/embeddings.ts";
import { hasPortfolioReferent, hasSemanticSignal } from "../convex/routing.ts";
import {
  isVoiceFiller,
  normalizeAssistantQuestion,
  WHO_ARE_YOU_ALIASES,
  WHO_ARE_YOU_ANSWER,
} from "../src/lib/assistant-copy.ts";
import {
  INITIAL_GREETING,
  isLikelyEcho,
  parseRealtimeEvent,
} from "../src/lib/realtime.ts";
import { DEFAULT_REALTIME_MODEL, isRealtimeModel } from "../src/lib/realtime-models.ts";
import { takeSessionSlot } from "../src/lib/realtime-rate-limit.ts";

test("uses fixed opening greeting", () => {
  assert.equal(
    INITIAL_GREETING,
    "Hello, I'm Anthony's AI assistant, what can I do for you ?",
  );
});

test("ignores microphone fillers without hiding real short questions", () => {
  assert.equal(isVoiceFiller("Mhm."), true);
  assert.equal(isVoiceFiller(" uh-huh "), true);
  assert.equal(isVoiceFiller("React?"), false);
  assert.equal(isVoiceFiller("Who are you?"), false);
});

test("matches only normalized seeded identity questions", () => {
  assert.equal(normalizeAssistantQuestion("  Who are YOU?!  "), "who are you");
  assert.equal(
    WHO_ARE_YOU_ALIASES.includes(normalizeAssistantQuestion("Who are you ?")),
    true,
  );
  assert.equal(
    WHO_ARE_YOU_ALIASES.includes(
      normalizeAssistantQuestion("Who is Anthony as an engineer?"),
    ),
    false,
  );
  assert.equal(
    WHO_ARE_YOU_ANSWER,
    "I am Anthony's AI assistant and I am here to answer your question about his experiences.",
  );
});

test("parses transcript, lifecycle, and end events", () => {
  assert.deepEqual(
    parseRealtimeEvent(
      JSON.stringify({
        type: "conversation.item.input_audio_transcription.delta",
        item_id: "item-1",
        delta: "Has Anthony",
      }),
    ),
    [{ type: "user-delta", itemId: "item-1", text: "Has Anthony" }],
  );
  assert.deepEqual(
    parseRealtimeEvent(
      JSON.stringify({
        type: "conversation.item.input_audio_transcription.completed",
        item_id: "item-1",
        transcript: "Has Anthony used Next.js?",
      }),
    ),
    [
      {
        type: "user-done",
        itemId: "item-1",
        text: "Has Anthony used Next.js?",
      },
    ],
  );
  assert.deepEqual(
    parseRealtimeEvent(JSON.stringify({ type: "output_audio_buffer.started" })),
    [{ type: "audio-started" }],
  );
  assert.deepEqual(
    parseRealtimeEvent(JSON.stringify({ type: "output_audio_buffer.stopped" })),
    [{ type: "audio-stopped" }],
  );
  assert.deepEqual(
    parseRealtimeEvent(
      JSON.stringify({
        type: "response.done",
        response: {
          status: "completed",
          output: [{ type: "function_call", name: "end_conversation" }],
        },
      }),
    ),
    [{ type: "response-done", status: "completed" }, { type: "end-conversation" }],
  );
  assert.deepEqual(parseRealtimeEvent("not json"), []);
});

test("distinguishes assistant echo from a real interruption", () => {
  const assistant = "Anthony has worked as a software engineer for about ten years.";
  assert.equal(isLikelyEcho("worked as a software engineer", assistant), true);
  assert.equal(isLikelyEcho("Anthony software engineer ten years", assistant), true);
  assert.equal(isLikelyEcho("Wait, tell me about his coaching work", assistant), false);
  assert.equal(isLikelyEcho("stop", assistant), false);
});

test("limits repeated session creation inside one window", () => {
  const key = `test-${Date.now()}`;
  assert.equal(takeSessionSlot(key, 1), true);
  assert.equal(takeSessionSlot(key, 2), true);
  assert.equal(takeSessionSlot(key, 3), true);
  assert.equal(takeSessionSlot(key, 4), true);
  assert.equal(takeSessionSlot(key, 5), false);
  assert.equal(takeSessionSlot(key, 10 * 60 * 1000 + 1), true);
});

test("accepts only supported realtime models", () => {
  assert.equal(DEFAULT_REALTIME_MODEL, "gpt-realtime-2.1-mini");
  assert.equal(isRealtimeModel("gpt-realtime-2.1"), true);
  assert.equal(isRealtimeModel("gpt-5.6-sol"), false);
  assert.equal(isRealtimeModel(null), false);
});

test("compares embeddings with cosine similarity", () => {
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
  assert.equal(cosineSimilarity([1], [1, 0]), -1);
});

test("requires portfolio subject and FAQ intent signals", () => {
  assert.equal(hasPortfolioReferent("tell me about tony s recent work"), true);
  assert.equal(hasPortfolioReferent("what are his recent projects"), true);
  assert.equal(hasPortfolioReferent("how does he work"), true);
  assert.equal(hasPortfolioReferent("tell me about him"), true);
  assert.equal(hasPortfolioReferent("how does next js routing work"), false);
  assert.equal(
    hasSemanticSignal("tell me about tony s latest project", ["latest project"]),
    true,
  );
  assert.equal(
    hasSemanticSignal("what was anthony s latest role", ["latest project"]),
    false,
  );
});
