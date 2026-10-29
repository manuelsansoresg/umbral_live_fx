import { subscribe, validChannel } from "@/features/live/relay-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const channel = url.searchParams.get("channel");
  if (!validChannel(channel)) return Response.json({ error: "Canal inválido" }, { status: 400 });
  const encoder = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      const write = (value: string) => {
        if (!closed) { try { controller.enqueue(encoder.encode(value)); } catch { closed = true; } }
      };
      write(": connected\n\n");
      const unsubscribe = subscribe(channel, (message) => write(`data: ${JSON.stringify(message)}\n\n`));
      const heartbeat = setInterval(() => write(": ping\n\n"), 15000);
      const abort = () => { if (closed) return; closed = true; clearInterval(heartbeat); unsubscribe(); try { controller.close(); } catch {} };
      request.signal.addEventListener("abort", abort, { once: true });
      cleanup = () => { request.signal.removeEventListener("abort", abort); abort(); };
    },
    cancel() { cleanup(); },
  });
  return new Response(stream, { headers: {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  } });
}
