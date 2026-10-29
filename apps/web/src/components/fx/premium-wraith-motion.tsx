"use client";

import { useEffect, useRef, useState } from "react";

type Props = { compact?: boolean; duration: number; onAssetStatus?: (loaded: boolean) => void };
const FILE = "/images/fx/umbral-premium-wraith.png";
const W = 960;
const H = 351;
const S = W / 1440;

function gradientMask(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rx: number, ry: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  const g = ctx.createRadialGradient(0, 0, 0.4, 0, 0, 1);
  g.addColorStop(0, "#fff");
  g.addColorStop(0.63, "#fff");
  g.addColorStop(0.86, "#ffffffb0");
  g.addColorStop(1, "#ffffff00");
  ctx.fillStyle = g;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
}

/** Animates the existing transparent photograph via localized source-image deformation.
 *  Mouth movement is simulated from one still; it is not a synthesized talking face.
 *  Rendered frames are transparent and keep all user/gift text outside the image. */
export function PremiumWraithMotion({ compact = false, duration, onAssetStatus }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    let raf = 0;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    canvas.width = W;
    canvas.height = H;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouthLayer = document.createElement("canvas");
    mouthLayer.width = W;
    mouthLayer.height = H;
    const mouth = mouthLayer.getContext("2d", { alpha: true });
    const handLayer = document.createElement("canvas");
    handLayer.width = W;
    handLayer.height = H;
    const hand = handLayer.getContext("2d", { alpha: true });
    const start = performance.now();
    let lastPaint = 0;

    const paint = (time: number) => {
      if (!alive || !mouth || !hand) return;
      if (time - lastPaint < 1000 / 24 && lastPaint !== 0) {
        raf = requestAnimationFrame(paint);
        return;
      }
      lastPaint = time;
      const seconds = (time - start) / 1000;
      // 0=almost closed, 1=fully open. Two deliberate scream pulses, not lip-sync.
      const pulse = (Math.sin(seconds * 2.65 - 0.9) + 1) / 2;
      const openness = reduced || compact ? 0.86 : 0.16 + Math.pow(pulse, 1.45) * 0.84;
      const compression = (1 - openness) * 0.57;
      const sway = reduced || compact ? 0 : Math.sin(seconds * 1.35) * 2.8;
      const reach = reduced || compact ? 0 : (Math.sin(seconds * 1.6 - 0.3) + 1) / 2;
      const edgeX = (x: number) => Math.exp(-Math.pow((x - 843) / 63, 4));
      const mapY = (x: number, y: number) => {
        const local = Math.exp(-Math.pow((y - 207) / 76, 4));
        return y - (y - 207) * compression * edgeX(x) * local;
      };

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);

      // Morph the mouth region with a continuous vertical mesh. The surrounding
      // skin stays aligned through a feathered mask, avoiding a pasted oval.
      if (!compact && !reduced) {
        mouth.clearRect(0, 0, W, H);
        for (let x = 754; x < 936; x += 8) {
          for (let y = 121; y < 296; y += 6) {
            const sw = Math.min(8, 936 - x);
            const sh = Math.min(6, 296 - y);
            const top = mapY(x + sw / 2, y);
            const bottom = mapY(x + sw / 2, y + sh);
            mouth.drawImage(img, x, y, sw, sh, x * S, top * S, sw * S + 0.35, Math.max(1, (bottom - top) * S + 0.4));
          }
        }
        mouth.globalCompositeOperation = "destination-in";
        gradientMask(mouth, 842 * S, 208 * S, 89 * S, 105 * S);
        mouth.globalCompositeOperation = "source-over";
        ctx.drawImage(mouthLayer, 0, 0);
      }

      // Slow foreground-hand reach, isolated from the face, with feathered edges.
      hand.clearRect(0, 0, W, H);
      hand.save();
      const scale = 1 + reach * 0.034;
      const hx = 515 * S;
      const hy = 350 * S;
      hand.translate(hx + sway, hy - reach * 3.5);
      hand.scale(scale, scale);
      hand.translate(-hx, -hy);
      hand.drawImage(img, 0, 0, W, H);
      hand.restore();
      hand.globalCompositeOperation = "destination-in";
      gradientMask(hand, 518 * S, 350 * S, 205 * S, 168 * S);
      hand.globalCompositeOperation = "source-over";
      if (!compact && !reduced) ctx.drawImage(handLayer, 0, 0);

      // Eye highlights pulse independently from the source photograph.
      const glow = compact || reduced ? 0.32 : 0.24 + 0.2 * Math.pow((Math.sin(seconds * 4.5) + 1) / 2, 3);
      for (const [eyeX, eyeY] of [[805, 116], [881, 125]] as const) {
        const x = eyeX * S, y = eyeY * S;
        const halo = ctx.createRadialGradient(x, y, 0, x, y, 15 * S);
        halo.addColorStop(0, `rgba(219,246,255,${glow})`);
        halo.addColorStop(0.28, `rgba(155,215,255,${glow * 0.48})`);
        halo.addColorStop(1, "rgba(100,190,255,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, 15 * S, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced && !compact && seconds < Math.max(2, duration)) raf = requestAnimationFrame(paint);
    };

    img.onload = () => {
      if (!alive) return;
      if (img.naturalWidth < 10 || img.naturalHeight < 10) {
        setFailed(true);
        onAssetStatus?.(false);
        return;
      }
      setFailed(false);
      onAssetStatus?.(true);
      raf = requestAnimationFrame(paint);
    };
    img.onerror = () => { if (alive) { setFailed(true); onAssetStatus?.(false); } };
    img.src = FILE;
    return () => { alive = false; cancelAnimationFrame(raf); img.onload = null; img.onerror = null; };
  }, [compact, duration, onAssetStatus]);

  return <>
    <canvas ref={canvasRef} aria-hidden="true" className="fx-wraith-motion" style={{ display: failed ? "none" : "block" }} />
    {failed && <img src={FILE} alt="" className="fx-wraith-motion-fallback" />}
    <style jsx>{`
      .fx-wraith-motion,.fx-wraith-motion-fallback{
        position:absolute;inset:0;width:100%;height:100%;object-fit:contain;
        pointer-events:none;user-select:none;filter:drop-shadow(0 0 15px #b2dcff45)
      }
    `}</style>
  </>;
}
