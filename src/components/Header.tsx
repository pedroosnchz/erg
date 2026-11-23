"use client";

import { useEffect, useRef } from "react";
import { clock, momentAt, sky, sunDir, tempAt } from "@/lib/sky";
import { goTo } from "./Engine";

/** Arco solar: el sol recorre el arco de 06:00 a 18:00; de noche cae bajo el horizonte. */
function SunArc() {
  const sun = useRef<SVGCircleElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const moment = useRef<HTMLSpanElement>(null);
  const temp = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0, last = "";
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const h = sky.hour;
      const a = ((((h % 24) + 24) % 24) - 6) / 12 * Math.PI;
      const x = 60 - Math.cos(a) * 46;
      const y = 40 - Math.sin(a) * 30;
      sun.current?.setAttribute("cx", x.toFixed(1));
      sun.current?.setAttribute("cy", y.toFixed(1));
      sun.current?.setAttribute("opacity", sunDir(h)[1] > -0.05 ? "1" : "0.25");
      const label = `${clock(h)}|${momentAt(h)}|${Math.round(tempAt(h))}`;
      if (label !== last) {
        last = label;
        if (time.current) time.current.textContent = clock(h);
        if (moment.current) moment.current.textContent = momentAt(h);
        if (temp.current) temp.current.textContent = `${Math.round(tempAt(h))} °C`;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="flex items-center gap-2 sm:gap-3" aria-live="off">
      <svg viewBox="0 0 120 48" className="h-7 w-14 sm:h-8 sm:w-20" aria-hidden>
        <path d="M14 40 A46 30 0 0 1 106 40" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="2 3" />
        <line x1="4" y1="40" x2="116" y2="40" stroke="currentColor" strokeOpacity="0.5" />
        <circle ref={sun} cx="14" cy="40" r="4.5" fill="currentColor" />
      </svg>
      <p className="font-mono text-[11px] leading-tight tracking-wider">
        <span ref={time} className="block text-[13px] tabular-nums">05:48</span>
        <span className="hidden opacity-70 sm:inline">
          <span ref={moment}>Alba</span> · <span ref={temp}>8 °C</span>
        </span>
      </p>
    </div>
  );
}

export default function Header() {
  return (
    <header className="ink fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 px-4 py-4 sm:px-5 md:px-10">
      <button onClick={() => goTo("#top")} className="font-display text-xl tracking-[0.3em] sm:text-2xl" aria-label="ERG, volver arriba">
        ERG
      </button>
      <SunArc />
      <button
        onClick={() => goTo("#reserva")}
        className="glass rounded-full border border-current/25 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-transform hover:scale-[1.04] sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.25em]"
      >
        Reservar
      </button>
    </header>
  );
}
