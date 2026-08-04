import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/assistant/turn")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { applyVisitorCookie, hasValidRequestOrigin, routeAssistantTurn } =
          await import("@/server/assistant-backend.server");
        if (!hasValidRequestOrigin(request))
          return Response.json(
            { message: "Request origin is not allowed." },
            { status: 403 },
          );

        const body = (await request.json().catch(() => null)) as {
          question?: unknown;
        } | null;
        if (
          typeof body?.question !== "string" ||
          !body.question.trim() ||
          body.question.length > 500
        )
          return Response.json({ message: "Invalid question." }, { status: 400 });

        try {
          const { result, cookie } = await routeAssistantTurn(
            request,
            body.question.trim(),
          );
          const headers = new Headers({ "Cache-Control": "no-store" });
          applyVisitorCookie(headers, cookie);
          return Response.json(result, { headers });
        } catch (error) {
          console.error(
            "Assistant turn routing failed",
            error instanceof Error ? error.message : "Error",
          );
          return Response.json(
            { message: "AI assistant is temporarily unavailable." },
            { status: 503 },
          );
        }
      },
    },
  },
});
