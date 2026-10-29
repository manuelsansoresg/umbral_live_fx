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
 *  The mouth opens once as a scream and the eyes glow red; no hand movement.
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
    const start = performance.now();
    let lastPaint = 0;

    const paint = (time: number) => {
      if (!alive || !mouth) return;
      if (time - lastPaint < 1000 / 24 && lastPaint !== 0) {
        raf = requestAnimationFrame(paint);
        return;
      }
      lastPaint = time;
      const seconds = (time - start) / 1000;
      // One deliberate scream: the jaw stays compressed initially, opens
      // rapidly, then remains open before relaxing near the end.
      const timeline = Math.min(1, seconds / Math.max(2, duration));
      const smooth = (x: number) => { const q = Math.max(0, Math.min(1, x)); return q * q * (3 - 2 * q); };
      const opening = compact || reduced ? 1 :
        smooth((timeline - 0.13) / 0.23) * (1 - 0.78 * smooth((timeline - 0.83) / 0.16));
      const compression = (1 - opening) * 0.58;
      const eyeIntensity = compact || reduced ? 0.72 : 0.3 + 0.7 * smooth((timeline - 0.13) / 0.18);
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

      // The original white eye glints become two saturated crimson lights.
      // Additive halos keep the eyes visible even on dark OBS scenes.
      for (const [eyeX, eyeY] of [[805, 116], [881, 125]] as const) {
        const x = eyeX * S;
        const y = eyeY * S;
        const glow = eyeIntensity * (0.86 + 0.14 * Math.sin(seconds * 5.2));
        const outer = ctx.createRadialGradient(x, y, 0, x, y, 29 * S);
        outer.addColorStop(0, `rgba(255,65,65,${Math.min(1, glow)})`);
        outer.addColorStop(0.18, `rgba(240,14,32,${glow * 0.8})`);
        outer.addColorStop(0.48, `rgba(215,0,22,${glow * 0.36})`);
        outer.addColorStop(1, "rgba(130,0,12,0)");
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = outer;
        ctx.beginPath();
        ctx.arc(x, y, 29 * S, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,33,35,${Math.min(1, glow * 0.95)})`;
        ctx.beginPath();
        ctx.ellipse(x, y, 3.7 * S, 3.2 * S, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
