"use client";

import type { GiftEffect } from "@/features/live/simulator";

let context: AudioContext | null = null;
let activeSources: AudioScheduledSourceNode[] = [];
const clamp = (value: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, value));

function getContext(): AudioContext | null {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  try { context ??= new AudioContext(); return context; } catch { return null; }
}

/** Browsers may require a user click to unlock the audio context. */
export async function unlockAudio(): Promise<boolean> {
  const ctx = getContext();
  if (!ctx) return false;
  try { await ctx.resume(); return ctx.state === "running"; } catch { return false; }
}

export function stopEffectSound() {
  for (const source of activeSources) {
    try { source.stop(); } catch { /* already stopped */ }
    try { source.disconnect(); } catch { /* already disconnected */ }
  }
  activeSources = [];
}

function register(source: AudioScheduledSourceNode) {
  activeSources.push(source);
  source.addEventListener("ended", () => {
    activeSources = activeSources.filter((item) => item !== source);
    try { source.disconnect(); } catch { /* already disconnected */ }
  }, { once: true });
}

function gainEnvelope(ctx: AudioContext, start: number, duration: number, peak: number) {
  const node = ctx.createGain();
  const end = start + duration;
  node.gain.setValueAtTime(0.0001, start);
  node.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), start + Math.min(0.13, duration * 0.16));
  node.gain.setTargetAtTime(0.0001, start + duration * 0.68, Math.max(0.08, duration * 0.11));
  node.gain.setValueAtTime(0.0001, end);
  node.connect(ctx.destination);
  return node;
}

function tone(ctx: AudioContext, now: number, startHz: number, endHz: number, duration: number, volume: number, type: OscillatorType = "sine", offset = 0) {
  const start = now + offset;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2400;
  const amp = gainEnvelope(ctx, start, duration, volume);
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(25, startHz), start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(25, endHz), start + duration);
  osc.connect(filter); filter.connect(amp);
  osc.start(start); osc.stop(start + duration);
  register(osc);
}

function noise(ctx: AudioContext, now: number, duration: number, volume: number, centerHz: number, offset = 0) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Noise is generated locally, never fetched from external audio libraries.
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass"; bandpass.frequency.value = centerHz; bandpass.Q.value = 0.55;
  const amp = gainEnvelope(ctx, now + offset, duration, volume);
  source.buffer = buffer; source.connect(bandpass); bandpass.connect(amp);
  source.start(now + offset); source.stop(now + offset + duration);
  register(source);
}

/** Procedural, original horror soundscapes; no licensed music or third-party files. */
export function playEffectSound(effect: GiftEffect, volume: number): boolean {
  const ctx = getContext();
  if (!ctx || ctx.state !== "running" || volume <= 0) return false;
  stopEffectSound();
  const now = ctx.currentTime + 0.01;
  // Cap the gain to prevent clipping in OBS; avoid sub-bass-only sounds.
  const level = clamp(volume / 100) * 0.24;
  try {
    switch (effect) {
      case "apparition":
      case "spectral":
        // A longer, distinctly audible spectral wail and breathy whisper.
        noise(ctx, now, 2.8, level * 0.7, 1150);
        tone(ctx, now, 650, 260, 2.5, level * 0.7, "sine");
        tone(ctx, now, 390, 570, 1.9, level * 0.45, "triangle", 0.25);
        break;
      case "fog":
        noise(ctx, now, 3.4, level * 0.75, 850);
        tone(ctx, now, 330, 190, 3, level * 0.34, "sine");
        break;
      case "portal":
        noise(ctx, now, 2.8, level * 0.65, 1450);
        tone(ctx, now, 180, 720, 2.2, level * 0.68, "sawtooth");
        tone(ctx, now, 450, 220, 2.5, level * 0.3, "triangle", 0.18);
        break;
      case "blood":
        noise(ctx, now, 1.5, level * 0.9, 1250);
        tone(ctx, now, 350, 105, 1.2, level * 0.6, "triangle");
        noise(ctx, now, 0.8, level * 0.5, 1900, 1);
        break;
      case "bloodmoon":
        tone(ctx, now, 430, 210, 2.9, level * 0.8, "triangle");
        tone(ctx, now, 610, 320, 2.5, level * 0.35, "sine", 0.15);
        noise(ctx, now, 2.5, level * 0.4, 700);
        break;
      case "embers":
        noise(ctx, now, 1.8, level * 0.7, 2400);
        tone(ctx, now, 560, 260, 1.5, level * 0.46, "triangle");
        break;
      case "glitch":
        tone(ctx, now, 950, 250, 0.32, level * 0.52, "square");
        noise(ctx, now, 0.35, level * 0.6, 2600);
        tone(ctx, now, 780, 380, 0.4, level * 0.5, "sawtooth", 0.43);
        noise(ctx, now, 0.48, level * 0.8, 1800, 0.55);
        break;
    }
    return true;
  } catch (error) {
    console.warn("Umbral FX audio error", error);
    stopEffectSound();
    return false;
  }
}

export function playAudioTest(volume = 65): boolean {
  const ctx = getContext();
  if (!ctx || ctx.state !== "running") return false;
  stopEffectSound();
  const now = ctx.currentTime + 0.01;
  const level = clamp(volume / 100) * 0.18;
  tone(ctx, now, 440, 440, 0.23, level);
  tone(ctx, now, 660, 660, 0.23, level, "sine", 0.25);
  tone(ctx, now, 880, 880, 0.28, level, "sine", 0.5);
  return true;
}
