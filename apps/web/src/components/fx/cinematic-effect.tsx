"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PremiumWraithMotion } from "@/components/fx/premium-wraith-motion";
import type { EffectPreset } from "@/features/live/settings";

type Props = { preset: EffectPreset; sender?: string; giftName?: string; compact?: boolean };
const glyphs: Record<EffectPreset["effect"], string> = {
  apparition: "♱", bloodmoon: "◉", embers: "✦", glitch: "♛",
  portal: "◎", fog: "☽", blood: "♦", spectral: "♱", wraith: "✦",
};
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function CinematicEffect({ preset, sender = "UmbralCreepy", giftName = "Regalo de prueba", compact = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [premiumArtLoaded, setPremiumArtLoaded] = useState(false);
  const onPremiumAssetStatus = useCallback((loaded: boolean) => setPremiumArtLoaded(loaded), []);
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
      const t = compact || reduced ? 2.15 : (performance.now() - started) / 1000;
      const duration = Math.max(2, Math.min(12, preset.duration));
      const intro = compact || reduced ? 1 : Math.min(1, t / 0.85);
      const outro = compact || reduced ? 1 : Math.min(1, Math.max(0, (duration - t) / 0.9));
      const envelope = Math.max(0, Math.min(intro, outro));
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height * 0.44;
      const radius = Math.min(width, height) * (compact ? 0.19 : 0.24);
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = envelope;

      // Atmospheric volumes: layered noise-free translucent gradients, drawn at different depths.
      const mist = preset.effect === "fog" || preset.effect === "spectral" || preset.effect === "apparition" || preset.effect === "portal" || preset.effect === "wraith";
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

      if (preset.effect === "wraith") {
        // An overhead shaft, drifting ash and cold vapor: independent of the standard ghost.
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const shaft = ctx.createLinearGradient(centerX, 0, centerX, height * 0.84);
        shaft.addColorStop(0, "#e2f5ff28");
        shaft.addColorStop(0.48, "#b5dcff16");
        shaft.addColorStop(1, "#a7cfff00");
        ctx.globalAlpha = envelope * (compact ? 0.95 : 0.7);
        ctx.fillStyle = shaft;
        ctx.beginPath();
        ctx.moveTo(centerX - width * 0.045, 0);
        ctx.lineTo(centerX + width * 0.045, 0);
        ctx.lineTo(centerX + width * 0.24, height * 0.85);
        ctx.lineTo(centerX - width * 0.24, height * 0.85);
        ctx.closePath();
        ctx.fill();
        const aura = ctx.createRadialGradient(centerX, centerY * 0.8, 4, centerX, centerY, radius * 1.7);
        aura.addColorStop(0, "#d9f4ff36");
        aura.addColorStop(0.42, "#b3e3ff17");
        aura.addColorStop(1, "#97cfff00");
        ctx.globalAlpha = envelope * 0.9;
        ctx.fillStyle = aura;
        ctx.fillRect(centerX - radius * 1.7, centerY - radius * 1.7, radius * 3.4, radius * 3.4);
        for (let i = 0; i < (compact ? 22 : 58); i++) {
          const angle = i * 2.39996 + (reduced ? 0 : t * 0.15);
          const reach = radius * (0.24 + ((i * 13) % 31) / 25);
          const px = centerX + Math.cos(angle) * reach;
          const py = centerY + Math.sin(angle * 1.25) * reach * 1.3;
          ctx.beginPath();
          ctx.arc(px, py, i % 7 === 0 ? 1.65 : 0.8, 0, Math.PI * 2);
          ctx.fillStyle = i % 5 === 0 ? "#ffffff" : "#bcdfff";
          ctx.globalAlpha = envelope * (0.18 + (i % 4) * 0.13);
          ctx.fill();
        }
        ctx.restore();
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
      if (!reduced && !compact) { frame++; raf = requestAnimationFrame(render); }
    };
    render();
    return () => { cancelAnimationFrame(raf); observer.disconnect(); };
  }, [preset.effect, preset.color, preset.duration, compact]);


  return <div className={`fx-stage fx-${preset.effect} ${compact ? "fx-compact" : ""}`} style={{ "--fx-color": preset.color, "--fx-scale": clamp(preset.scale, 50, 150) / 100, "--fx-duration": `${clamp(preset.duration, 2, 12)}s` } as React.CSSProperties}>
    <div className="fx-atmosphere" aria-hidden="true" /><div className="fx-scene-backdrop" aria-hidden="true" />
    <canvas ref={canvasRef} className="fx-canvas" aria-hidden="true" />
    <div className="fx-light" aria-hidden="true" />
    {preset.effect === "portal" && <div className="fx-portal-core" aria-hidden="true" />}
    {preset.effect === "bloodmoon" && <div className="fx-moon" aria-hidden="true"><span /></div>}
    {preset.effect === "embers" && <div className="fx-ember-storm" aria-hidden="true"><span/><span/><span/><span/><span/></div>}
    {preset.effect === "wraith" && <div className={`fx-wraith ${premiumArtLoaded ? "fx-wraith-photo-mode" : ""}`} aria-hidden="true">
      <div className="fx-wraith-halo" />
      <PremiumWraithMotion compact={compact} duration={preset.duration} onAssetStatus={onPremiumAssetStatus} />
      {!premiumArtLoaded && <svg className="fx-wraith-art" viewBox="0 0 320 430" width="100%" height="100%" role="presentation">
        <defs>
          <radialGradient id="umbral-wraith-core" cx="50%" cy="26%" r="78%">
            <stop offset="0%" stopColor="#fbfeff" stopOpacity=".91"/>
            <stop offset="31%" stopColor="#e3f5ff" stopOpacity=".65"/>
            <stop offset="70%" stopColor="#9acde8" stopOpacity=".23"/>
            <stop offset="100%" stopColor="#6497ba" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="umbral-wraith-trail" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e9f9ff" stopOpacity=".48"/>
            <stop offset="65%" stopColor="#b8dff4" stopOpacity=".14"/>
            <stop offset="100%" stopColor="#94c2db" stopOpacity="0"/>
          </linearGradient>
          <filter id="umbral-wraith-soft"><feGaussianBlur stdDeviation="12"/></filter>
        </defs>
        <ellipse cx="160" cy="171" rx="91" ry="134" fill="#d9f4ff4a" filter="url(#umbral-wraith-soft)"/>
        <path d="M160 35C110 30 84 69 77 122C70 178 55 221 24 281C10 315 33 337 55 325C77 315 86 328 94 345C109 369 126 322 143 345C157 365 173 357 187 332C203 308 220 357 237 333C249 315 276 317 285 294C306 263 279 220 258 178C243 142 250 88 217 59C202 45 183 35 160 35Z" fill="url(#umbral-wraith-trail)" filter="url(#umbral-wraith-soft)"/>
        <path d="M161 49C120 43 98 84 92 134C87 180 76 221 55 273C44 300 64 304 84 294C102 284 113 303 118 320C130 350 145 314 158 323C172 335 183 342 196 313C208 287 228 331 240 307C255 278 265 294 271 277C281 255 260 224 250 189C239 152 242 104 214 75C200 57 184 50 161 49Z" fill="url(#umbral-wraith-core)"/>
        <path d="M102 135Q118 116 138 144Q137 171 116 170Q99 165 102 135Z" fill="#09111c" opacity=".83"/>
        <path d="M166 143Q181 115 197 138Q204 166 183 170Q163 167 166 143Z" fill="#09111c" opacity=".83"/>
        <path d="M151 187Q165 179 172 195Q171 217 158 225Q145 218 151 187Z" fill="#07111a" opacity=".69"/>
        <path d="M109 220C128 261 98 314 120 346M165 230C149 281 192 307 175 351M210 224C183 266 228 307 205 346" stroke="#ebf9ff" strokeOpacity=".2" strokeWidth="13" strokeLinecap="round" fill="none"/>
        <path d="M116 96Q160 77 199 99" stroke="#ffffff" strokeOpacity=".26" strokeWidth="3" fill="none"/>
      </svg>}
      <div className="fx-wraith-shroud" />
    </div>}
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
        <path d="M104 135Q121 117 136 142Q127 166 113 165Q103 159 104 135Z" fill="#08111d" opacity=".73"/>
        <path d="M164 142Q179 118 195 136Q199 157 185 164Q170 169 164 142Z" fill="#08111d" opacity=".73"/>
        <path d="M137 188Q149 179 163 190Q162 216 150 226Q139 215 137 188Z" fill="#090f1a" opacity=".55"/>
        <path d="M100 208Q132 245 104 287M195 208Q160 249 196 291M150 228Q137 278 152 313" stroke="#eaf6ff" strokeOpacity=".17" fill="none" strokeWidth="13" strokeLinecap="round"/>
        <path d="M117 97Q150 80 180 96" fill="none" stroke="#fff" strokeOpacity=".26" strokeWidth="4"/>
      </svg>
    </div> : preset.effect === "fog" ? <div className="fx-fog-presence" aria-hidden="true"><span/><span/><span/></div> :
    (preset.effect === "wraith" ? null : preset.effect === "glitch" ? <div className="fx-signal" aria-hidden="true"><span>NO SIGNAL</span><i/><i/><i/></div> : preset.effect === "blood" ? <div className="fx-blood-mark" aria-hidden="true"><span/><span/><span/></div> : <div className="fx-figure" aria-hidden="true">{glyphs[preset.effect]}</div>)}
    {preset.effect === "portal" && <div className="fx-portal-inner" aria-hidden="true" />}
    {preset.effect === "blood" && <div className="fx-blood-vignette" aria-hidden="true" />}
    {preset.effect === "glitch" && <div className="fx-glitch-echo" aria-hidden="true">SIGNAL LOST</div>}
    {preset.showText && <div className="fx-caption"><p className="fx-message">{preset.message}</p><p className="fx-sender">{sender}</p><p className="fx-gift">ha enviado <strong>{giftName}</strong></p></div>}
    <style jsx>{`
      /* The editor/gallery uses a fixed hero frame; its thumbnail must not fade to black at animation end. */
      .fx-atmosphere{position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse at 50% 43%,color-mix(in srgb,var(--fx-color) 17%,transparent),transparent 60%);pointer-events:none}
      .fx-scene-backdrop{position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse at 50% 40%,transparent 18%,#05050944 64%,#020204aa 100%)}
      .fx-compact{transform:none!important}
      .fx-compact .fx-ghost{animation:none!important;opacity:.94!important;filter:drop-shadow(0 0 14px #bcdfff)!important;transform:translateY(-4px) scale(1.06)!important}
      .fx-compact .fx-fog-presence{animation:none!important;opacity:.85!important;filter:blur(12px)!important}
      .fx-compact .fx-caption{animation:none!important;opacity:1!important;filter:none!important;transform:none!important}
      .fx-compact .fx-light{animation:none!important;opacity:.25!important;transform:scale(1.08)!important}
      .fx-compact .fx-portal-core,.fx-compact .fx-portal-inner{animation:none!important}
      .fx-compact .fx-figure{animation:none!important;opacity:1}
      .fx-compact .fx-atmosphere{background:radial-gradient(ellipse at 50% 44%,color-mix(in srgb,var(--fx-color) 23%,transparent),transparent 61%)}
      .fx-moon{position:absolute;top:12%;left:50%;z-index:2;width:min(34%,280px);aspect-ratio:1;border-radius:50%;transform:translateX(-50%);background:radial-gradient(circle at 33% 27%,#f4a3a3 0%,#c74452 19%,#931625 48%,#38060f 80%,#15040a 100%);box-shadow:0 0 42px #cb222966,0 0 95px #c12b322f,inset -19px -12px 35px #200209;border:1px solid #f8a5a542}
      .fx-moon:before{content:"";position:absolute;inset:12%;border-radius:50%;background:radial-gradient(circle at 27% 37%,#15020849 0 9%,transparent 11%),radial-gradient(circle at 67% 61%,#1d050a48 0 12%,transparent 15%),radial-gradient(circle at 51% 27%,#2b041054 0 7%,transparent 9%);mix-blend-mode:multiply}
      .fx-moon span{position:absolute;inset:-12%;border:1px solid #d7424339;border-radius:50%;box-shadow:0 0 25px #c82e3d55}
      .fx-bloodmoon .fx-figure{display:none}
      .fx-ember-storm{position:absolute;inset:0;z-index:2;pointer-events:none}
      .fx-ember-storm span{position:absolute;left:var(--x);bottom:var(--y);width:var(--s);height:var(--s);background:#ffb16c;border-radius:40%;box-shadow:0 0 14px 3px #ff4d1a82;transform:rotate(35deg);animation:embersAscend 3s ease-in-out infinite alternate}
      .fx-ember-storm span:nth-child(1){--x:30%;--y:24%;--s:7px}.fx-ember-storm span:nth-child(2){--x:57%;--y:36%;--s:4px;animation-delay:-1s}.fx-ember-storm span:nth-child(3){--x:67%;--y:18%;--s:8px;animation-delay:-1.7s}.fx-ember-storm span:nth-child(4){--x:42%;--y:63%;--s:3px;animation-delay:-2s}.fx-ember-storm span:nth-child(5){--x:75%;--y:54%;--s:5px;animation-delay:-.5s}
      .fx-embers .fx-figure{display:none}
      .fx-signal{position:absolute;top:23%;left:50%;transform:translateX(-50%);z-index:2;width:68%;border:1px solid #ff556b5e;background:repeating-linear-gradient(0deg,#14101b 0 3px,#0b0d13 3px 6px);padding:14px 3px;font-size:clamp(13px,3vw,25px);font-weight:900;letter-spacing:.25em;text-shadow:2px 0 #20d6f3,-2px 0 #fb3567;box-shadow:0 0 35px #d22c4440;animation:signalJolt 3s steps(2,end) infinite}
      .fx-signal i{display:block;width:100%;height:2px;background:#ff3a6c55;margin-top:5px}
      .fx-glitch-echo{font-size:clamp(11px,2vw,21px)!important;letter-spacing:.12em;top:18%!important}
      .fx-blood-mark{position:absolute;top:9%;left:28%;width:44%;height:65%;z-index:2;border-radius:47% 32% 52% 40%;transform:rotate(-12deg);background:radial-gradient(ellipse at 40% 26%,#fa475c88,#b20915bc 47%,#3600069c 78%,transparent 82%);filter:drop-shadow(0 0 13px #b3070b4d);clip-path:polygon(2% 16%,25% 4%,59% 0,89% 16%,100% 45%,82% 72%,86% 100%,63% 84%,44% 97%,28% 78%,5% 86%,14% 52%)}
      .fx-blood-mark span{position:absolute;background:#78030b;border-radius:50%;width:10%;height:19%;top:58%;left:19%;box-shadow:28px 8px #8d0610,55px -5px #af0e1a}
      .fx-blood .fx-figure{display:none}
      @keyframes embersAscend{from{transform:translateY(16px) rotate(20deg);opacity:.45}to{transform:translateY(-34px) rotate(65deg);opacity:1}}
      @keyframes signalJolt{0%,90%,100%{filter:none}92%{filter:brightness(1.8);transform:translateX(calc(-50% + 5px))}95%{transform:translateX(calc(-50% - 5px))}}
      @media(prefers-reduced-motion:reduce){.fx-signal,.fx-ember-storm span{animation:none!important}}
      .fx-wraith{position:absolute;z-index:4;top:0;left:50%;width:min(60%,410px);height:74%;pointer-events:none;transform:translateX(-50%);animation:wraithRise var(--fx-duration) ease-in-out both}
      .fx-wraith-photo{position:absolute;z-index:2;left:50%;top:1%;width:140%;max-width:none;height:auto;transform:translateX(-50%);object-fit:contain;filter:drop-shadow(0 0 18px #a2d8f155) contrast(1.09);user-select:none;pointer-events:none;animation:wraithPhotoFloat 4.8s ease-in-out infinite alternate}
      .fx-compact .fx-wraith-photo{width:165%;top:-6%;animation:none!important}
      .fx-wraith-photo-mode{width:min(110%,900px);height:83%}
      .fx-compact .fx-wraith-photo-mode{width:94%;height:86%}
      @keyframes wraithPhotoFloat{from{transform:translate(-50%,-9px) scale(.99)}to{transform:translate(-50%,9px) scale(1.04)}}
      .fx-wraith-photo-mode .fx-wraith-art{display:none}
      .fx-wraith-halo{position:absolute;inset:13% 0 6%;background:radial-gradient(ellipse,#c7ecff55 0%,#9ccdf225 35%,transparent 70%);filter:blur(25px)}
      .fx-wraith-art{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 0 22px #badfffa0)}
      .fx-wraith-shroud{position:absolute;inset:30% -8% -3%;background:linear-gradient(to bottom,transparent 10%,#c5ebff14 35%,transparent 80%);filter:blur(26px);animation:wraithBreath 3.2s ease-in-out infinite alternate}
      .fx-wraith .fx-wraith-art{animation:wraithFloat 4.2s ease-in-out infinite alternate}
      .fx-compact .fx-wraith{width:47%;height:73%;animation:none!important;transform:translateX(-50%)!important;opacity:1!important;filter:none!important}
      .fx-compact .fx-wraith-art,.fx-compact .fx-wraith-shroud{animation:none!important}
      .fx-wraith .fx-wraith-shroud{border-radius:50%}
      .fx-wraith + .fx-caption{z-index:6}
      @keyframes wraithRise{0%{opacity:0;filter:blur(22px);transform:translate(-50%,50px) scale(.82)}18%{opacity:.48;filter:blur(12px);transform:translate(-50%,24px) scale(.92)}43%{opacity:.96;filter:blur(1px);transform:translate(-50%,-3px) scale(1)}68%{opacity:1;filter:blur(0);transform:translate(-50%,-10px) scale(1.04)}100%{opacity:0;filter:blur(19px);transform:translate(-50%,-40px) scale(1.09)}}
      @keyframes wraithFloat{from{transform:translateY(-8px)}to{transform:translateY(11px)}}
      @keyframes wraithBreath{from{opacity:.3;transform:scale(.9)}to{opacity:.8;transform:scale(1.13)}}
      @media(prefers-reduced-motion:reduce){.fx-wraith,.fx-wraith-art,.fx-wraith-photo,.fx-wraith-shroud{animation:none!important;opacity:1!important;filter:none!important;transform:translateX(-50%)!important}.fx-wraith-art,.fx-wraith-shroud{transform:none!important}}
      .fx-stage{position:relative;width:100%;height:100%;min-height:180px;overflow:hidden;isolation:isolate;transform:scale(var(--fx-scale));display:grid;place-items:center;color:var(--fx-color);text-align:center;contain:layout paint}
      .fx-canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2}
      .fx-light{position:absolute;z-index:0;width:67%;aspect-ratio:1;border-radius:100%;background:radial-gradient(circle,var(--fx-color),transparent 70%);opacity:.17;filter:blur(46px);animation:breath 3.4s ease-in-out infinite alternate}
      .fx-figure{position:absolute;z-index:1;top:11%;font-size:clamp(85px,14vw,225px);line-height:1;color:var(--fx-color);filter:drop-shadow(0 0 25px var(--fx-color));animation:manifest .9s cubic-bezier(.2,.85,.3,1) both}
      .fx-ghost{position:absolute;z-index:3;top:1%;width:min(52%,350px);height:66%;filter:drop-shadow(0 0 19px #bcdfff);animation:ghostManifest var(--fx-duration) ease-in-out both;opacity:.9}
      .fx-ghost:before{content:"";position:absolute;inset:9% 8%;border-radius:50%;background:radial-gradient(ellipse,#b2defb24,transparent 68%);filter:blur(20px)}
      .fx-compact .fx-ghost{width:47%;height:64%}
      .fx-portal .fx-figure{display:none}
      .fx-portal-core{position:absolute;top:11%;z-index:1;width:min(38%,300px);aspect-ratio:1;border:2px solid var(--fx-color);border-radius:50%;box-shadow:0 0 44px var(--fx-color),inset 0 0 45px var(--fx-color);animation:slowSpin 11s linear infinite}
      .fx-portal-inner{position:absolute;z-index:1;top:15%;width:min(30%,245px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 50% 50%,#06010c 18%,#180924 47%,var(--fx-color) 86%,transparent 90%);opacity:.85;box-shadow:inset 0 0 44px #04000d,0 0 28px var(--fx-color);animation:portalSurge 3s ease-in-out infinite alternate}
      .fx-fog-presence{position:absolute;inset:12% 12% 18%;z-index:1;opacity:.55;filter:blur(16px);animation:ghostManifest var(--fx-duration) ease-in-out both}
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
