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
    const started = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = reduced ? 18 : compact ? 48 : 145;
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
      const t = reduced ? 1.7 : (performance.now() - started) / 1000;
      const duration = Math.max(2, Math.min(12, preset.duration));
      const intro = reduced ? 1 : Math.min(1, t / 0.85);
      const outro = reduced ? 1 : Math.min(1, Math.max(0, (duration - t) / 0.9));
      const envelope = Math.max(0, Math.min(intro, outro));
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height * 0.44;
      const radius = Math.min(width, height) * (compact ? 0.19 : 0.24);
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = envelope;

      // Atmospheric volumes: layered noise-free translucent gradients, drawn at different depths.
      const mist = preset.effect === "fog" || preset.effect === "spectral" || preset.effect === "apparition" || preset.effect === "portal";
      if (mist) {
        const bands = compact ? 9 : 18;
        for (let i = 0; i < bands; i++) {
          const drift = reduced ? 0 : Math.sin(t * (0.15 + (i % 4) * 0.07) + i * 2.13);
          const x = ((i * 0.271 + drift * 0.14 + 2) % 1) * width;
          const y = (0.17 + ((i * 19) % 73) / 100) * height + Math.cos(t * 0.3 + i) * 18;
          const r = Math.max(45, width * (0.14 + (i % 5) * 0.055));
          const fog = ctx.createRadialGradient(x, y, 1, x, y, r);
          fog.addColorStop(0, preset.color + (i % 3 === 0 ? "35" : "20"));
          fog.addColorStop(0.48, preset.color + "0d");
          fog.addColorStop(1, preset.color + "00");
          ctx.globalAlpha = envelope * (preset.effect === "fog" ? 0.95 : 0.57);
          ctx.fillStyle = fog;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
      }

      if (preset.effect === "portal" || preset.effect === "bloodmoon") {
        const isPortal = preset.effect === "portal";
        ctx.save();
        ctx.globalAlpha = envelope * (isPortal ? 0.47 : 0.34);
        const halo = ctx.createRadialGradient(centerX, centerY, radius * 0.06, centerX, centerY, radius * 1.65);
        halo.addColorStop(0, isPortal ? "#030207f5" : "#180409c8");
        halo.addColorStop(0.37, isPortal ? "#020207b0" : preset.color + "58");
        halo.addColorStop(0.75, preset.color + "23");
        halo.addColorStop(1, preset.color + "00");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        for (let i = 0; i < (isPortal ? 9 : 5); i++) {
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate((reduced ? 0 : t * (i % 2 ? -0.16 : 0.2)) + i * 0.62);
          const r = radius * (0.69 + i * 0.067);
          ctx.beginPath();
          ctx.ellipse(0, 0, r, r * (0.89 + i % 3 * 0.045), i * 0.11, i * 0.41, i * 0.41 + Math.PI * (isPortal ? 1.45 : 1.75));
          ctx.lineWidth = Math.max(1, radius * (i % 3 === 0 ? 0.024 : 0.009));
          ctx.strokeStyle = i % 3 === 0 ? "#e8d5ec" : preset.color;
          ctx.globalAlpha = envelope * (0.2 + i * 0.046) * (0.86 + Math.sin(t * 2 + i) * 0.14);
          ctx.shadowBlur = isPortal ? radius * 0.38 : radius * 0.18;
          ctx.shadowColor = preset.color;
          ctx.stroke();
          ctx.restore();
        }
        if (isPortal) {
          for (let i = 0; i < 70; i++) {
            const angle = i * 2.39996 + t * (0.15 + (i % 4) * 0.04);
            const r = radius * (0.65 + (i * 7 % 27) / 55);
            ctx.beginPath();
            ctx.arc(centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r * 0.9, i % 4 ? 0.8 : 1.6, 0, Math.PI * 2);
            ctx.globalAlpha = envelope * (0.26 + (i % 3) * 0.13);
            ctx.fillStyle = i % 4 ? preset.color : "#ffffff";
            ctx.fill();
          }
        }
      }

      if (preset.effect === "blood") {
        ctx.globalCompositeOperation = "source-over";
        const impact = Math.max(0, 1 - t / 1.1) * envelope;
        for (let i = 0; i < 24; i++) {
          const x = (i + 0.5) / 24 * width + Math.sin(i * 12.3) * 18;
          const length = height * (0.12 + (i * 13 % 11) / 42);
          const speed = 0.025 + i % 5 * 0.009;
          const tip = Math.min(height * 0.92, length + Math.max(0, t - i * 0.045) * speed * height);
          const thickness = 2 + i % 6;
          ctx.beginPath();
          ctx.moveTo(x - thickness * 2, -8);
          ctx.bezierCurveTo(x + thickness * 2, tip * 0.16, x - thickness * 1.7, tip * 0.6, x, tip);
          ctx.strokeStyle = preset.color;
          ctx.lineCap = "round";
          ctx.lineWidth = thickness;
          ctx.globalAlpha = envelope * (0.45 + (i % 4) * 0.105);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(x, tip, thickness * 0.7, thickness * (1.5 + i % 3 * 0.4), (i % 3 - 1) * 0.18, 0, Math.PI * 2);
          ctx.fillStyle = preset.color;
          ctx.fill();
          if (impact > 0 && i % 2 === 0) {
            const angle = i * 2.4;
            const r = (1 - impact) * (45 + i * 4);
            ctx.beginPath();
            ctx.ellipse(centerX + Math.cos(angle) * r, centerY * 0.75 + Math.sin(angle) * r * 0.7, 2 + i % 5, 4 + i % 7, angle, 0, Math.PI * 2);
            ctx.globalAlpha = impact * 0.7;
            ctx.fill();
          }
        }
      }

      if (preset.effect === "glitch") {
        for (let i = 0; i < 12; i++) {
          const y = ((i * 0.132 + t * 0.33) % 1) * height;
          const barHeight = 2 + i % 5 * 3;
          ctx.globalAlpha = envelope * (0.035 + (i % 3) * 0.045);
          ctx.fillStyle = i % 2 ? "#25d9ff" : "#ff3059";
          ctx.fillRect((Math.sin(t * 12 + i) * 0.2) * width, y, width * (0.4 + i % 4 * 0.2), barHeight);
        }
      }

      ctx.globalCompositeOperation = "screen";
      for (const p of points) {
        const y = ((p.y - t * p.speed * (preset.effect === "blood" ? -0.035 : 0.09)) % 1 + 1) % 1;
        const x = p.x + Math.sin(t * p.speed + p.offset) * 0.035;
        ctx.globalAlpha = envelope * (reduced ? 0.22 : 0.12 + (Math.sin(t * 2 + p.offset) + 1) * 0.3);
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
  }, [preset.effect, preset.color, preset.duration, compact]);

  const isSpectral = preset.effect === "spectral" || preset.effect === "apparition" || preset.effect === "fog";
  return <div className={`fx-stage fx-${preset.effect} ${compact ? "fx-compact" : ""}`} style={{ "--fx-color": preset.color, "--fx-scale": clamp(preset.scale, 50, 150) / 100 } as React.CSSProperties}>
    <canvas ref={canvasRef} className="fx-canvas" aria-hidden="true" />
    <div className="fx-light" aria-hidden="true" />
    {preset.effect === "portal" && <div className="fx-portal-core" aria-hidden="true" />}
    {(preset.effect === "apparition" || preset.effect === "spectral") ? <div className="fx-ghost" aria-hidden="true">
      <svg viewBox="0 0 300 390" width="100%" height="100%" role="presentation">
        <defs>
          <radialGradient id="umbral-ghost-body" cx="50%" cy="29%" r="68%">
            <stop offset="0%" stopColor="#f8fcff" stopOpacity=".93"/>
            <stop offset="40%" stopColor="#e2effa" stopOpacity=".58"/>
            <stop offset="79%" stopColor="#b2c9d9" stopOpacity=".18"/>
            <stop offset="100%" stopColor="#8eacba" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="umbral-ghost-veil"><stop offset="0%" stopColor="#e6f7ff" stopOpacity=".42"/><stop offset="100%" stopColor="#c4ebff" stopOpacity="0"/></radialGradient>
          <filter id="umbral-ghost-blur"><feGaussianBlur stdDeviation="12"/></filter>
        </defs>
        <path d="M150 28C94 18 70 66 67 118C64 154 48 188 19 257C2 307 42 292 74 283C96 275 94 356 124 324C148 303 166 377 192 329C216 298 234 342 253 299C281 236 234 202 231 127C229 63 205 30 150 28Z" fill="url(#umbral-ghost-veil)" filter="url(#umbral-ghost-blur)"/>
        <path d="M151 35C111 23 89 66 87 118C85 164 70 184 46 250C26 307 82 266 97 281C108 297 108 336 134 301C153 280 168 340 186 305C205 270 222 312 239 277C263 230 208 189 214 124C217 67 189 36 151 35Z" fill="url(#umbral-ghost-body)"/>
        <path d="M119 86Q148 67 181 90M112 160Q153 175 193 158" fill="none" stroke="#fff" strokeOpacity=".23" strokeWidth="4"/>
        <ellipse cx="120" cy="150" rx="11" ry="19" fill="#07101a" opacity=".9" transform="rotate(-10 120 150)"/>
        <ellipse cx="180" cy="150" rx="11" ry="19" fill="#07101a" opacity=".9" transform="rotate(10 180 150)"/>
        <path d="M143 192Q150 178 157 192L162 209Q152 221 139 209Z" fill="#07101a" opacity=".73"/>
        <path d="M150 240C139 269 170 277 152 300" stroke="#fff" strokeOpacity=".18" fill="none" strokeWidth="10"/>
      </svg>
    </div> : preset.effect === "fog" ? <div className="fx-fog-presence" aria-hidden="true"><span/><span/><span/></div> :
    <div className="fx-figure" aria-hidden="true">{glyphs[preset.effect]}</div>}
    {preset.effect === "portal" && <div className="fx-portal-inner" aria-hidden="true" />}
    {preset.effect === "blood" && <div className="fx-blood-vignette" aria-hidden="true" />}
    {preset.effect === "glitch" && <div className="fx-glitch-echo" aria-hidden="true">{glyphs.glitch}</div>}
    {preset.showText && <div className="fx-caption"><p className="fx-message">{preset.message}</p><p className="fx-sender">{sender}</p><p className="fx-gift">ha enviado <strong>{giftName}</strong></p></div>}
    <style jsx>{`
      .fx-stage{position:relative;width:100%;height:100%;min-height:180px;overflow:hidden;isolation:isolate;transform:scale(var(--fx-scale));display:grid;place-items:center;color:var(--fx-color);text-align:center;contain:layout paint}
      .fx-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2}
      .fx-light{position:absolute;z-index:0;width:67%;aspect-ratio:1;border-radius:100%;background:radial-gradient(circle,var(--fx-color),transparent 70%);opacity:.17;filter:blur(46px);animation:breath 3.4s ease-in-out infinite alternate}
      .fx-figure{position:absolute;z-index:1;top:11%;font-size:clamp(85px,14vw,225px);line-height:1;color:var(--fx-color);filter:drop-shadow(0 0 25px var(--fx-color));animation:manifest .9s cubic-bezier(.2,.85,.3,1) both}
      .fx-ghost{position:absolute;z-index:3;top:1%;width:min(52%,350px);height:66%;filter:drop-shadow(0 0 19px #bcdfff);animation:ghostManifest 4.6s ease-in-out both;opacity:.9}
      .fx-ghost:before{content:"";position:absolute;inset:9% 8%;border-radius:50%;background:radial-gradient(ellipse,#b2defb24,transparent 68%);filter:blur(20px)}
      .fx-compact .fx-ghost{width:47%;height:64%}
      .fx-portal .fx-figure{opacity:.22;animation:slowSpin 13s linear infinite}
      .fx-portal-core{position:absolute;top:11%;z-index:1;width:min(38%,300px);aspect-ratio:1;border:2px solid var(--fx-color);border-radius:50%;box-shadow:0 0 44px var(--fx-color),inset 0 0 45px var(--fx-color);animation:slowSpin 11s linear infinite}
      .fx-portal-inner{position:absolute;z-index:1;top:15%;width:min(30%,245px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 50% 50%,#06010c 18%,#180924 47%,var(--fx-color) 86%,transparent 90%);opacity:.85;box-shadow:inset 0 0 44px #04000d,0 0 28px var(--fx-color);animation:portalSurge 3s ease-in-out infinite alternate}
      .fx-fog-presence{position:absolute;inset:12% 12% 18%;z-index:1;opacity:.55;filter:blur(16px);animation:ghostManifest 5s ease-in-out both}
      .fx-fog-presence span{position:absolute;bottom:10%;width:21%;height:53%;border-radius:50% 50% 36% 35%;background:linear-gradient(to bottom,transparent,#d4e7ef48,transparent)}
      .fx-fog-presence span:nth-child(1){left:17%;transform:rotate(-12deg)}.fx-fog-presence span:nth-child(2){left:40%;height:73%}.fx-fog-presence span:nth-child(3){left:63%;transform:rotate(14deg)}
      .fx-blood .fx-figure{font-size:clamp(70px,12vw,150px);opacity:.25}
      .fx-blood-vignette{pointer-events:none;position:absolute;inset:0;z-index:1;background:radial-gradient(ellipse at center,transparent 42%,#5b000020 80%,#2500005c 100%);animation:manifest 1.2s both}
      .fx-glitch .fx-figure{animation:interference .28s steps(2,end) infinite}
      .fx-glitch-echo{position:absolute;top:11%;z-index:2;font-size:clamp(85px,14vw,225px);line-height:1;color:#22d3ee;mix-blend-mode:screen;opacity:.18;animation:glitchEcho .36s steps(2,end) infinite}
      .fx-caption{position:absolute;z-index:5;top:61%;width:96%;padding:0 3%;color:#fff;text-shadow:0 2px 12px #000,0 0 20px #000;animation:captionReveal 1.15s .35s cubic-bezier(.2,.8,.2,1) both}
      .fx-caption:before{content:"";display:block;width:clamp(30px,8%,75px);height:1px;margin:0 auto 12px;background:var(--fx-color);box-shadow:0 0 12px var(--fx-color)}
      .fx-message{font-size:clamp(9px,1.1vw,15px);font-weight:800;letter-spacing:.2em;color:var(--fx-color);text-transform:uppercase}
      .fx-sender{margin-top:11px;font-size:clamp(18px,4vw,48px);font-weight:900;line-height:1.12;overflow-wrap:anywhere;letter-spacing:-.035em}
      .fx-gift{margin-top:8px;font-size:clamp(12px,1.8vw,22px);font-weight:500}
      .fx-gift strong{color:var(--fx-color)}
      .fx-compact .fx-figure{top:12%;font-size:64px}.fx-compact .fx-glitch-echo{font-size:64px}.fx-compact .fx-portal-core{top:17%;width:35%}.fx-compact .fx-portal-inner{top:21%;width:26%}
      .fx-compact .fx-caption{top:64%}.fx-compact .fx-message{font-size:8px}.fx-compact .fx-sender{font-size:13px}.fx-compact .fx-gift{font-size:10px}.fx-compact .fx-caption:before{margin-bottom:5px}
      @keyframes manifest{from{opacity:0;transform:translateY(24px) scale(.72)}to{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes captionReveal{from{opacity:0;filter:blur(9px);transform:translateY(26px) scale(.94)}to{opacity:1;filter:blur(0);transform:translateY(0) scale(1)}}
      @keyframes breath{from{opacity:.09;transform:scale(.78)}to{opacity:.27;transform:scale(1.2)}}
      @keyframes ghostManifest{0%{opacity:0;filter:blur(21px) drop-shadow(0 0 4px #bcdfff);transform:translateY(46px) scale(.85)}28%{opacity:.8;filter:blur(3px) drop-shadow(0 0 21px #bcdfff)}65%{opacity:.92;transform:translateY(-9px) scale(1.03)}100%{opacity:0;filter:blur(19px) drop-shadow(0 0 4px #bcdfff);transform:translateY(-36px) scale(1.08)}}
      @keyframes slowSpin{to{transform:rotate(360deg)}}
      @keyframes portalSurge{from{transform:scale(.86) rotate(-8deg);opacity:.57}to{transform:scale(1.13) rotate(8deg);opacity:.98}}
      @keyframes interference{0%,100%{transform:translate(0);clip-path:inset(0)}22%{transform:translate(-5px,3px);clip-path:inset(12% 0 4%)}48%{transform:translate(6px,-3px);clip-path:inset(3% 0 22%)}75%{transform:translate(-3px,4px);clip-path:inset(18% 0 2%)}}
      @keyframes glitchEcho{0%,100%{transform:translate(-8px,0);opacity:.1}45%{transform:translate(8px,-3px);opacity:.3}75%{transform:translate(-2px,5px);opacity:.08}}
      @media(prefers-reduced-motion:reduce){.fx-figure,.fx-ghost,.fx-caption,.fx-light,.fx-portal-core,.fx-portal-inner,.fx-fog-presence,.fx-glitch-echo{animation:none!important}.fx-ghost,.fx-fog-presence{opacity:.65!important;filter:none!important}}
    `}</style>
  </div>;
}
