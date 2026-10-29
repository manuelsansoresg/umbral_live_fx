"use client";

import { useRef, useState } from "react";
import { defaultSettings, useFxSettings, type FxSettings } from "@/features/live/settings";

function validSettings(input: unknown): input is FxSettings {
  if (!input || typeof input !== "object") return false;
  const value = input as Partial<FxSettings>;
  const modes = ["automatic", "custom"];
  return Array.isArray(value.presets) && value.presets.length > 0 && value.presets.every(p =>
    p && typeof p.id === "string" && typeof p.name === "string" &&
    typeof p.color === "string" && /^#[0-9a-fA-F]{6}$/.test(p.color) &&
    typeof p.duration === "number" && p.duration >= 2 && p.duration <= 12 &&
    typeof p.scale === "number" && p.scale >= 50 && p.scale <= 150 &&
    ["embers", "bloodmoon", "apparition", "glitch", "portal", "fog", "blood", "spectral"].includes(p.effect) &&
    ["terror", "gamer", "fantasy", "premium"].includes(p.theme) &&
    ["top", "center", "bottom"].includes(p.position) &&
    typeof p.message === "string" && typeof p.showText === "boolean"
  ) && typeof value.defaultEffectId === "string" &&
    value.presets.some(p => p.id === value.defaultEffectId) &&
    !!value.assignments && typeof value.assignments === "object" &&
    (value.masterVolume === undefined || (typeof value.masterVolume === "number" && Number.isFinite(value.masterVolume) && value.masterVolume >= 0 && value.masterVolume <= 100)) &&
    modes.includes(value.mode || "") &&
    ["terror", "gamer", "fantasy", "premium"].includes(value.theme || "");
}
export default function SettingsPage() {
  const [settings, save, loaded] = useFxSettings();
  const [message, setMessage] = useState("");
  const upload = useRef<HTMLInputElement>(null);
  function exportSettings() {
    const blob = new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),settings},null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "umbral-live-fx-config.json"; anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Respaldo descargado.");
  }
  async function importSettings(file?: File) {
    if(!file)return;
    if(file.size > 1024*1024){setMessage("El archivo es demasiado grande (máximo 1 MB).");return;}
    try {
      const data: unknown = JSON.parse(await file.text());
      if(!data || typeof data !== "object" || !("version" in data) || data.version !== 1 || !("settings" in data) || !validSettings(data.settings)) throw new Error("Formato inválido");
      save(data.settings);
      setMessage("Configuración importada correctamente.");
    } catch {setMessage("No se pudo importar: archivo inválido o incompatible.");}
    if(upload.current) upload.current.value = "";
  }
  if(!loaded)return <p className="text-white/60">Cargando preferencias…</p>;
  return <div className="mx-auto max-w-4xl space-y-9">
    <header className="border-b border-white/10 pb-7"><p className="text-xs font-semibold uppercase tracking-[.3em] text-red-500">PREFERENCIAS / UMBRAL LIVE FX</p><h1 className="mt-3 text-4xl font-black">Configuración <span className="text-red-500">general.</span></h1><p className="mt-4 text-sm leading-7 text-white/55">Administra tus configuraciones locales y crea respaldos antes de experimentar con animaciones.</p></header>
    <section className="space-y-4 rounded-2xl border border-white/10 bg-[#111115] p-6">
      <h2 className="text-xl font-bold">Estado actual</h2>
      <div className="grid gap-4 sm:grid-cols-3">{[["Temática",settings.theme],["Modo de regalos",settings.mode],["Presets disponibles",String(settings.presets.length)]].map(([label,value])=><div key={label} className="rounded-xl bg-black/40 p-4"><p className="text-xs text-white/45">{label}</p><p className="mt-2 font-semibold capitalize">{value}</p></div>)}</div>
      <label className="block text-sm text-white/70">Volumen general: {settings.masterVolume}%<input type="range" min="0" max="100" step="5" value={settings.masterVolume} onChange={event=>save({...settings,masterVolume:Number(event.target.value)})} className="mt-3 block w-full accent-red-600" /></label>
      <p className="text-xs leading-6 text-amber-200/80">Los cambios viven en el almacenamiento local de este navegador. No se sincronizan con otras computadoras ni cuentas.</p>
    </section>
    <section className="space-y-5 rounded-2xl border border-white/10 bg-[#111115] p-6">
      <div><h2 className="text-xl font-bold">Respaldo de efectos</h2><p className="mt-2 text-sm text-white/55">Exporta tus presets, las asignaciones de regalos y la temática. No incluye archivos multimedia.</p></div>
      <div className="flex flex-wrap gap-3">
        <button onClick={exportSettings} className="rounded-lg bg-red-700 px-5 py-3 text-sm font-semibold hover:bg-red-600">Descargar respaldo JSON</button>
        <button onClick={()=>upload.current?.click()} className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold hover:bg-white/10">Importar respaldo</button>
        <input ref={upload} type="file" accept=".json,application/json" className="hidden" aria-label="Archivo JSON de configuración" onChange={event=>void importSettings(event.target.files?.[0])}/>
      </div>
      <p className="text-xs text-white/45">Importar reemplaza los presets y asignaciones actuales del navegador. Descarga un respaldo antes.</p>
    </section>
    <section className="space-y-4 rounded-2xl border border-red-900/30 bg-red-950/10 p-6">
      <h2 className="text-xl font-bold">Restablecer configuración</h2>
      <p className="text-sm leading-6 text-white/55">Recupera los valores iniciales de UmbralCreepy. Esta operación sustituye los presets editados.</p>
      <button onClick={()=>{if(window.confirm("¿Restablecer todos los efectos y asignaciones locales?")){save(structuredClone(defaultSettings));setMessage("Configuración restaurada.");}}} className="rounded-lg border border-red-700 px-5 py-3 text-sm font-semibold text-red-300 hover:bg-red-950/40">Restablecer valores originales</button>
    </section>
    {message && <p role="status" className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/80">{message}</p>}
  </div>;
}
