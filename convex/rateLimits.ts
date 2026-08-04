import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";

import { components } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";

export const ASSISTANT_RATE_LIMITS = {
  turnPerVisitor: {
    kind: "token bucket",
    rate: 12,
    period: MINUTE,
    capacity: 2,
  },
  turnGlobal: {
    kind: "token bucket",
    rate: 300,
    period: MINUTE,
    capacity: 60,
    shards: 4,
  },
  sessionPerVisitor: {
    kind: "fixed window",
    rate: 4,
    period: 10 * MINUTE,
  },
  sessionGlobal: {
    kind: "token bucket",
    rate: 30,
    period: MINUTE,
    capacity: 10,
  },
  bootstrapPerVisitor: {
    kind: "fixed window",
    rate: 12,
    period: 10 * MINUTE,
  },
  bootstrapGlobal: {
    kind: "token bucket",
    rate: 60,
    period: MINUTE,
    capacity: 20,
  },
  browsePerVisitor: {
    kind: "token bucket",
    rate: 6,
    period: MINUTE,
    capacity: 2,
  },
  browseGlobal: {
    kind: "token bucket",
    rate: 120,
    period: MINUTE,
    capacity: 30,
    shards: 4,
  },
  candidatePerVisitor: {
    kind: "token bucket",
    rate: 10,
    period: HOUR,
    capacity: 3,
  },
  candidateGlobal: {
    kind: "token bucket",
    rate: 300,
    period: HOUR,
    capacity: 30,
    shards: 4,
  },
} as const;

const rateLimiter = new RateLimiter(components.rateLimiter, ASSISTANT_RATE_LIMITS);

async function consumePair(
  ctx: MutationCtx,
  key: string,
  perVisitor:
    | "turnPerVisitor"
    | "sessionPerVisitor"
    | "bootstrapPerVisitor"
    | "browsePerVisitor"
    | "candidatePerVisitor",
  global:
    | "turnGlobal"
    | "sessionGlobal"
    | "bootstrapGlobal"
    | "browseGlobal"
    | "candidateGlobal",
) {
  const visitor = await rateLimiter.limit(ctx, perVisitor, { key });
  if (!visitor.ok) return visitor;
  return rateLimiter.limit(ctx, global);
}

export function limitAssistantTurn(ctx: MutationCtx, visitorToken: string) {
  return consumePair(ctx, visitorToken, "turnPerVisitor", "turnGlobal");
}

export function limitAssistantSession(ctx: MutationCtx, visitorToken: string) {
  return consumePair(ctx, visitorToken, "sessionPerVisitor", "sessionGlobal");
}

export function limitAssistantBootstrap(ctx: MutationCtx, visitorToken: string) {
  return consumePair(ctx, visitorToken, "bootstrapPerVisitor", "bootstrapGlobal");
}

export function limitAssistantBrowse(ctx: MutationCtx, visitorToken: string) {
  return consumePair(ctx, visitorToken, "browsePerVisitor", "browseGlobal");
}

export function limitAssistantCandidate(ctx: MutationCtx, visitorToken: string) {
  return consumePair(ctx, visitorToken, "candidatePerVisitor", "candidateGlobal");
}
