import "@tanstack/react-start/server-only";

const VISITOR_COOKIE = import.meta.env.DEV ? "anthony-visitor" : "__Host-anthony-visitor";
const VISITOR_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

export type AssistantTurn =
  | {
      kind: "cached";
      match: "exact" | "semantic";
      answer: string;
      audioUrl: string | null;
      remaining: number;
    }
  | { kind: "realtime"; remaining: number }
  | { kind: "limited"; remaining: 0 };

export type FreeQuestion = { key: string; question: string };

function visitorCookie(request: Request) {
  const cookies = request.headers.get("cookie")?.split(";") ?? [];
  for (const cookie of cookies) {
    const [name, ...value] = cookie.trim().split("=");
    if (name !== VISITOR_COOKIE) continue;
    const token = decodeURIComponent(value.join("="));
    if (/^[0-9a-f-]{36}$/.test(token)) return { token, header: null };
  }

  const token = crypto.randomUUID();
  const secure = import.meta.env.DEV ? "" : "; Secure";
  return {
    token,
    header: `${VISITOR_COOKIE}=${token}; Path=/; Max-Age=${VISITOR_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure}`,
  };
}

function bridgeConfiguration() {
  const siteUrl = process.env.CONVEX_SITE_URL ?? process.env.VITE_CONVEX_SITE_URL;
  const secret = process.env.CONVEX_BRIDGE_SECRET;
  if (!siteUrl || !secret) return null;
  if (!/^https:\/\/[-a-z0-9]+\.convex\.site$/.test(siteUrl))
    throw new Error("Invalid CONVEX_SITE_URL");
  return { siteUrl, secret };
}

async function callConvex<T>(path: string, body: unknown): Promise<T> {
  const configuration = bridgeConfiguration();
  if (!configuration) throw new Error("Convex assistant backend is not configured");

  const response = await fetch(`${configuration.siteUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${configuration.secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok)
    throw new Error(`Convex assistant backend failed: ${response.status}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function initializeAssistant(request: Request) {
  const visitor = visitorCookie(request);
  try {
    const result = await callConvex<{
      remaining: number;
      greeting: { answer: string; audioUrl: string | null } | null;
    }>("/assistant/initialize", { visitorToken: visitor.token });
    return { ...result, cookie: visitor.header };
  } catch (error) {
    if (!import.meta.env.DEV) throw error;
    console.warn(
      "Convex assistant backend unavailable in development",
      error instanceof Error ? error.message : "Error",
    );
    return { remaining: 10, greeting: null, cookie: visitor.header };
  }
}

export async function routeAssistantTurn(request: Request, question: string) {
  const visitor = visitorCookie(request);
  try {
    const result = await callConvex<AssistantTurn>("/assistant/turn", {
      visitorToken: visitor.token,
      question,
    });
    return { result, cookie: visitor.header };
  } catch (error) {
    if (!import.meta.env.DEV) throw error;
    console.warn(
      "Convex turn routing unavailable in development",
      error instanceof Error ? error.message : "Error",
    );
    return {
      result: { kind: "realtime", remaining: 10 } as const,
      cookie: visitor.header,
    };
  }
}

export async function recordAssistantCandidate(question: string, answer: string) {
  try {
    await callConvex("/assistant/candidate", { question, answer });
  } catch (error) {
    if (!import.meta.env.DEV) throw error;
    console.warn(
      "Convex candidate logging unavailable in development",
      error instanceof Error ? error.message : "Error",
    );
  }
}

export async function listFreeQuestions() {
  try {
    const result = await callConvex<{ questions: FreeQuestion[] }>("/assistant/faqs", {});
    return result.questions;
  } catch (error) {
    if (!import.meta.env.DEV) throw error;
    console.warn(
      "Convex FAQ listing unavailable in development",
      error instanceof Error ? error.message : "Error",
    );
    return [];
  }
}

export function applyVisitorCookie(headers: Headers, cookie: string | null) {
  if (cookie) headers.append("Set-Cookie", cookie);
}

export function hasValidRequestOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
