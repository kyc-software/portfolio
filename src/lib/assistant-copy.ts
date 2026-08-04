export const INITIAL_GREETING =
  "Hello, I'm Anthony's AI assistant, I can answer any question about his professional experiences, what would you like to know ?";

export const WHO_ARE_YOU_ANSWER =
  "I am Anthony's AI assistant and I am here to answer your question about his experiences.";

export const WHO_ARE_YOU_ALIASES = [
  "who are you",
  "what are you",
  "who is this",
  "tell me who you are",
  "what is your role",
  "are you anthony",
] as const;

export function normalizeAssistantQuestion(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const VOICE_FILLERS = new Set(["ah", "eh", "hm", "hmm", "mhm", "uh", "uh huh", "um"]);

export function isVoiceFiller(value: string) {
  return VOICE_FILLERS.has(normalizeAssistantQuestion(value));
}
