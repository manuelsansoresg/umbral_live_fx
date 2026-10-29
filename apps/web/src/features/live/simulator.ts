export type GiftEffect = "apparition" | "bloodmoon" | "embers" | "glitch";
export type SimulatedGift = {
  id: string;
  name: string;
  sender: string;
  effect: GiftEffect;
  timestamp: number;
};
export const LIVE_CHANNEL = "umbral-live-fx-preview-v1";
export const DEMO_GIFTS: { id: string; name: string; effect: GiftEffect; symbol: string; description: string }[] = [
  { id: "rose", name: "Rosa", effect: "embers", symbol: "✦", description: "Lluvia de brasas" },
  { id: "heart", name: "Corazón", effect: "bloodmoon", symbol: "◉", description: "Luna de sangre" },
  { id: "ghost", name: "Fantasma", effect: "apparition", symbol: "♱", description: "Aparición espectral" },
  { id: "crown", name: "Corona", effect: "glitch", symbol: "♛", description: "Interferencia paranormal" },
];
export function broadcastGift(gift: SimulatedGift): void {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
  const channel = new BroadcastChannel(LIVE_CHANNEL);
  channel.postMessage(gift);
  channel.close();
}
export function isSimulatedGift(value: unknown): value is SimulatedGift {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SimulatedGift>;
  return typeof candidate.id === "string" && typeof candidate.name === "string" &&
    typeof candidate.sender === "string" && typeof candidate.timestamp === "number" &&
    ["apparition", "bloodmoon", "embers", "glitch"].includes(candidate.effect ?? "");
}
