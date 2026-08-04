import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

function authorized(request: Request) {
  const secret = process.env.BRIDGE_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

const initialize = httpAction(async (ctx, request) => {
  if (!authorized(request)) return json({ error: "Unauthorized" }, 401);
  const body = (await request.json().catch(() => null)) as {
    visitorToken?: unknown;
  } | null;
  if (typeof body?.visitorToken !== "string" || body.visitorToken.length > 100)
    return json({ error: "Invalid visitor" }, 400);

  const result = await ctx.runMutation(internal.assistant.initialize, {
    visitorToken: body.visitorToken,
  });
  if (!result.allowed) return json(result);

  const audioUrl = result.greeting?.audioStorageId
    ? await ctx.storage.getUrl(result.greeting.audioStorageId)
    : null;

  return json({
    allowed: true,
    remaining: result.remaining,
    greeting: result.greeting ? { answer: result.greeting.answer, audioUrl } : null,
  });
});

const session = httpAction(async (ctx, request) => {
  if (!authorized(request)) return json({ error: "Unauthorized" }, 401);
  const body = (await request.json().catch(() => null)) as {
    visitorToken?: unknown;
  } | null;
  if (typeof body?.visitorToken !== "string" || body.visitorToken.length > 100)
    return json({ error: "Invalid visitor" }, 400);

  return json(
    await ctx.runMutation(internal.assistant.limitSession, {
      visitorToken: body.visitorToken,
    }),
  );
});

const turn = httpAction(async (ctx, request) => {
  if (!authorized(request)) return json({ error: "Unauthorized" }, 401);
  const body = (await request.json().catch(() => null)) as {
    visitorToken?: unknown;
    question?: unknown;
  } | null;
  if (
    typeof body?.visitorToken !== "string" ||
    body.visitorToken.length > 100 ||
    typeof body.question !== "string" ||
    !body.question.trim() ||
    body.question.length > 500
  )
    return json({ error: "Invalid turn" }, 400);

  const result = await ctx.runAction(internal.routing.routeTurn, {
    visitorToken: body.visitorToken,
    question: body.question.trim(),
  });
  const audioUrl =
    result.kind === "cached" && result.audioStorageId
      ? await ctx.storage.getUrl(result.audioStorageId)
      : null;

  return json({ ...result, audioStorageId: undefined, audioUrl });
});

const candidate = httpAction(async (ctx, request) => {
  if (!authorized(request)) return json({ error: "Unauthorized" }, 401);
  const body = (await request.json().catch(() => null)) as {
    visitorToken?: unknown;
    question?: unknown;
    answer?: unknown;
  } | null;
  if (
    typeof body?.visitorToken !== "string" ||
    body.visitorToken.length > 100 ||
    typeof body?.question !== "string" ||
    !body.question.trim() ||
    body.question.length > 500 ||
    typeof body.answer !== "string" ||
    !body.answer.trim() ||
    body.answer.length > 2_000
  )
    return json({ error: "Invalid candidate" }, 400);

  await ctx.runMutation(internal.candidates.recordCandidate, {
    visitorToken: body.visitorToken,
    question: body.question.trim(),
    answer: body.answer.trim(),
  });
  return new Response(null, { status: 204 });
});

const faqs = httpAction(async (ctx, request) => {
  if (!authorized(request)) return json({ error: "Unauthorized" }, 401);
  const body = (await request.json().catch(() => null)) as {
    visitorToken?: unknown;
  } | null;
  if (typeof body?.visitorToken !== "string" || body.visitorToken.length > 100)
    return json({ error: "Invalid visitor" }, 400);

  const limit = await ctx.runMutation(internal.assistant.limitBrowse, {
    visitorToken: body.visitorToken,
  });
  if (!limit.ok) return json({ error: "Rate limited" }, 429);

  const questions = await ctx.runQuery(internal.assistant.freeQuestions, {});
  return json({ questions });
});

const http = httpRouter();
http.route({ path: "/assistant/initialize", method: "POST", handler: initialize });
http.route({ path: "/assistant/session", method: "POST", handler: session });
http.route({ path: "/assistant/turn", method: "POST", handler: turn });
http.route({ path: "/assistant/candidate", method: "POST", handler: candidate });
http.route({ path: "/assistant/faqs", method: "POST", handler: faqs });

export default http;
