import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/realtime/session")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { createRealtimeSession } = await import(
          "@/server/realtime-session.server"
        );
        return createRealtimeSession(request);
      },
    },
  },
});
