"use client";
import { useState } from "react";
import { broadcastGift, DEMO_GIFTS, type SimulatedGift } from "@/features/live/simulator";

export default function DashboardPage() {
  const [sender, setSender] = useState("Visitante de las sombras");
  const [lastGift, setLastGift] = useState<SimulatedGift | null>(null);
  const [count, setCount] = useState(0);
  function simulate(id: string) {
    const preset = DEMO_GIFTS.find((gift) => gift.id === id);
    if (!preset) return;
    const event: SimulatedGift = { id: crypto.randomUUID(), name: preset.name, sender: sender.trim().slice(0, 40) || "Visitante", effect: preset.effect, timestamp: Date.now() };
    broadcastGift(event);
    setLastGift(event);
    setCount((previous) => previous + 1);
  }
  return <div className="mx-auto max-w-6xl space-y-10">
    <header className="border-b border-white/10 pb-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[.3em] text-red-500">UMBRALCREEPY / LABORATORIO LIVE</p>
      <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Invoca el <span className="text-red-600">miedo.</span></h1>
      <p className="mt-4 max-w-2xl leading-7 text-white/60">Prueba los efectos visuales antes de conectar tu transmisión de TikTok. Cada regalo despierta una animación diferente.</p>
    </header>
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-red-700/30 bg-red-950/20 p-6"><p className="text-xs uppercase tracking-widest text-red-400">Estado</p><p className="mt-3 text-xl font-bold">Modo simulación</p><p className="mt-2 text-xs text-white/50">Sin conexión a TikTok</p></div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6"><p className="text-xs uppercase tracking-widest text-white/50">Pruebas enviadas</p><p className="mt-3 text-3xl font-bold tabular-nums">{count}</p></div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6"><p className="text-xs uppercase tracking-widest text-white/50">Vista de efectos</p><a href="/overlay" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-red-600 bg-red-700/20 px-4 text-sm font-semibold transition hover:bg-red-700/40">Abrir overlay ↗</a><p className="mt-2 text-xs text-white/50">Ábrelo antes de probar regalos</p></div>
    </div>
    <section className="space-y-5">
      <div><h2 className="text-2xl font-bold">Simulador de regalos</h2><p className="mt-1 text-sm text-white/50">Selecciona el regalo que quieres probar.</p></div>
      <label className="block max-w-md text-sm text-white/70">Nombre del espectador
        <input value={sender} onChange={(e) => setSender(e.target.value)} maxLength={40} className="mt-2 block w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-red-500" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {DEMO_GIFTS.map(gift => <button key={gift.id} type="button" onClick={() => simulate(gift.id)} className="group min-h-48 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[.06] to-transparent p-6 text-left transition hover:-translate-y-1 hover:border-red-500/70 hover:bg-red-950/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500">
          <span aria-hidden="true" className="block text-5xl text-red-500">{gift.symbol}</span>
          <span className="mt-6 block text-lg font-bold">{gift.name}</span>
          <span className="mt-1 block text-xs text-white/50">{gift.description}</span>
          <span className="mt-5 block text-xs font-semibold uppercase tracking-widest text-red-400">Activar efecto →</span>
        </button>)}
      </div>
    </section>
    <footer className="rounded-xl border border-white/10 bg-black/40 p-5 text-sm leading-6 text-white/60">
      {lastGift ? <>Último evento: <strong className="text-white">{lastGift.sender}</strong> envió <strong className="text-red-400">{lastGift.name}</strong>.</> : "Aún no has enviado un regalo de prueba."}
      <p className="mt-2 text-xs text-white/40">El overlay y este panel deben abrirse en el mismo navegador y origen. La sincronización local no funciona entre dispositivos ni envía datos a TikTok.</p>
    </footer>
  </div>;
}
