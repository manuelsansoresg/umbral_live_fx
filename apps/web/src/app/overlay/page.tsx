"use client";

import { useEffect, useRef, useState } from "react";
import { CinematicEffect } from "@/components/fx/cinematic-effect";
import { getRelayChannel, isSimulatedGift, LIVE_CHANNEL, type SimulatedGift } from "@/features/live/simulator";
import { readSettings, resolvePreset } from "@/features/live/settings";
import { playAudioTest, playEffectSound, stopEffectSound, unlockAudio } from "@/features/live/audio";

type ActiveEvent = SimulatedGift & { preset: NonNullable<SimulatedGift["preset"]> };

export default function OverlayPage() {
  const [gift, setGift] = useState<ActiveEvent | null>(null);
  const [ready, setReady] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioMessage, setAudioMessage] = useState("");
  const [showStatus, setShowStatus] = useState(false);
  const [debugAudio, setDebugAudio] = useState(false);
  const queue = useRef<ActiveEvent[]>([]);
  const active = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextRef = useRef<() => void>(() => {});
  const seen = useRef<Set<string>>(new Set());
  nextRef.current = () => {
    const next = queue.current.shift();
    if (!next) { active.current = false; setGift(null); stopEffectSound(); return; }
    active.current = true;
    setGift(next);
    if (next.preset.sound) {
      const volume = readSettings().masterVolume;
      if (!playEffectSound(next.preset.effect, volume)) setAudioMessage(volume === 0 ? "El volumen general está en 0%." : "Audio bloqueado: pulsa Probar sonido.");
      else setAudioMessage("");
    } else setAudioMessage("El sonido de este efecto está desactivado en Animaciones.");
    timer.current = setTimeout(() => {
      setGift(null);
      // Separate animation frames ensure React remounts the next scene.
      timer.current = setTimeout(() => nextRef.current(), 80);
    }, Math.min(12, Math.max(2, next.preset.duration)) * 1000);
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowStatus(params.get("status") !== "0" && params.get("preview") === "1");
    setDebugAudio(params.get("debug") === "1");
    // Try to resume if autoplay is permitted; embedded browsers may still block it.
    void unlockAudio().then(setAudioEnabled);
    let channel: BroadcastChannel | null = null;
    const stop = () => {
      queue.current = []; active.current = false; stopEffectSound();
      if (timer.current) clearTimeout(timer.current);
      setGift(null);
    };
    const onGift = (incoming: SimulatedGift) => {
      if (seen.current.has(incoming.id)) return;
      seen.current.add(incoming.id);
      if (seen.current.size > 200) seen.current.clear();
      const preset = incoming.preset ?? resolvePreset(readSettings(), "unknown");
      const event: ActiveEvent = { ...incoming, effect: preset.effect, preset };
      if (queue.current.length >= 25) queue.current.shift();
      queue.current.push(event);
      if (!active.current) nextRef.current();
    };
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(LIVE_CHANNEL);
      channel.onmessage = (message: MessageEvent<unknown>) => {
        if (message.data && typeof message.data === "object" && "type" in message.data && message.data.type === "stop-preview") { stop(); return; }
        if (isSimulatedGift(message.data)) onGift(message.data);
      };
    }
    const relayId = params.get("channel") || getRelayChannel();
    const source = relayId && /^[a-f0-9-]{36}$/.test(relayId)
      ? new EventSource(`/api/live/events?channel=${encodeURIComponent(relayId)}`) : null;
    if (source) {
      source.onopen = () => setReady(true);
      source.onmessage = (event: MessageEvent<string>) => {
        try {
          const message: unknown = JSON.parse(event.data);
          if (!message || typeof message !== "object") return;
          const payload = message as { type?: unknown; gift?: unknown };
          if (payload.type === "stop") stop();
          else if (payload.type === "gift" && isSimulatedGift(payload.gift)) onGift(payload.gift);
        } catch { /* Ignore invalid relay messages */ }
      };
      source.onerror = () => setReady(false);
    }
    return () => { source?.close(); channel?.close(); queue.current = []; stopEffectSound(); if (timer.current) clearTimeout(timer.current); };
  }, []);
  const placement = gift?.preset.position === "top" ? "flex-start" : gift?.preset.position === "bottom" ? "flex-end" : "center";
  return <main aria-label="Overlay transparente de Umbral LIVE FX" className="pointer-events-none relative flex min-h-dvh items-center justify-center overflow-hidden bg-transparent">
    {debugAudio && <div className="pointer-events-auto absolute right-4 top-4 z-50 flex max-w-64 flex-col items-end gap-2">
      <button type="button" onClick={async () => {
        const unlocked = await unlockAudio();
        setAudioEnabled(unlocked);
        const audible = unlocked && playAudioTest(80);
        setAudioMessage(audible ? "Prueba de tres tonos enviada. Si no suena, revisa el volumen del dispositivo o la pestaña silenciada." : "El navegador no permitió iniciar Web Audio.");
      }} className="rounded-lg border border-white/20 bg-black/80 px-4 py-2 text-xs font-semibold text-white hover:bg-black">{audioEnabled ? "Probar sonido otra vez" : "Activar y probar sonido"}</button>
      {audioMessage && <p role="status" className="rounded-lg bg-black/80 p-3 text-right text-xs leading-5 text-white/80">{audioMessage}</p>}
    </div>}
    {!gift && showStatus && <p className="absolute bottom-5 left-5 rounded-md bg-black/60 px-3 py-2 text-xs text-white/70">{ready ? "Overlay listo · esperando regalo simulado" : "El navegador no admite BroadcastChannel"}</p>}
    {gift && <div key={gift.id} role="status" aria-live="polite" className="relative w-full max-w-5xl" style={{ height: "min(80dvh, 760px)", alignSelf: placement }}>
      <CinematicEffect preset={gift.preset} sender={gift.sender} giftName={gift.name} />
    </div>}
  </main>;
}
