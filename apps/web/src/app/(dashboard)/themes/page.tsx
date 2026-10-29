"use client";
import { themes, useFxSettings } from "@/features/live/settings";
import Link from "next/link";

export default function ThemesPage() {
  const [settings,save,loaded] = useFxSettings();
  if(!loaded)return <p className="text-white/50">Cargando temáticas…</p>;
  return <div className="mx-auto max-w-5xl space-y-8">
    <header><p className="text-xs font-semibold tracking-[.3em] text-red-500">ESTILO VISUAL</p><h1 className="mt-3 text-4xl font-black">Universos <span className="text-red-500">visuales.</span></h1><p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">UmbralCreepy es nuestra identidad original. Puedes explorar estilos alternativos, filtrar su biblioteca y elegir sus efectos para la transmisión.</p></header>
    <section className="grid gap-4 sm:grid-cols-2">{themes.map(theme=><button key={theme.id} type="button" onClick={()=>save({...settings,theme:theme.id})} aria-pressed={settings.theme===theme.id} className={`relative min-h-60 overflow-hidden rounded-2xl border p-6 text-left transition hover:-translate-y-1 ${settings.theme===theme.id?"border-red-500":"border-white/10 hover:border-white/30"}`}>
      <div aria-hidden="true" className="absolute inset-0 opacity-70" style={{background:`radial-gradient(circle at 80% 20%, ${theme.color}33, transparent 65%),#0b0b0e`}}/>
      <span aria-hidden="true" className="relative block text-6xl font-black opacity-75" style={{color:theme.color,textShadow:`0 0 30px ${theme.color}`}}>{theme.id==="terror"?"♱":theme.id==="gamer"?"⌘":theme.id==="fantasy"?"✧":"✦"}</span>
      <h2 className="relative mt-6 text-xl font-bold">{theme.name}</h2><p className="relative mt-2 text-sm text-white/60">{theme.description}</p>
      {settings.theme===theme.id&&<span className="relative mt-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">Seleccionada ✓</span>}
    </button>)}</section>
    <p className="rounded-xl border border-white/10 bg-white/[.03] p-5 text-sm text-white/60">La temática seleccionada organiza tu biblioteca; los colores y movimientos efectivos dependen del preset asignado. <Link className="text-red-400 underline underline-offset-4" href="/animations">Editar animaciones</Link>.</p>
  </div>;
}
