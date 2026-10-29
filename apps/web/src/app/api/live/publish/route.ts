import { publish, validChannel } from "@/features/live/relay-server";
import { isSimulatedGift } from "@/features/live/simulator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return Response.json({ error: "Origen no autorizado" }, { status: 403 });
  }
  if (Number(request.headers.get("content-length")) > 12000) {
    return Response.json({ error: "Solicitud demasiado grande" }, { status: 413 });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON inválido" }, { status: 400 }); }
  if (!body || typeof body !== "object") return Response.json({ error: "Datos inválidos" }, { status: 400 });
  const data = body as Record<string, unknown>;
  if (typeof data.channel !== "string" || !validChannel(data.channel)) return Response.json({ error: "Canal inválido" }, { status: 400 });
  if (data.type === "stop") return Response.json(publish(data.channel, { type: "stop" }));
  if (data.type !== "gift" || !isSimulatedGift(data.gift)) return Response.json({ error: "Regalo inválido" }, { status: 400 });
  if (JSON.stringify(body).length > 12000) return Response.json({ error: "Solicitud demasiado grande" }, { status: 413 });
  const gift = data.gift;
  if (gift.sender.length > 80 || gift.name.length > 80 || (gift.preset && (
    typeof gift.preset.message !== "string" || gift.preset.message.length > 120 ||
    typeof gift.preset.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(gift.preset.color)
  ))) return Response.json({ error: "Regalo inválido" }, { status: 400 });
  return Response.json(publish(data.channel, { type: "gift", gift }));
}
