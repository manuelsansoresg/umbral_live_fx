"use client";
import Link from "next/link";
import { DEMO_GIFTS } from "@/features/live/simulator";
import { useFxSettings } from "@/features/live/settings";

export default function GiftsPage() {
  const [settings,save,loaded]=useFxSettings();
  if(!loaded)return <p className="text-white/60">Cargando regalos…</p>;
  return <div className="mx-auto max-w-5xl space-y-8">
    <header><p className="text-xs font-semibold uppercase tracking-[.3em] text-red-500">CONTROL DE REGALOS</p><h1 className="mt-3 text-4xl font-black">Asignación de <span className="text-red-500">efectos.</span></h1><p className="mt-4 text-sm leading-7 text-white/60">Decide si todos los regalos activan una animación automática o si cada regalo tiene una propia. Los cambios funcionan en el simulador local.</p></header>
    <section className="rounded-2xl border border-white/10 bg-white/[.03] p-6 space-y-5">
      <h2 className="text-lg font-bold">Modo de funcionamiento</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {([{id:"automatic",title:"Automático",description:"Todos los regalos usan el efecto predeterminado."},{id:"custom",title:"Personalizado",description:"Cada regalo tiene su propio efecto asignado."}] as const).map(mode=><button key={mode.id} onClick={()=>save({...settings,mode:mode.id})} aria-pressed={settings.mode===mode.id} className={`rounded-xl border p-5 text-left transition ${settings.mode===mode.id?"border-red-600 bg-red-950/30":"border-white/10 bg-black/20 hover:border-white/30"}`}><span className="block font-bold">{mode.title}</span><span className="mt-2 block text-sm text-white/55">{mode.description}</span></button>)}
      </div>
      <label className="block max-w-md text-sm text-white/70">Efecto predeterminado
        <select value={settings.defaultEffectId} onChange={e=>save({...settings,defaultEffectId:e.target.value})} className="mt-2 w-full rounded-lg border border-white/15 bg-black p-3 text-white">{settings.presets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
      </label>
    </section>
    <section className="space-y-4"><div><h2 className="text-2xl font-bold">Regalos de prueba</h2><p className="mt-2 text-sm text-white/50">Los identificadores de regalos reales se agregarán al conectar TikTok. Actualmente son cuatro eventos simulados.</p></div>
      <div className="grid gap-3">{DEMO_GIFTS.map(gift=><div key={gift.id} className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[.025] p-5 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-950/40 text-3xl text-red-400">{gift.symbol}</span><div><h3 className="font-semibold">{gift.name}</h3><p className="text-xs text-white/50">{gift.description}</p></div></div>
        <label className="min-w-0 flex-1 text-xs text-white/60">Animación asignada
          <select disabled={settings.mode==="automatic"} className="mt-2 w-full rounded-lg border border-white/15 bg-black p-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40" value={settings.assignments[gift.id]||settings.defaultEffectId} onChange={e=>save({...settings,assignments:{...settings.assignments,[gift.id]:e.target.value}})}>{settings.presets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
        </label>
      </div>)}</div>
    </section>
    <p className="rounded-xl border border-red-900/30 bg-red-950/10 p-5 text-sm leading-6 text-white/60">Los ajustes se guardan localmente en este navegador, no en una cuenta o base de datos. <Link href="/animations" className="text-red-400 underline underline-offset-4">Abrir editor de animaciones</Link>.</p>
  </div>;
}
