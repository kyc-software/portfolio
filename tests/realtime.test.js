import assert from "node:assert/strict";
import test from "node:test";
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

test("parses transcript, lifecycle, and end events", () => {
  assert.deepEqual(
    parseRealtimeEvent(
      JSON.stringify({
        type: "conversation.item.input_audio_transcription.completed",
        transcript: "Has Anthony used Next.js?",
      }),
    ),
    [{ type: "user-done", text: "Has Anthony used Next.js?" }],
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
