import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/assistant/candidate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { hasValidRequestOrigin, recordAssistantCandidate } = await import(
          "@/server/assistant-backend.server"
        );
        if (!hasValidRequestOrigin(request)) return new Response(null, { status: 403 });

        const body = (await request.json().catch(() => null)) as {
          question?: unknown;
          answer?: unknown;
        } | null;
        if (
          typeof body?.question !== "string" ||
          !body.question.trim() ||
          body.question.length > 500 ||
          typeof body.answer !== "string" ||
          !body.answer.trim() ||
          body.answer.length > 2_000
        )
          return new Response(null, { status: 400 });

        try {
          await recordAssistantCandidate(body.question.trim(), body.answer.trim());
          return new Response(null, { status: 204 });
        } catch (error) {
          console.error(
            "Assistant candidate logging failed",
            error instanceof Error ? error.message : "Error",
          );
          return new Response(null, { status: 503 });
        }
      },
    },
  },
});
