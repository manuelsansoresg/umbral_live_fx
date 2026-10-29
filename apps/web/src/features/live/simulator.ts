import type { EffectPreset } from "./settings";

export type GiftEffect = "apparition" | "bloodmoon" | "embers" | "glitch" | "portal" | "fog" | "blood" | "spectral" | "wraith";
export type SimulatedGift = {
  id: string;
  name: string;
  sender: string;
  effect: GiftEffect;
  timestamp: number;
  preset?: EffectPreset;
  volume?: number;
};
export const LIVE_CHANNEL = "umbral-live-fx-preview-v1";
export const DEMO_GIFTS: { id: string; name: string; effect: GiftEffect; symbol: string; description: string }[] = [
  { id: "rose", name: "Rosa", effect: "embers", symbol: "✦", description: "Lluvia de brasas" },
  { id: "heart", name: "Corazón", effect: "bloodmoon", symbol: "◉", description: "Luna de sangre" },
  { id: "ghost", name: "Fantasma", effect: "apparition", symbol: "♱", description: "Aparición espectral" },
  { id: "crown", name: "Corona", effect: "glitch", symbol: "♛", description: "Interferencia paranormal" },
];
export const RELAY_KEY = "umbral-live-fx-relay-channel-v1";
export function getRelayChannel(): string {
  if (typeof window === "undefined") return "";
  let channel = localStorage.getItem(RELAY_KEY);
  if (!channel || !/^[a-f0-9-]{36}$/.test(channel)) {
    channel = crypto.randomUUID();
    localStorage.setItem(RELAY_KEY, channel);
  }
  return channel;
}
export type RelayDelivery = { connected: number; sequence: number } | { error: string };
async function sendToRelay(message: { type: "gift"; gift: SimulatedGift } | { type: "stop" }): Promise<RelayDelivery> {
  try {
    const channel = getRelayChannel();
    if (!channel) return { error: "Canal no disponible" };
    const result = await fetch("/api/live/publish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel, ...message }) });
    if (!result.ok) return { error: `Servidor HTTP ${result.status}` };
    return await result.json() as RelayDelivery;
  } catch (error) { console.warn("Umbral LIVE FX: relay unavailable, local fallback remains active", error); return { error: "No se pudo conectar con Next.js" }; }
}
export function broadcastGift(gift: SimulatedGift): Promise<RelayDelivery> {
  if (typeof window === "undefined") return Promise.resolve({ error: "Sin ventana" });
  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(LIVE_CHANNEL);
    channel.postMessage(gift);
    channel.close();
  }
  return sendToRelay({ type: "gift", gift });
}
export function stopPreview(): void {
  if (typeof window === "undefined") return;
  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(LIVE_CHANNEL);
    channel.postMessage({ type: "stop-preview" });
    channel.close();
  }
  void sendToRelay({ type: "stop" });
}
export function isSimulatedGift(value: unknown): value is SimulatedGift {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SimulatedGift>;
  return typeof candidate.id === "string" && typeof candidate.name === "string" &&
    typeof candidate.sender === "string" && typeof candidate.timestamp === "number" &&
    ["apparition", "bloodmoon", "embers", "glitch", "portal", "fog", "blood", "spectral", "wraith"].includes(candidate.effect ?? "") &&
    (candidate.volume === undefined || (typeof candidate.volume === "number" && Number.isFinite(candidate.volume) && candidate.volume >= 0 && candidate.volume <= 100));
}
