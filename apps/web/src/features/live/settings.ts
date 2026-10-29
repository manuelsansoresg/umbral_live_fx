"use client";

import { useEffect, useState } from "react";
import { DEMO_GIFTS, type GiftEffect } from "@/features/live/simulator";

export type FxTheme = "terror" | "gamer" | "fantasy" | "premium";
export type EffectPreset = {
  id: string;
  name: string;
  effect: GiftEffect;
  theme: FxTheme;
  color: string;
  duration: number;
  scale: number;
  position: "top" | "center" | "bottom";
  showText: boolean;
  message: string;
  sound: boolean;
};
export type FxSettings = {
  theme: FxTheme;
  mode: "automatic" | "custom";
  defaultEffectId: string;
  assignments: Record<string, string>;
  presets: EffectPreset[];
};
export const SETTINGS_KEY = "umbral-live-fx-settings-v1";
export const SETTINGS_CHANNEL = "umbral-live-fx-settings-channel-v1";
export const themes: { id: FxTheme; name: string; description: string; color: string }[] = [
  { id: "terror", name: "UmbralCreepy", description: "Sombras, rojo sangre y apariciones", color: "#dc2626" },
  { id: "gamer", name: "Gamer", description: "Neón, energía y glitches", color: "#22d3ee" },
  { id: "fantasy", name: "Fantasía", description: "Magia, brillos y portales", color: "#a78bfa" },
  { id: "premium", name: "Premium", description: "Oro, luces y elegancia", color: "#fbbf24" },
];
const presets: EffectPreset[] = [
  { id: "embers", name: "Lluvia de brasas", effect: "embers", theme: "terror", color: "#dc2626", duration: 5, scale: 100, position: "center", showText: true, message: "UN ALMA HA CRUZADO EL UMBRAL", sound: false },
  { id: "bloodmoon", name: "Luna de sangre", effect: "bloodmoon", theme: "terror", color: "#dc2626", duration: 5, scale: 100, position: "center", showText: true, message: "LA LUNA DESPIERTA", sound: false },
  { id: "apparition", name: "Aparición espectral", effect: "apparition", theme: "terror", color: "#e5e7eb", duration: 5, scale: 100, position: "center", showText: true, message: "ALGUIEN NOS OBSERVA", sound: false },
  { id: "glitch", name: "Interferencia paranormal", effect: "glitch", theme: "terror", color: "#f87171", duration: 4, scale: 100, position: "center", showText: true, message: "SEÑAL INTERVENIDA", sound: false },
  { id: "abyss-portal", name: "Portal del abismo", effect: "portal", theme: "terror", color: "#dc2626", duration: 7, scale: 100, position: "center", showText: true, message: "EL UMBRAL SE HA ABIERTO", sound: false },
  { id: "cemetery-fog", name: "Niebla del cementerio", effect: "fog", theme: "terror", color: "#8893a1", duration: 6, scale: 100, position: "center", showText: true, message: "ALGO SE MUEVE EN LA NIEBLA", sound: false },
  { id: "blood-rain", name: "Lluvia de sangre", effect: "blood", theme: "terror", color: "#b91c1c", duration: 6, scale: 100, position: "center", showText: true, message: "LA OSCURIDAD RECLAMA SU OFRENDA", sound: false },
  { id: "spectral-visitor", name: "Visitante espectral", effect: "spectral", theme: "terror", color: "#b8d5e0", duration: 7, scale: 100, position: "center", showText: true, message: "NO ESTÁS SOLO", sound: false },
  { id: "neon", name: "Impacto neón", effect: "glitch", theme: "gamer", color: "#22d3ee", duration: 4, scale: 100, position: "center", showText: true, message: "POWER UP", sound: false },
  { id: "portal", name: "Portal mágico", effect: "portal", theme: "fantasy", color: "#a78bfa", duration: 5, scale: 100, position: "center", showText: true, message: "UN PORTAL SE ABRE", sound: false },
  { id: "gold", name: "Destellos dorados", effect: "embers", theme: "premium", color: "#fbbf24", duration: 5, scale: 100, position: "center", showText: true, message: "GRACIAS POR TU REGALO", sound: false },
];
export const defaultSettings: FxSettings = {
  theme: "terror", mode: "automatic", defaultEffectId: "embers", presets,
  assignments: Object.fromEntries(DEMO_GIFTS.map((gift) => [gift.id, gift.effect])),
};
export function readSettings(): FxSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const value: Partial<FxSettings> = JSON.parse(raw);
    if (!Array.isArray(value.presets) || !value.presets.length) return defaultSettings;
    const existing = value.presets.filter((p) => typeof p.id === "string" && typeof p.name === "string");
    const ids = new Set(existing.map((p) => p.id));
    return { ...defaultSettings, ...value, presets: [...existing, ...defaultSettings.presets.filter((p) => !ids.has(p.id))], assignments: value.assignments || {} };
  } catch { return defaultSettings; }
}
export function writeSettings(value: FxSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
  if ("BroadcastChannel" in window) { const channel = new BroadcastChannel(SETTINGS_CHANNEL); channel.postMessage("changed"); channel.close(); }
  window.dispatchEvent(new Event("umbral-settings-updated"));
}
export function useFxSettings(): [FxSettings, (next: FxSettings) => void, boolean] {
  const [settings, setSettings] = useState<FxSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const load = () => setSettings(readSettings());
    load(); setLoaded(true);
    window.addEventListener("storage", load);
    window.addEventListener("umbral-settings-updated", load);
    const channel = "BroadcastChannel" in window ? new BroadcastChannel(SETTINGS_CHANNEL) : null;
    if (channel) channel.onmessage = load;
    return () => { window.removeEventListener("storage", load); window.removeEventListener("umbral-settings-updated", load); channel?.close(); };
  }, []);
  function save(next: FxSettings) { setSettings(next); writeSettings(next); }
  return [settings, save, loaded];
}
export function resolvePreset(settings: FxSettings, giftId: string): EffectPreset {
  const id = settings.mode === "custom" ? settings.assignments[giftId] || settings.defaultEffectId : settings.defaultEffectId;
  return settings.presets.find((p) => p.id === id) || settings.presets[0] || defaultSettings.presets[0];
}
