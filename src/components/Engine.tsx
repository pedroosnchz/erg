"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { dayness, sky } from "@/lib/sky";

const mixHex = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const NIGHT_INK = [244, 233, 216];
const DAY_INK = [40, 23, 12];

/** Hora y "mirada al cielo" interpoladas según la sección bajo el centro del viewport. */
function readSections() {
  const mid = window.innerHeight * 0.5;
  const secs = document.querySelectorAll<HTMLElement>("[data-h0]");
  let hour = 5.8, look = 0;
  for (const s of secs) {
    const r = s.getBoundingClientRect();
    const h0 = Number(s.dataset.h0), h1 = Number(s.dataset.h1);
    const l0 = Number(s.dataset.l0 ?? 0), l1 = Number(s.dataset.l1 ?? s.dataset.l0 ?? 0);
    if (r.top <= mid && r.bottom > mid) {
      const t = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      return { hour: h0 + (h1 - h0) * t, look: l0 + (l1 - l0) * t };
    }
    if (r.bottom <= mid) {
      hour = h1;
      look = l1;
    }
  }
  return { hour, look };
}

export default function Engine() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = reduced ? null : new Lenis({ lerp: 0.08, wheelMultiplier: 0.85, touchMultiplier: 1.3 });
    (window as unknown as { __lenis?: Lenis | null }).__lenis = lenis;

    const onMove = (e: PointerEvent) => {
      sky.px = e.clientX;
      sky.py = e.clientY;
      sky.mx = (e.clientX / window.innerWidth) * 2 - 1;
      sky.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // amanecer de introducción: el sol sale en ~3 s sin bloquear nada
    const t0 = performance.now();
    const INTRO = reduced ? 1 : 3200;
    let raf = 0, hour = 4.7, look = 0, travel = 0, lastInk = "", prev = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      // suavizado por tiempo real: igual a 30, 60 o 144 Hz
      const dt = Math.min(0.5, (now - prev) / 1000);
      prev = now;
      const kH = 1 - Math.exp(-dt * 5), kL = 1 - Math.exp(-dt * 3.5);
      lenis?.raf(now);
      const target = readSections();
      const k = Math.min(1, (now - t0) / INTRO);
      const intro = -1.1 * Math.pow(1 - k, 3);
      hour += (target.hour + intro - hour) * kH;
      look += (target.look - look) * kL;
      travel += (window.scrollY * 0.012 - travel) * kH;
      sky.hour = hour;
      sky.look = look;
      sky.travel = travel;

      // tinta legible: oscura sobre el día, clara sobre la noche
      const d = dayness(hour);
      const m = Math.min(1, Math.max(0, (d - 0.25) / 0.35));
      const ink = mixHex(NIGHT_INK, DAY_INK, m).join(",");
      if (ink !== lastInk) {
        lastInk = ink;
        root.style.setProperty("--ink-rgb", ink);
        root.style.setProperty("--paper-rgb", mixHex(DAY_INK, NIGHT_INK, m).join(","));
        root.style.setProperty("--glass", m > 0.5 ? "rgba(255,244,228,.38)" : "rgba(12,12,30,.38)");
        root.dataset.sky = m > 0.5 ? "day" : "night";
      }
      root.style.setProperty("--day", d.toFixed(3));
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      lenis?.destroy();
    };
  }, []);
  return null;
}

/** Scroll suave hacia un ancla (usa Lenis si está activo). */
export function goTo(target: string) {
  const lenis = (window as unknown as { __lenis?: Lenis | null }).__lenis;
  if (lenis) lenis.scrollTo(target, { duration: 2.4, offset: 0 });
  else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}
