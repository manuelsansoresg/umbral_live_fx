"use client";

import type { GiftEffect } from "@/features/live/simulator";

type AudioContextClass = typeof AudioContext;
let context: AudioContext | null = null;
let currentNodes: OscillatorNode[] = [];
const clamp = (n: number) => Math.min(1, Math.max(0, n));

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioClass: AudioContextClass | undefined = window.AudioContext;
  if (!AudioClass) return null;
  try { context ??= new AudioClass(); return context; } catch { return null; }
}

/** Must be called from a user gesture in browsers that restrict autoplay. */
export async function unlockAudio(): Promise<boolean> {
  const ctx = getContext();
  if (!ctx) return false;
  try { await ctx.resume(); return ctx.state === "running"; } catch { return false; }
}

export function stopEffectSound() {
  for (const oscillator of currentNodes) {
    try { oscillator.stop(); } catch { /* Already stopped */ }
    try { oscillator.disconnect(); } catch { /* Already disconnected */ }
  }
  currentNodes = [];
}

export function playEffectSound(effect: GiftEffect, volume: number): boolean {
  const ctx = getContext();
  if (!ctx || ctx.state !== "running" || volume <= 0) return false;
  stopEffectSound();
  const now = ctx.currentTime;
  const notes: Record<GiftEffect, [number, number, number, OscillatorType][]> = {
    portal: [[65, 110, 1.3, "sawtooth"], [130, 62, 1.7, "sine"]],
    bloodmoon: [[82, 54, 1.5, "triangle"], [41, 65, 1.8, "sine"]],
    fog: [[74, 56, 2, "sine"], [98, 71, 1.8, "triangle"]],
    apparition: [[420, 150, 1.2, "sine"], [106, 56, 1.5, "triangle"]],
    spectral: [[365, 112, 1.7, "sine"], [530, 175, 1.3, "sine"]],
    blood: [[110, 37, 1.1, "sawtooth"], [52, 46, 1.4, "triangle"]],
    embers: [[180, 70, .9, "triangle"], [280, 90, .7, "sine"]],
    glitch: [[230, 75, .22, "square"], [150, 410, .16, "sawtooth"], [340, 92, .27, "square"]],
  };
  try {
    notes[effect].forEach(([start, end, duration, type], index) => {
      const oscillator = ctx.createOscillator();
      const envelope = ctx.createGain();
      const lowpass = ctx.createBiquadFilter();
      const begin = now + index * 0.08;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(start, begin);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, end), begin + duration);
      lowpass.type = "lowpass";
      lowpass.frequency.value = 850;
      const gain = Math.min(0.14, clamp(volume / 100) * 0.12) / notes[effect].length;
      envelope.gain.setValueAtTime(0.0001, begin);
      envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), begin + 0.04);
      envelope.gain.exponentialRampToValueAtTime(0.0001, begin + duration);
      oscillator.connect(lowpass);
      lowpass.connect(envelope);
      envelope.connect(ctx.destination);
      oscillator.onended = () => {
        oscillator.disconnect(); envelope.disconnect(); lowpass.disconnect();
        currentNodes = currentNodes.filter((node) => node !== oscillator);
      };
      oscillator.start(begin);
      oscillator.stop(begin + duration + 0.02);
      currentNodes.push(oscillator);
    });
    return true;
  } catch { stopEffectSound(); return false; }
}
