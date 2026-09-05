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

      // Poll every 5 seconds for live status
      const interval = setInterval(async () => {
        if (!isAlive) {
          clearInterval(interval);
          return;
        }

        try {
          const userCount = await primaryPrisma.user.count().catch(() => 0);
          const jobCount = await primaryPrisma.job.count().catch(() => 0);
          const blogCount = await primaryPrisma.blogPost.count().catch(() => 0);

          sendEvent("heartbeat", {
            timestamp: new Date().toISOString(),
            metrics: { userCount, jobCount, blogCount },
          });
        } catch (err) {
          sendEvent("error", { message: err.message });
        }
      }, 5000);

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
