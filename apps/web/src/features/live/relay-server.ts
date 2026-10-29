import "server-only";
import type { SimulatedGift } from "./simulator";

type RelayMessage = { type: "gift"; gift: SimulatedGift } | { type: "stop" };
type Listener = (message: RelayMessage) => void;
type StoredMessage = { sequence: number; timestamp: number; message: RelayMessage };
type RelayState = {
  subscribers: Map<string, Set<Listener>>;
  history: Map<string, StoredMessage[]>;
  sequence: number;
};
const root = globalThis as typeof globalThis & { __umbralRelayState?: RelayState };
const state = root.__umbralRelayState ??= {
  subscribers: new Map<string, Set<Listener>>(),
  history: new Map<string, StoredMessage[]>(),
  sequence: 0,
};
export const validChannel = (value: string | null): value is string =>
  !!value && /^[a-f0-9-]{36}$/.test(value);

export function subscribe(channel: string, listener: Listener) {
  let listeners = state.subscribers.get(channel);
  if (!listeners) { listeners = new Set(); state.subscribers.set(channel, listeners); }
  listeners.add(listener);
  return () => {
    listeners?.delete(listener);
    if (listeners?.size === 0) state.subscribers.delete(channel);
  };
}

export function publish(channel: string, message: RelayMessage) {
  const timestamp = Date.now();
  const queue = (state.history.get(channel) ?? []).filter(item => timestamp - item.timestamp < 60000);
  const sequence = ++state.sequence;
  queue.push({ sequence, timestamp, message });
  state.history.set(channel, queue.slice(-40));
  const listeners = state.subscribers.get(channel);
  for (const listener of listeners ?? []) {
    try { listener(message); } catch { /* Do not block other listeners */ }
  }
  return { connected: listeners?.size ?? 0, sequence };
}

export function readSince(channel: string, since: number) {
  const timestamp = Date.now();
  const history = (state.history.get(channel) ?? []).filter(item => timestamp - item.timestamp < 60000);
  if (history.length) state.history.set(channel, history);
  else state.history.delete(channel);
  return { events: history.filter(item => item.sequence > since).slice(-40), sequence: state.sequence };
}
