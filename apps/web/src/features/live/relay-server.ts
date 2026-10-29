import "server-only";
import type { SimulatedGift } from "./simulator";

type RelayMessage = { type: "gift"; gift: SimulatedGift } | { type: "stop" };
type Listener = (message: RelayMessage) => void;
const globalRelay = globalThis as typeof globalThis & { __umbralRelay?: Map<string, Set<Listener>> };
const subscribers = globalRelay.__umbralRelay ??= new Map<string, Set<Listener>>();

export const validChannel = (value: string | null): value is string =>
  !!value && /^[a-f0-9-]{36}$/.test(value);
export function subscribe(channel: string, listener: Listener) {
  let listeners = subscribers.get(channel);
  if (!listeners) { listeners = new Set(); subscribers.set(channel, listeners); }
  listeners.add(listener);
  return () => {
    listeners?.delete(listener);
    if (listeners?.size === 0) subscribers.delete(channel);
  };
}
export function publish(channel: string, message: RelayMessage) {
  const listeners = subscribers.get(channel);
  if (!listeners) return 0;
  for (const listener of listeners) listener(message);
  return listeners.size;
}
