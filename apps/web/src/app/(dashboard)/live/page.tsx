"use client";

import { useEffect, useState } from "react";
import { broadcastGift, DEMO_GIFTS, getRelayChannel, stopPreview } from "@/features/live/simulator";
import { resolvePreset, useFxSettings } from "@/features/live/settings";

type Format = "horizontal" | "vertical";
type StreamOptions = { format: Format; showStatus: boolean; enabled: boolean };
const KEY = "umbral-live-stream-options-v1";
const defaults: StreamOptions = { format: "vertical", showStatus: false, enabled: true };

export default function LivePage() {
  const [options,setOptions] = useState<StreamOptions>(defaults);
  const [loaded,setLoaded] = useState(false);
  const [copied,setCopied] = useState(false);
  const [relayChannel,setRelayChannel] = useState("");
  const [count,setCount] = useState(0);
  const [relayResult,setRelayResult] = useState("Aún no se ha enviado una prueba.");
  const [settings] = useFxSettings();
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if(stored) setOptions({...defaults,...JSON.parse(stored)});
    } catch { /* Defaults are safe for local preview */ }
    setRelayChannel(getRelayChannel());
    setLoaded(true);
  }, []);
  function update(patch: Partial<StreamOptions>) {
    const next = {...options,...patch};
    setOptions(next);
    localStorage.setItem(KEY,JSON.stringify(next));
  }
  const previewUrl = `/overlay?format=${options.format}&channel=${encodeURIComponent(relayChannel)}`;
  async function testGift() {
    if(!options.enabled)return;
    const gift = DEMO_GIFTS[count % DEMO_GIFTS.length];
    const preset = resolvePreset(settings,gift.id);
    const result = await broadcastGift({id:crypto.randomUUID(),name:gift.name,sender:"UmbralCreepy",effect:preset.effect,preset,timestamp:Date.now()});
    setRelayResult("error" in result ? `Error: ${result.error}` : result.connected > 0 ? `Enviado. ${result.connected} overlay(s) conectados al canal.` : "Enviado al servidor, pero no hay overlays conectados por SSE. Revisa la URL en OBS; también puede funcionar la recuperación por consulta.");
    setCount(n=>n+1);
  }
  async function copyUrl() {
    const url = window.location.origin + previewUrl;
    try { await navigator.clipboard.writeText(url);setCopied(true); }
    catch { setCopied(false); }
  }
  if(!loaded)return <p className="text-white/60">Cargando configuración local…</p>;
  return <div className="mx-auto max-w-6xl space-y-9">
    <header className="border-b border-white/10 pb-7">
      <p className="text-xs font-semibold uppercase tracking-[.3em] text-red-500">UMBRAL FX / LIVE CONTROL</p>
      <h1 className="mt-3 text-4xl font-black sm:text-5xl">Centro de <span className="text-red-500">transmisión.</span></h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">Prepara tu overlay para una fuente de navegador en OBS y prueba regalos desde el panel. La conexión a TikTok sigue pendiente.</p>
    </header>
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><p className="text-xs uppercase tracking-widest text-white/45">Conexión TikTok</p><p className="mt-3 font-bold text-amber-300">No conectada</p></div>
      <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><p className="text-xs uppercase tracking-widest text-white/45">Modo</p><p className="mt-3 font-bold">Prueba local</p></div>
      <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><p className="text-xs uppercase tracking-widest text-white/45">Eventos simulados</p><p className="mt-3 text-2xl font-bold tabular-nums">{count}</p></div>
    </div>
    <div className="grid items-start gap-7 lg:grid-cols-[1fr_1fr]">
      <section className="space-y-5 rounded-2xl border border-white/10 bg-[#111115] p-6">
        <h2 className="text-xl font-bold">Configuración de pantalla</h2>
        <fieldset><legend className="mb-3 text-sm text-white/65">Formato del overlay</legend><div className="grid grid-cols-2 gap-3">
          {([{id:"vertical",name:"Vertical",dimensions:"1080 × 1920",ratio:"9:16"},{id:"horizontal",name:"Horizontal",dimensions:"1920 × 1080",ratio:"16:9"}] as const).map(format=><button key={format.id} type="button" onClick={()=>update({format:format.id})} aria-pressed={options.format===format.id} className={`rounded-xl border p-4 text-left transition ${options.format===format.id?"border-red-500 bg-red-950/25":"border-white/15 hover:border-white/40"}`}>
            <span className="block font-bold">{format.name}</span><span className="mt-2 block text-xs text-white/50">{format.dimensions} · {format.ratio}</span>
          </button>)}
        </div></fieldset>
        <label className="flex items-center gap-3 rounded-lg border border-white/10 p-4 text-sm"><input type="checkbox" checked={options.enabled} onChange={e=>update({enabled:e.target.checked})} className="accent-red-600"/> Permitir pruebas desde este panel</label>
        <label className="flex items-center gap-3 rounded-lg border border-white/10 p-4 text-sm"><input type="checkbox" checked={options.showStatus} onChange={e=>update({showStatus:e.target.checked})} className="accent-red-600"/> Mostrar estado de espera en la vista previa</label>
        <p className="text-xs leading-5 text-white/45">Los formatos definen el tamaño recomendado al agregar la fuente. El navegador no modifica automáticamente la resolución de OBS o TikTok LIVE Studio.</p>
      </section>
      <section className="space-y-5 rounded-2xl border border-white/10 bg-[#111115] p-6">
        <h2 className="text-xl font-bold">Vista previa</h2>
        <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-red-900/70 bg-[radial-gradient(circle_at_center,#341019,#08080b_65%)] p-5">
          <div className={`relative flex items-center justify-center border border-white/25 bg-black/50 ${options.format==="vertical"?"h-56 w-[126px]":"h-[126px] w-56"}`}>
            <span className="text-center text-xs font-bold tracking-widest text-red-400">UMBRAL<br/>LIVE FX</span>
            <span className="absolute bottom-2 text-[9px] text-white/40">{options.format==="vertical"?"9:16":"16:9"}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={previewUrl+(options.showStatus?"&preview=1":"")} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-red-700 px-4 py-3 text-sm font-bold hover:bg-red-600">Abrir overlay ↗</a>
          <button onClick={copyUrl} className="rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold hover:bg-white/10">{copied?"URL copiada ✓":"Copiar URL"}</button>
        </div>
        <p className="break-all rounded-lg bg-black/40 p-3 font-mono text-xs text-white/55">{previewUrl}</p>
        <p className="text-xs leading-5 text-amber-200/75">La URL contiene un identificador privado del canal. No la compartas públicamente; todavía no existe autenticación de cuentas. Usa el ancho y alto del formato seleccionado al configurar la fuente de navegador.</p>
      </section>
    </div>
    <section className="rounded-2xl border border-white/10 bg-[#111115] p-6"><h2 className="text-xl font-bold">Conectar en OBS</h2><p className="mt-2 text-sm leading-6 text-white/60">En OBS agrega una fuente «Navegador», pega la URL copiada e indica {options.format === "vertical" ? "1080 × 1920" : "1920 × 1080"}. Si ya tenías una fuente de antes, reemplaza su URL con la nueva URL copiada desde este panel y actualiza la fuente. Ejecuta este Next.js en un servidor Node persistente. Los sonidos de Web Audio pueden requerir habilitar reproducción en la fuente o el entorno de OBS.</p></section>
    <section className="rounded-2xl border border-red-800/30 bg-red-950/10 p-6">
      <h2 className="text-xl font-bold">Mesa de pruebas</h2>
      <p className="mt-2 text-sm leading-6 text-white/60">Abre la URL del overlay como fuente de navegador en OBS o en otra pestaña. Los eventos simulados viajan por un puente SSE de Next.js; requiere un servidor Node persistente y ambos clientes conectados al mismo servidor.</p>
      <p role="status" className="mt-3 text-sm text-amber-200">{relayResult}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" disabled={!options.enabled} onClick={testGift} className="rounded-lg bg-red-700 px-5 py-3 text-sm font-bold hover:bg-red-600 disabled:opacity-40">▶ Enviar regalo de prueba</button>
        <button type="button" onClick={stopPreview} className="rounded-lg border border-white/20 px-5 py-3 text-sm font-bold hover:bg-white/10">■ Detener efecto</button>
      </div>
    </section>
  </div>;
}
