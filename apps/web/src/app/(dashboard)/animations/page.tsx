"use client";

import { useMemo, useState } from "react";
import { themes, useFxSettings, type EffectPreset, type FxTheme } from "@/features/live/settings";
import { broadcastGift, stopPreview } from "@/features/live/simulator";
import { CinematicEffect } from "@/components/fx/cinematic-effect";
import { playAudioTest, playEffectSound, unlockAudio, stopEffectSound } from "@/features/live/audio";


export default function AnimationsPage() {
  const [settings, save, loaded] = useFxSettings();
  const [filter, setFilter] = useState<"all" | FxTheme>("all");
  const [selectedId, select] = useState("embers");
  const [preview, setPreview] = useState(0);
  const [notice, setNotice] = useState("");
  const selected = settings.presets.find(p => p.id === selectedId) || settings.presets[0];
  const filtered = useMemo(() => settings.presets.filter(p => filter === "all" || p.theme === filter), [settings.presets, filter]);
  const patch = (values: Partial<EffectPreset>) => save({ ...settings, presets: settings.presets.map(p => p.id === selected.id ? { ...p, ...values } : p) });
  const test = async (preset: EffectPreset) => {
    if (preset.sound && await unlockAudio()) playEffectSound(preset.effect, settings.masterVolume);
    select(preset.id); setPreview(v => v + 1);
    broadcastGift({ id: crypto.randomUUID(), name: "Regalo de prueba", sender: "UmbralCreepy", effect: preset.effect, timestamp: Date.now(), preset });
  };
  const duplicate = () => {
    const id = `custom-${crypto.randomUUID()}`;
    save({ ...settings, presets: [...settings.presets, { ...selected, id, name: selected.name + " (copia)" }] });
    select(id); setNotice("Copia creada y guardada.");
  };
  if (!loaded || !selected) return <p className="text-white/60">Cargando biblioteca…</p>;
  return <div className="mx-auto max-w-7xl space-y-8">
    <header className="border-b border-white/10 pb-7">
      <p className="text-xs font-bold uppercase tracking-[.3em] text-red-500">UMBRAL FX / ESTUDIO CREATIVO</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Biblioteca de <span className="text-red-500">animaciones.</span></h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">Explora, edita y prueba los efectos de tu transmisión. Los cambios se guardan en este navegador y se aplican en el overlay.</p>
    </header>
    <div className="flex flex-wrap gap-2">
      {[{id:"all",name:"Todas"},...themes.map(t=>({id:t.id,name:t.name}))].map(t => <button key={t.id} onClick={()=>setFilter(t.id as "all" | FxTheme)} className={`rounded-full border px-4 py-2 text-sm transition ${filter===t.id?"border-red-500 bg-red-950/40 text-white":"border-white/10 text-white/50 hover:border-white/40 hover:text-white"}`}>{t.name}</button>)}
    </div>
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_350px]">
      <section aria-label="Efectos disponibles" className="grid content-start gap-4 sm:grid-cols-2">
        {filtered.map(p => <button key={p.id} type="button" onClick={()=>{select(p.id);setNotice("");}} className={`overflow-hidden rounded-2xl border text-left transition hover:-translate-y-1 ${selected.id===p.id?"border-red-500/80 bg-red-950/20":"border-white/10 bg-white/[.03] hover:border-white/30"}`}>
          <div className="relative h-44 overflow-hidden bg-[#060609]">
            <CinematicEffect preset={{...p,scale:75,showText:false}} compact />
            <span className="absolute bottom-3 left-4 text-[10px] font-semibold uppercase tracking-[.2em] text-white/50">{p.theme}</span>
          </div>
          <div className="flex items-center justify-between gap-2 p-4"><div><h2 className="font-bold">{p.name}</h2><p className="mt-1 text-xs text-white/45">{p.duration}s · {p.position}</p></div><span className="text-red-400">Editar →</span></div>
        </button>)}
        {filtered.length===0 && <p className="text-sm text-white/60">No hay efectos disponibles en esta temática.</p>}
      </section>
      <aside className="h-fit space-y-5 rounded-2xl border border-white/10 bg-[#111115] p-5 xl:sticky xl:top-6">
        <div><p className="text-xs font-semibold uppercase tracking-widest text-red-400">Editor de efecto</p><h2 className="mt-2 text-xl font-bold">{selected.name}</h2></div>
        <div key={preview} className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#050508]">
          <CinematicEffect preset={{...selected,scale:75}} compact />
        </div>
        <label className="block text-xs text-white/70">Nombre<input className="mt-1 block w-full rounded-lg border border-white/15 bg-black/40 p-3 text-sm text-white" value={selected.name} maxLength={60} onChange={e=>patch({name:e.target.value})}/></label>
        <label className="block text-xs text-white/70">Texto del efecto<input className="mt-1 block w-full rounded-lg border border-white/15 bg-black/40 p-3 text-sm text-white" value={selected.message} maxLength={80} onChange={e=>patch({message:e.target.value})}/></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-white/70">Color<input aria-label="Color del efecto" type="color" className="mt-2 block h-11 w-full cursor-pointer rounded-lg bg-black" value={selected.color} onChange={e=>patch({color:e.target.value})}/></label>
          <label className="text-xs text-white/70">Posición<select className="mt-2 block w-full rounded-lg border border-white/15 bg-black p-3 text-sm text-white" value={selected.position} onChange={e=>patch({position:e.target.value as EffectPreset["position"]})}><option value="top">Arriba</option><option value="center">Centro</option><option value="bottom">Abajo</option></select></label>
        </div>
        <label className="block text-xs text-white/70">Duración: {selected.duration}s<input className="mt-2 w-full accent-red-600" type="range" min="2" max="12" step=".5" value={selected.duration} onChange={e=>patch({duration:Number(e.target.value)})}/></label>
        <label className="block text-xs text-white/70">Tamaño: {selected.scale}%<input className="mt-2 w-full accent-red-600" type="range" min="50" max="150" step="5" value={selected.scale} onChange={e=>patch({scale:Number(e.target.value)})}/></label>
        <label className="flex items-center gap-3 text-sm text-white/70"><input type="checkbox" checked={selected.showText} onChange={e=>patch({showText:e.target.checked})} className="accent-red-600"/> Mostrar texto</label>
        <label className="flex items-center gap-3 text-sm text-white/70"><input type="checkbox" checked={selected.sound} onChange={e=>patch({sound:e.target.checked})} className="accent-red-600"/> Sonido sintetizado en este efecto</label>
        <label className="block text-xs text-white/70">Volumen general: {settings.masterVolume}%<input className="mt-2 w-full accent-red-600" type="range" min="0" max="100" step="5" value={settings.masterVolume} onChange={e=>save({...settings,masterVolume:Number(e.target.value)})}/></label>
        <p className="text-xs text-white/40">Si configuraste efectos antes de añadir audio, revisa que la casilla de sonido esté marcada. El overlay tiene su propio botón de prueba.</p>
        <button type="button" onClick={async()=>{const ok=await unlockAudio();const played=ok && playEffectSound(selected.effect, Math.max(settings.masterVolume, 40));setNotice(played?`Sonido «${selected.name}» enviado. Escúchalo durante unos segundos.`:"El navegador bloqueó Web Audio.");}} className="w-full rounded-lg border border-red-600/50 px-3 py-3 text-sm font-semibold text-red-200 hover:bg-red-950/40">♫ Escuchar sonido de este efecto</button>
        <button type="button" onClick={async()=>{const ok=await unlockAudio();const test=ok && playAudioTest(80);setNotice(test?"Se enviaron tres tonos de prueba.":"El navegador bloqueó Web Audio.");}} className="w-full rounded-lg border border-white/20 px-3 py-3 text-sm font-semibold hover:bg-white/10">Probar audio de este navegador</button>
        <div className="grid grid-cols-2 gap-2"><button onClick={()=>test(selected)} className="rounded-lg bg-red-700 px-3 py-3 text-sm font-bold hover:bg-red-600">▶ Reproducir</button><button onClick={()=>{stopPreview();stopEffectSound();setPreview(v=>v+1);setNotice("Se detuvo el efecto del overlay.");}} className="rounded-lg border border-white/20 px-3 py-3 text-sm font-bold hover:bg-white/10">■ Detener</button></div>
        <button onClick={duplicate} className="w-full rounded-lg border border-white/20 px-3 py-3 text-sm font-bold hover:bg-white/10">Duplicar efecto</button><button onClick={()=>{save({...settings,defaultEffectId:selected.id});setNotice("Efecto predeterminado actualizado.");}} className="w-full rounded-lg border border-red-600/50 px-3 py-3 text-sm font-semibold text-red-300 hover:bg-red-950/30">Usar como predeterminado</button>
        {notice && <p role="status" className="text-xs text-green-400">{notice}</p>}
        <p className="text-xs leading-5 text-white/40">La vista previa integrada es simplificada. Para observar el efecto completo, abre el overlay en otra pestaña o como fuente de navegador desde Mi transmisión. La conexión SSE requiere un servidor Node persistente.</p>
        <a href="/overlay" target="_blank" rel="noopener noreferrer" className="block text-center text-sm text-red-400 underline underline-offset-4">Abrir overlay ↗</a>
      </aside>
    </div>
  </div>;
}
