export type TranscriptEntry = {
  role: "user" | "assistant";
  text: string;
  source?: "faq";
  matchedBy?: "semantic";
};

export { INITIAL_GREETING } from "@/lib/assistant-copy";

export function assistantRateLimitMessage(retryAfter: number) {
  const seconds = Math.max(1, Math.min(60, Math.ceil(retryAfter / 1000)));
  return `You're asking too quickly. Try again in ${seconds} ${seconds === 1 ? "second" : "seconds"}.`;
}

export type RealtimeUiEvent =
  | { type: "speech-started" }
  | { type: "speech-stopped" }
  | { type: "assistant-delta"; text: string }
  | { type: "assistant-done"; text: string }
  | { type: "user-delta"; text: string; itemId?: string }
  | { type: "user-done"; text: string; itemId?: string }
  | { type: "response-started" }
  | { type: "response-done"; status?: string }
  | { type: "audio-started" }
  | { type: "audio-stopped" }
  | { type: "end-conversation" }
  | { type: "error"; message: string };

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : null;
}

function words(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function isLikelyEcho(input: string, assistantSpeech: string) {
  const inputWords = words(input);
  const assistantWords = new Set(words(assistantSpeech));
  if (inputWords.length === 0 || assistantWords.size === 0) return false;
  const overlap = inputWords.filter((word) => assistantWords.has(word)).length;
  return (
    overlap === inputWords.length ||
    (inputWords.length >= 4 && overlap / inputWords.length >= 0.75)
  );
}

export function parseRealtimeEvent(raw: string): RealtimeUiEvent[] {
  let event: UnknownRecord;
  try {
    event = JSON.parse(raw) as UnknownRecord;
  } catch {
    return [];
  }

  const type = event.type;
  if (type === "input_audio_buffer.speech_started") return [{ type: "speech-started" }];
  if (type === "input_audio_buffer.speech_stopped") return [{ type: "speech-stopped" }];
  if (type === "response.created") return [{ type: "response-started" }];
  if (type === "output_audio_buffer.started") return [{ type: "audio-started" }];
  if (type === "output_audio_buffer.stopped" || type === "output_audio_buffer.cleared")
    return [{ type: "audio-stopped" }];

  if (
    type === "response.output_audio_transcript.delta" ||
    type === "response.audio_transcript.delta"
  )
    return typeof event.delta === "string"
      ? [{ type: "assistant-delta", text: event.delta }]
      : [];

  if (
    type === "response.output_audio_transcript.done" ||
    type === "response.audio_transcript.done"
  )
    return typeof event.transcript === "string"
      ? [{ type: "assistant-done", text: event.transcript }]
      : [];

  if (type === "conversation.item.input_audio_transcription.delta")
    return typeof event.delta === "string"
      ? [
          {
            type: "user-delta",
            text: event.delta,
            ...(typeof event.item_id === "string" ? { itemId: event.item_id } : {}),
          },
        ]
      : [];

  if (type === "conversation.item.input_audio_transcription.completed")
    return typeof event.transcript === "string"
      ? [
          {
            type: "user-done",
            text: event.transcript,
            ...(typeof event.item_id === "string" ? { itemId: event.item_id } : {}),
          },
        ]
      : [];

  if (type === "error") {
    const error = record(event.error);
    return [
      {
        type: "error",
        message:
          typeof error?.message === "string"
            ? error.message
            : "AI assistant encountered an error.",
      },
    ];
  }

  if (type !== "response.done") return [];

  const response = record(event.response);
  const output = response?.output;
  const items = Array.isArray(output) ? output.map(record).filter(Boolean) : [];
  const shouldEnd = items.some(
    (item) => item?.type === "function_call" && item.name === "end_conversation",
  );
  return [
    {
      type: "response-done",
      status: typeof response?.status === "string" ? response.status : undefined,
    },
    ...(shouldEnd ? ([{ type: "end-conversation" }] as const) : []),
  ];
}
