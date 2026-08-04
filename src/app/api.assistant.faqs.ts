import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/assistant/faqs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { hasValidRequestOrigin, listFreeQuestions } = await import(
          "@/server/assistant-backend.server"
        );
        if (!hasValidRequestOrigin(request))
          return Response.json(
            { message: "Request origin is not allowed." },
            { status: 403 },
          );

        try {
          const questions = await listFreeQuestions();
          return Response.json(
            { questions },
            { headers: { "Cache-Control": "private, max-age=300" } },
          );
        } catch (error) {
          console.error(
            "Assistant FAQ listing failed",
            error instanceof Error ? error.message : "Error",
          );
          return Response.json(
            { message: "Prepared questions are temporarily unavailable." },
            { status: 503 },
          );
        }
      },
    },
  },
});
