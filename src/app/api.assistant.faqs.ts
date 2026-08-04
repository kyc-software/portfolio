import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/assistant/faqs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { applyVisitorCookie, hasValidRequestOrigin, listFreeQuestions } =
          await import("@/server/assistant-backend.server");
        if (!hasValidRequestOrigin(request))
          return Response.json(
            { message: "Request origin is not allowed." },
            { status: 403 },
          );

        try {
          const { questions, cookie } = await listFreeQuestions(request);
          const headers = new Headers({ "Cache-Control": "private, max-age=300" });
          applyVisitorCookie(headers, cookie);
          return Response.json({ questions }, { headers });
        } catch (error) {
          console.error(
            "Assistant FAQ listing failed",
            error instanceof Error ? error.message : "Error",
          );
          return Response.json(
            { message: "Curated questions are temporarily unavailable." },
            { status: 503 },
          );
        }
      },
    },
  },
});
