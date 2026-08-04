import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/assistant/initialize")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { applyVisitorCookie, hasValidRequestOrigin, initializeAssistant } =
          await import("@/server/assistant-backend.server");
        if (!hasValidRequestOrigin(request))
          return Response.json(
            { message: "Request origin is not allowed." },
            { status: 403 },
          );

        try {
          const { cookie, ...assistant } = await initializeAssistant(request);
          const headers = new Headers({ "Cache-Control": "no-store" });
          applyVisitorCookie(headers, cookie);
          return Response.json(assistant, { headers });
        } catch (error) {
          console.error(
            "Assistant initialization failed",
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
