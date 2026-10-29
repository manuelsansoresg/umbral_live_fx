import { readSince, validChannel } from "@/features/live/relay-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Same-process development fallback when an embedded browser loses its SSE connection. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const channel = params.get("channel");
  if (!validChannel(channel)) return Response.json({ error: "Canal inválido" }, { status: 400 });
  const since = Math.max(0, Number(params.get("since")) || 0);
  return Response.json(readSince(channel, since), {
    headers: { "Cache-Control": "no-store" },
  });
}
