"use client";
import { useEffect, useState } from "react";
import { isSimulatedGift, LIVE_CHANNEL, type SimulatedGift } from "@/features/live/simulator";
import { readSettings, resolvePreset } from "@/features/live/settings";

export default function OverlayPage() {
  const [gift, setGift] = useState<SimulatedGift | null>(null);
  const [ready, setReady] = useState(false);
  const [showStatus, setShowStatus] = useState(true);
  useEffect(() => {
    setShowStatus(new URLSearchParams(window.location.search).get("status") !== "0");
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel(LIVE_CHANNEL);
    let timeout: ReturnType<typeof setTimeout> | undefined;
    setReady(true);
    channel.onmessage = (message: MessageEvent<unknown>) => {
      if (message.data && typeof message.data === "object" && "type" in message.data && message.data.type === "stop-preview") { if(timeout) clearTimeout(timeout); setGift(null); return; }
      if (!isSimulatedGift(message.data)) return;
      const incoming = message.data;
      const applied = incoming.preset ?? resolvePreset(readSettings(), "unknown");
      setGift({ ...incoming, effect: applied.effect, preset: applied });
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setGift(null), Math.max(2, Math.min(12, applied.duration)) * 1000);
    };
    return () => { channel.close(); if (timeout) clearTimeout(timeout); };
  }, []);
  const preset = gift?.preset;
  const symbol = gift?.effect === "bloodmoon" ? "◉" : gift?.effect === "apparition" ? "♱" : gift?.effect === "glitch" ? "♛" : "✦";
  return <main className="pointer-events-none relative flex min-h-dvh items-center justify-center overflow-hidden bg-transparent" aria-label="Overlay transparente de Umbral LIVE FX">
    {!gift && showStatus && <p className="absolute bottom-5 left-5 rounded-md bg-black/60 px-3 py-2 text-xs text-white/70">{ready ? "Overlay listo · esperando regalo simulado" : "El navegador no admite BroadcastChannel"}</p>}
    {gift && <div key={gift.id} role="status" aria-live="polite" className={`effect ${gift.effect}`} style={{ "--fx-color": preset?.color || "#dc2626", "--fx-size": (preset?.scale || 100) / 100, "--fx-time": `${preset?.duration || 5}s`, alignSelf: preset?.position === "top" ? "flex-start" : preset?.position === "bottom" ? "flex-end" : "center" } as React.CSSProperties}>
      <div className="aura" />
      <div className="particles" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <span key={i} style={{ left: `${(i * 37) % 96}%`, top: `${(i * 23) % 86}%`, animationDelay: `${i * 70}ms` }}>✦</span>)}</div>
      <div className="symbol" aria-hidden="true">{symbol}</div>
      {preset?.showText !== false && <div className="caption"><p className="eyebrow">{preset?.message || "UN ALMA HA CRUZADO EL UMBRAL"}</p><h1>{gift.sender}</h1><p>ha enviado <strong>{gift.name}</strong></p></div>}
    </div>}
    <style jsx>{`
      .effect{position:relative;display:grid;place-items:center;width:min(90vw,850px);height:min(80vh,640px);isolation:isolate;text-align:center;animation:arrival var(--fx-time) both;transform:scale(var(--fx-size))}
      .aura{position:absolute;inset:8%;border-radius:50%;background:radial-gradient(circle,rgba(190,0,0,.35),rgba(80,0,0,.14) 35%,transparent 68%);filter:blur(20px);animation:pulse 1.8s ease-in-out infinite alternate}
      .symbol{position:absolute;top:8%;font-size:clamp(110px,24vw,240px);line-height:1;color:var(--fx-color);text-shadow:0 0 30px var(--fx-color),0 0 100px #500;animation:rise 1.3s ease-out both}
      .caption{position:absolute;top:57%;width:100%;padding:0 12px;color:white;text-shadow:0 3px 18px black,0 0 35px #b00;animation:rise 1s .3s both}
      .caption h1{font-weight:900;font-size:clamp(24px,5vw,56px);line-height:1.15;overflow-wrap:anywhere}
      .caption p{font-size:clamp(15px,2vw,24px)}.caption strong{color:var(--fx-color)}
      .eyebrow{font-size:clamp(10px,1.2vw,14px)!important;letter-spacing:.28em;color:var(--fx-color);margin-bottom:14px}
      .particles{position:absolute;inset:0;overflow:hidden}.particles span{position:absolute;color:var(--fx-color);font-size:18px;opacity:0;animation:embers 3s ease-out both}
      .bloodmoon .symbol{color:var(--fx-color);font-size:clamp(160px,27vw,300px);filter:drop-shadow(0 0 22px #a00)}
      .apparition .symbol{color:var(--fx-color);text-shadow:0 0 30px white,0 0 80px #f00;animation:ghost 2s ease-in-out infinite alternate}
      .glitch .symbol,.glitch .caption{animation:glitch 280ms steps(2,end) infinite}
      @keyframes arrival{0%,100%{opacity:0}12%,82%{opacity:1}}
      @keyframes rise{from{opacity:0;transform:translateY(70px) scale(.85)}to{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes pulse{from{transform:scale(.65);opacity:.5}to{transform:scale(1.1);opacity:1}}
      @keyframes ghost{from{transform:translateY(-15px);opacity:.4}to{transform:translateY(15px);opacity:1}}
      @keyframes glitch{0%,100%{transform:translate(0)}25%{transform:translate(-5px,2px)}50%{transform:translate(6px,-3px)}75%{transform:translate(-2px,4px)}}
      @keyframes embers{0%{opacity:0;transform:translateY(60px) scale(.4)}30%{opacity:1}100%{opacity:0;transform:translateY(-190px) scale(1.8)}}
      @media (prefers-reduced-motion:reduce){.effect,.symbol,.caption,.aura,.particles span{animation:none!important}.effect{opacity:1}}
    `}</style>
  </main>;
}
