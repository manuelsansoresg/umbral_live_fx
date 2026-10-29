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
    portal: [[240, 480, 1.8, "sawtooth"], [350, 220, 2.2, "sine"]],
    bloodmoon: [[310, 170, 2.1, "triangle"], [440, 250, 1.8, "sine"]],
    fog: [[340, 190, 2.5, "triangle"], [480, 330, 2.2, "sine"]],
    apparition: [[620, 210, 2.3, "sine"], [380, 520, 2.4, "triangle"]],
    spectral: [[540, 240, 2.5, "sine"], [410, 610, 2.2, "triangle"]],
    blood: [[380, 160, 1.6, "sawtooth"], [290, 210, 1.8, "triangle"]],
    embers: [[530, 270, 1.6, "triangle"], [720, 390, 1.4, "sine"]],
    glitch: [[580, 320, .3, "square"], [760, 440, .28, "sawtooth"], [900, 510, .32, "square"]],
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
      lowpass.frequency.value = 1800;
      const gain = Math.min(0.22, clamp(volume / 100) * 0.22) / Math.sqrt(notes[effect].length);
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

/** Audible diagnostic tone, independent of the selected gift's sound switch. */
export function playAudioTest(volume = 65): boolean {
  const ctx = getContext();
  if (!ctx || ctx.state !== "running") return false;
  stopEffectSound();
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  const now = ctx.currentTime;
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, now);
  oscillator.frequency.setValueAtTime(660, now + 0.2);
  oscillator.frequency.setValueAtTime(880, now + 0.4);
  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(Math.max(0.001, clamp(volume / 100) * 0.25), now + 0.03);
  envelope.gain.setValueAtTime(Math.max(0.001, clamp(volume / 100) * 0.25), now + 0.48);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
  oscillator.connect(envelope);
  envelope.connect(ctx.destination);
  oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); currentNodes = currentNodes.filter(n => n !== oscillator); };
  currentNodes.push(oscillator);
  oscillator.start(now);
  oscillator.stop(now + 0.7);
  return true;
}
