"use client";

import { ElementType, useEffect, useRef } from "react";
import { sky } from "@/lib/sky";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** "intro": se forma al cargar (hero); "scroll": se forma al entrar en pantalla */
  mode?: "intro" | "scroll";
};

const M = 160; // margen del lienzo para que los granos vuelen fuera de la caja

/**
 * Titular hecho de arena. El texto real queda en el DOM (transparente) para accesibilidad;
 * un canvas lo dibuja con miles de granos muestreados de la propia tipografía.
 */
export default function SandTitle({ text, as: Tag = "h2", className = "", mode = "scroll" }: Props) {
  const box = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = box.current!, c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio, 2);
    let W = 0, H = 0, N = 0;
    let tx = new Float32Array(0), ty = new Float32Array(0), th = new Float32Array(0), rr = new Float32Array(0);
    let ox = new Float32Array(0), oy = new Float32Array(0), vx = new Float32Array(0), vy = new Float32Array(0);
    let tone = new Uint8Array(0);
    let ready = false;
    let grain = 2;

    const sample = () => {
      const rect = el.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      c.width = (W + M * 2) * dpr;
      c.height = (H + M * 2) * dpr;
      c.style.width = `${W + M * 2}px`;
      c.style.height = `${H + M * 2}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      const lh = cs.lineHeight === "normal" ? fs * 1.1 : parseFloat(cs.lineHeight);
      // lienzo de muestreo con margen: aunque la métrica del canvas difiera del DOM, nada se recorta
      const PAD = Math.ceil(fs * 0.5);
      const off = document.createElement("canvas");
      off.width = Math.ceil(W + PAD * 2);
      off.height = Math.ceil(H + PAD * 2);
      const o = off.getContext("2d")!;
      // anchura variable: font-stretch del DOM → fontStretch del canvas
      const st = parseFloat(cs.fontStretch);
      const stretch = st <= 62.5 ? "extra-condensed" : st <= 75 ? "condensed" : st <= 87.5 ? "semi-condensed" : "normal";
      o.font = `${cs.fontStyle} ${cs.fontWeight} ${stretch} ${fs}px ${cs.fontFamily}`;
      if ("fontStretch" in o) (o as unknown as { fontStretch: string }).fontStretch = stretch;
      if ("letterSpacing" in o) (o as unknown as { letterSpacing: string }).letterSpacing = cs.letterSpacing;
      o.fillStyle = "#fff";
      o.textBaseline = "middle";
      const align = cs.textAlign === "center" ? "center" : cs.textAlign === "right" || cs.textAlign === "end" ? "right" : "left";
      o.textAlign = align as CanvasTextAlign;
      const x = PAD + (align === "center" ? W / 2 : align === "right" ? W : 0);
      text.split("\n").forEach((line, i) => o.fillText(line, x, PAD + lh * i + lh / 2));
      const data = o.getImageData(0, 0, off.width, off.height).data;

      // muestreo denso: el grano más fino posible sin pasar de ~20k granos
      let gap = Math.max(2, Math.round(fs / 90));
      let pts: number[] = [];
      for (let tries = 0; tries < 8; tries++) {
        pts = [];
        for (let yy = 0; yy < off.height; yy += gap)
          for (let xx = 0; xx < off.width; xx += gap)
            if (data[(yy * off.width + xx) * 4 + 3] > 140) pts.push(xx - PAD, yy - PAD);
        if (pts.length / 2 < 20000) break;
        gap++;
      }
      grain = gap;
      N = pts.length / 2;
      tx = new Float32Array(N); ty = new Float32Array(N); th = new Float32Array(N); rr = new Float32Array(N);
      ox = new Float32Array(N); oy = new Float32Array(N); vx = new Float32Array(N); vy = new Float32Array(N);
      tone = new Uint8Array(N);
      for (let i = 0; i < N; i++) {
        tx[i] = pts[i * 2] + (Math.random() - 0.5) * gap * 0.35;
        ty[i] = pts[i * 2 + 1] + (Math.random() - 0.5) * gap * 0.35;
        rr[i] = Math.random();
        th[i] = 0.72 * (tx[i] / W) + 0.28 * rr[i];
        tone[i] = Math.floor(Math.random() * 3);
      }
      ready = true;
    };

    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);

    document.fonts.ready.then(sample);
    const ro = new ResizeObserver(() => document.fonts.ready.then(sample));
    ro.observe(el);

    const t0 = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!ready || !visible) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // e: cuánto se ha formado al entrar · x: cuánto se ha deshecho al salir
      let e: number, x: number;
      if (reduced) {
        e = 1;
        x = 0;
      } else if (mode === "intro") {
        e = Math.min(1, (now - t0) / 2600);
        e = 1 - Math.pow(1 - e, 2);
        x = Math.min(1, Math.max(0, (vh * 0.18 - r.top) / (vh * 0.55)));
      } else {
        e = Math.min(1, Math.max(0, (vh * 0.95 - r.top) / (vh * 0.42)));
        x = Math.min(1, Math.max(0, (vh * 0.22 - r.bottom) / (vh * 0.4)));
      }

      const ink = getComputedStyle(document.documentElement).getPropertyValue("--ink-rgb") || "40,23,12";
      const [ir, ig, ib] = ink.split(",").map(Number);
      const tones = [
        `rgb(${ir},${ig},${ib})`,
        `rgb(${Math.min(255, ir + 28)},${Math.min(255, ig + 18)},${Math.min(255, ib + 8)})`,
        `rgb(${Math.max(0, ir - 20)},${Math.max(0, ig - 14)},${Math.max(0, ib - 8)})`,
      ];
      // cursor en coordenadas del lienzo
      const cx = sky.px - r.left, cy = sky.py - r.top;
      const R = Math.max(60, Math.min(W, H) * 0.22);
      const t = (now - t0) / 1000;

      ctx.clearRect(-M, -M, W + M * 2, H + M * 2);
      ctx.save();
      ctx.translate(M, M);
      for (let k = 0; k < 3; k++) {
        ctx.fillStyle = tones[k];
        for (let i = 0; i < N; i++) {
          if (tone[i] !== k) continue;
          const ue = Math.min(1, Math.max(0, (th[i] - e) / 0.32 + 0.02));
          const ux = Math.min(1, Math.max(0, (x - th[i]) / 0.32 + 0.02));
          const u = Math.max(ue, ux);
          if (u >= 0.999) continue;
          // viento: entran desde la izquierda, salen hacia la derecha
          const dir = ux > ue ? 1 : -1;
          const fly = u * u;
          let px = tx[i] + dir * fly * (W * 0.55 + rr[i] * 420);
          let py = ty[i] - Math.sin(u * Math.PI) * (18 + rr[i] * 40) + fly * (rr[i] - 0.5) * 160;
          // cursor: ráfaga que dispersa la arena (muelle amortiguado)
          if (u < 0.05) {
            const dx = px + ox[i] - cx, dy = py + oy[i] - cy;
            const d2 = dx * dx + dy * dy;
            if (d2 < R * R) {
              const d = Math.sqrt(d2) || 1;
              const f = (1 - d / R) * 2.4;
              vx[i] += (dx / d) * f + 0.6 * f;
              vy[i] += (dy / d) * f;
            }
          }
          vx[i] = (vx[i] - ox[i] * 0.06) * 0.88;
          vy[i] = (vy[i] - oy[i] * 0.06) * 0.88;
          ox[i] += vx[i];
          oy[i] += vy[i];
          px += ox[i];
          py += oy[i];
          // los granos formados vibran levemente
          if (u === 0 && !reduced) py += Math.sin(t * 2 + rr[i] * 40) * 0.25;
          const a = 1 - u * 0.9;
          // formado: el grano cubre su celda (letra llena); en vuelo: grano suelto
          const s = (grain * (0.8 + rr[i] * 0.45)) * (1 - u * 0.55);
          ctx.globalAlpha = a;
          ctx.fillRect(px, py, s, s);
        }
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [text, mode]);

  return (
    <Tag ref={box} className={`relative whitespace-pre-line text-transparent ${className}`}>
      {text}
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute" style={{ left: -M, top: -M }} />
    </Tag>
  );
}
