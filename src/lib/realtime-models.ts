export const REALTIME_MODELS = [
  {
    id: "gpt-realtime-2.1-mini",
    quality: "Great",
    cost: "$",
  },
  {
    id: "gpt-realtime-2.1",
    quality: "Best",
    cost: "$$$",
  },
] as const;

export type RealtimeModel = (typeof REALTIME_MODELS)[number]["id"];

export const DEFAULT_REALTIME_MODEL: RealtimeModel = "gpt-realtime-2.1-mini";

export function isRealtimeModel(value: string | null): value is RealtimeModel {
  return REALTIME_MODELS.some(({ id }) => id === value);
}
