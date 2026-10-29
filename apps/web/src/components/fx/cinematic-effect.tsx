"use client";

import { useEffect, useRef } from "react";
import type { EffectPreset } from "@/features/live/settings";

type Props = { preset: EffectPreset; sender?: string; giftName?: string; compact?: boolean };
const glyphs: Record<EffectPreset["effect"], string> = {
  apparition: "♱", bloodmoon: "◉", embers: "✦", glitch: "♛",
  portal: "◎", fog: "☽", blood: "♦", spectral: "♱",
};
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function CinematicEffect({ preset, sender = "UmbralCreepy", giftName = "Regalo de prueba", compact = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    let frame = 0;
    let raf = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = reduced ? 16 : compact ? 38 : 95;
    const points = Array.from({ length: count }, (_, i) => ({
      x: ((i * 73.71) % 100) / 100,
      y: ((i * 43.19) % 100) / 100,
      speed: 0.22 + (i % 7) * 0.09,
      radius: 0.7 + (i % 6) * 0.35,
      offset: i * 0.41,
    }));
    let width = 1, height = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const render = () => {
      const t = frame / 60;
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height * 0.44;
      const radius = Math.min(width, height) * (compact ? 0.19 : 0.24);
      ctx.globalCompositeOperation = "screen";

      if (preset.effect === "portal" || preset.effect === "bloodmoon") {
        for (let i = 0; i < 5; i++) {
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate((t * (i % 2 ? -0.1 : 0.14)) + i * 0.5);
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * (0.78 + i * 0.08), radius * (0.98 + i * 0.04), i * 0.3, 0.1, Math.PI * 1.85);
          ctx.lineWidth = Math.max(1, radius * (0.035 - i * 0.003));
          ctx.strokeStyle = preset.color;
          ctx.globalAlpha = (0.09 + i * 0.055) * (0.85 + Math.sin(t * 1.8 + i) * 0.15);
          ctx.shadowBlur = radius * 0.3;
          ctx.shadowColor = preset.color;
          ctx.stroke();
          ctx.restore();
        }
      }

      if (preset.effect === "fog" || preset.effect === "spectral" || preset.effect === "apparition") {
        for (let i = 0; i < 9; i++) {
          const x = (i * width / 7 + Math.sin(t * 0.29 + i) * width * 0.16) % (width + 100);
          const y = height * (0.27 + i * 0.062) + Math.cos(t * 0.4 + i) * 24;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, width * 0.21);
          gradient.addColorStop(0, preset.color + "24");
          gradient.addColorStop(1, preset.color + "00");
          ctx.fillStyle = gradient;
          ctx.globalAlpha = 0.7;
          ctx.fillRect(x - width * 0.21, y - width * 0.21, width * 0.42, width * 0.42);
        }
      }

      if (preset.effect === "blood") {
        ctx.globalCompositeOperation = "source-over";
        for (let i = 0; i < 17; i++) {
          const x = (i + 0.5) / 17 * width;
          const drip = (0.1 + (i * 13 % 9) / 35 + (t * (0.025 + i % 4 * 0.006)) % 0.65) * height;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, drip);
          ctx.strokeStyle = preset.color;
          ctx.globalAlpha = 0.26 + (i % 4) * 0.09;
          ctx.lineWidth = 2 + i % 5;
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(x, drip, 3 + i % 3, 7 + i % 6, 0, 0, Math.PI * 2);
          ctx.fillStyle = preset.color;
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = "screen";
      for (const p of points) {
        const y = ((p.y - t * p.speed * (preset.effect === "blood" ? -0.035 : 0.09)) % 1 + 1) % 1;
        const x = p.x + Math.sin(t * p.speed + p.offset) * 0.035;
        ctx.globalAlpha = reduced ? 0.22 : 0.15 + (Math.sin(t * 2 + p.offset) + 1) * 0.24;
        ctx.fillStyle = preset.color;
        ctx.beginPath();
        ctx.arc(x * width, y * height, p.radius * (compact ? 0.7 : 1.1), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      if (!reduced) { frame++; raf = requestAnimationFrame(render); }
    };
    render();
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, [preset.effect, preset.color, compact]);

  const isSpectral = preset.effect === "spectral" || preset.effect === "apparition" || preset.effect === "fog";
  return <div className={`fx-stage fx-${preset.effect} ${compact ? "fx-compact" : ""}`} style={{ "--fx-color": preset.color, "--fx-scale": clamp(preset.scale, 50, 150) / 100 } as React.CSSProperties}>
    <canvas ref={canvasRef} className="fx-canvas" aria-hidden="true" />
    <div className="fx-light" aria-hidden="true" />
    {preset.effect === "portal" && <div className="fx-portal-core" aria-hidden="true" />}
    {isSpectral ? <div className="fx-ghost" aria-hidden="true">
      <svg viewBox="0 0 240 300" width="100%" height="100%" role="presentation">
        <defs><radialGradient id="spectral-fill" cx="50%" cy="30%" r="65%"><stop offset="0%" stopColor="#f8fafc" stopOpacity=".85"/><stop offset="65%" stopColor="#cbd5e1" stopOpacity=".42"/><stop offset="100%" stopColor="#94a3b8" stopOpacity="0"/></radialGradient></defs>
        <path d="M120 24C73 24 53 68 55 113c2 42-10 55-25 91-12 28-3 46 18 35 25-14 24 33 50 15 20-14 33 30 51 6 13-18 31 8 48-14 23-31-14-77-13-135 1-46-18-87-64-87z" fill="url(#spectral-fill)"/>
        <ellipse cx="91" cy="124" rx="12" ry="18" fill="#05070c" opacity=".8"/><ellipse cx="149" cy="124" rx="12" ry="18" fill="#05070c" opacity=".8"/>
        <path d="M116 155q4-13 9 0l7 19q-10 5-20 0z" fill="#080a12" opacity=".65"/>
      </svg>
    </div> : <div className="fx-figure" aria-hidden="true">{glyphs[preset.effect]}</div>}
    {preset.showText && <div className="fx-caption"><p className="fx-message">{preset.message}</p><p className="fx-sender">{sender}</p><p className="fx-gift">ha enviado <strong>{giftName}</strong></p></div>}
    <style jsx>{`
      .fx-stage{position:relative;width:100%;height:100%;min-height:180px;overflow:hidden;isolation:isolate;transform:scale(var(--fx-scale));display:grid;place-items:center;color:var(--fx-color);text-align:center}
      .fx-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
      .fx-light{position:absolute;width:60%;aspect-ratio:1;border-radius:100%;background:radial-gradient(circle,var(--fx-color),transparent 68%);opacity:.23;filter:blur(36px);animation:breath 3s ease-in-out infinite alternate}
      .fx-figure{position:absolute;top:12%;font-size:clamp(90px,15vw,230px);line-height:1;color:var(--fx-color);filter:drop-shadow(0 0 24px var(--fx-color));animation:manifest 1.5s ease-out both}
      .fx-spectral .fx-figure,.fx-apparition .fx-figure,.fx-fog .fx-figure{color:#e6e9ef;opacity:.75;filter:drop-shadow(0 0 30px var(--fx-color));animation:haunt 3s ease-in-out infinite alternate}
      .fx-ghost{position:absolute;top:6%;width:min(48%,280px);height:57%;filter:drop-shadow(0 0 28px var(--fx-color));animation:haunt 3.5s ease-in-out infinite alternate;opacity:.84}
      .fx-compact .fx-ghost{width:34%;height:57%}
      .fx-portal .fx-figure{opacity:.32;animation:spin 10s linear infinite}
      .fx-portal-core{position:absolute;top:17%;width:27%;aspect-ratio:1;border:3px solid var(--fx-color);border-radius:50%;box-shadow:0 0 30px var(--fx-color),inset 0 0 30px var(--fx-color);animation:spin 8s linear infinite}
      .fx-blood .fx-figure{font-size:clamp(70px,12vw,150px);opacity:.6}
      .fx-glitch .fx-figure{animation:interference .22s steps(2,end) infinite}
      .fx-caption{position:absolute;z-index:3;top:60%;width:96%;padding:0 3%;color:#fff;text-shadow:0 2px 12px #000,0 0 20px #000;animation:manifest 1s .2s both}
      .fx-message{font-size:clamp(9px,1.2vw,15px);font-weight:700;letter-spacing:.19em;color:var(--fx-color)}
      .fx-sender{margin-top:10px;font-size:clamp(18px,4vw,47px);font-weight:900;line-height:1.12;overflow-wrap:anywhere}
      .fx-gift{margin-top:8px;font-size:clamp(12px,1.8vw,22px)}
      .fx-gift strong{color:var(--fx-color)}
      .fx-compact .fx-figure{top:12%;font-size:64px}.fx-compact .fx-portal-core{top:18%;width:34%}
      .fx-compact .fx-caption{top:62%}.fx-compact .fx-message{font-size:8px}.fx-compact .fx-sender{font-size:13px}.fx-compact .fx-gift{font-size:10px}
      @keyframes manifest{from{opacity:0;transform:translateY(30px) scale(.65)}to{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes breath{from{opacity:.12;transform:scale(.75)}to{opacity:.38;transform:scale(1.15)}}
      @keyframes haunt{from{opacity:.3;transform:translateY(-14px) scale(.95)}to{opacity:.9;transform:translateY(12px) scale(1.05)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes interference{0%,100%{transform:translate(0)}25%{transform:translate(-5px,3px)}50%{transform:translate(5px,-4px)}75%{transform:translate(-3px,4px)}}
      @media(prefers-reduced-motion:reduce){.fx-figure,.fx-ghost,.fx-caption,.fx-light,.fx-portal-core{animation:none!important}}
    `}</style>
  </div>;
}
