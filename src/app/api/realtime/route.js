import { primaryPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isAlive = true;

      const sendEvent = (event, data) => {
        if (!isAlive) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch (err) {
          isAlive = false;
        }
      };

      // Send initial connection ACK
      sendEvent("connected", { message: "Realtime Live Feed Connected", timestamp: new Date().toISOString() });

      // Poll every 30 seconds for live status keep-alive heartbeat
      const interval = setInterval(() => {
        if (!isAlive) {
          clearInterval(interval);
          return;
        }

        try {
          sendEvent("heartbeat", {
            timestamp: new Date().toISOString(),
            status: "online",
          });
        } catch (err) {
          sendEvent("error", { message: err.message });
        }
      }, 30000);

      req.signal.addEventListener("abort", () => {
        isAlive = false;
        clearInterval(interval);
        try {
          controller.close();
        } catch (_) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
