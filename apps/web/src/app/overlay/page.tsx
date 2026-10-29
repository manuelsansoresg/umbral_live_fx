"use client";

import { useEffect, useRef, useState } from "react";
import { CinematicEffect } from "@/components/fx/cinematic-effect";
import { isSimulatedGift, LIVE_CHANNEL, type SimulatedGift } from "@/features/live/simulator";
import { readSettings, resolvePreset } from "@/features/live/settings";
import { playEffectSound, stopEffectSound, unlockAudio } from "@/features/live/audio";

type ActiveEvent = SimulatedGift & { preset: NonNullable<SimulatedGift["preset"]> };

export default function OverlayPage() {
  const [gift, setGift] = useState<ActiveEvent | null>(null);
  const [ready, setReady] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const queue = useRef<ActiveEvent[]>([]);
  const active = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextRef = useRef<() => void>(() => {});
  nextRef.current = () => {
    const next = queue.current.shift();
    if (!next) { active.current = false; setGift(null); stopEffectSound(); return; }
    active.current = true;
    setGift(next);
    if (next.preset.sound) playEffectSound(next.preset.effect, readSettings().masterVolume);
    timer.current = setTimeout(() => {
      setGift(null);
      // Separate animation frames ensure React remounts the next scene.
      timer.current = setTimeout(() => nextRef.current(), 80);
    }, Math.min(12, Math.max(2, next.preset.duration)) * 1000);
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowStatus(params.get("status") !== "0" && params.get("preview") === "1");
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(LIVE_CHANNEL);
    setReady(true);
    channel.onmessage = (message: MessageEvent<unknown>) => {
      if (message.data && typeof message.data === "object" && "type" in message.data && message.data.type === "stop-preview") {
        queue.current = []; active.current = false; stopEffectSound();
        if (timer.current) clearTimeout(timer.current);
        setGift(null); return;
      }
      if (!isSimulatedGift(message.data)) return;
      const incoming = message.data;
      const preset = incoming.preset ?? resolvePreset(readSettings(), "unknown");
      const event: ActiveEvent = { ...incoming, effect: preset.effect, preset };
      // Prevent the preview from becoming stuck under a burst of events.
      if (queue.current.length >= 25) queue.current.shift();
      queue.current.push(event);
      if (!active.current) nextRef.current();
    };
    return () => { channel.close(); queue.current = []; stopEffectSound(); if (timer.current) clearTimeout(timer.current); };
  }, []);
  const placement = gift?.preset.position === "top" ? "flex-start" : gift?.preset.position === "bottom" ? "flex-end" : "center";
  return <main aria-label="Overlay transparente de Umbral LIVE FX" className="pointer-events-none relative flex min-h-dvh items-center justify-center overflow-hidden bg-transparent">
    {!audioEnabled && <button type="button" onClick={async () => setAudioEnabled(await unlockAudio())} className="pointer-events-auto absolute right-4 top-4 z-50 rounded-lg border border-white/20 bg-black/70 px-4 py-2 text-xs font-semibold text-white hover:bg-black" title="Se requiere un clic para habilitar sonidos en este navegador">Activar sonido</button>}
    {!gift && showStatus && <p className="absolute bottom-5 left-5 rounded-md bg-black/60 px-3 py-2 text-xs text-white/70">{ready ? "Overlay listo · esperando regalo simulado" : "El navegador no admite BroadcastChannel"}</p>}
    {gift && <div key={gift.id} role="status" aria-live="polite" className="relative w-full max-w-5xl" style={{ height: "min(80dvh, 760px)", alignSelf: placement }}>
      <CinematicEffect preset={gift.preset} sender={gift.sender} giftName={gift.name} />
    </div>}
  </main>;
}
