"use client";

import { useEffect, useRef } from "react";
import SandTitle from "../SandTitle";
import { sky } from "@/lib/sky";

function Palm({ x, h, lean }: { x: number; h: number; lean: number }) {
  const top = { x: x + lean, y: 100 - h };
  const fronds = [-150, -115, -70, -30, 10, 45];
  return (
    <g>
      <path d={`M${x} 100 Q${x + lean * 0.3} ${100 - h * 0.5} ${top.x} ${top.y}`} stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {fronds.map((a) => {
        const r = (a * Math.PI) / 180;
        const ex = top.x + Math.cos(r) * 22, ey = top.y + Math.sin(r) * 9 + 6;
        return (
          <path
            key={a}
            d={`M${top.x} ${top.y} Q${top.x + Math.cos(r) * 12} ${top.y - 6} ${ex} ${ey}`}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

function Oasis() {
  return (
    <svg viewBox="0 0 240 150" className="w-full" aria-label="Oasis en el horizonte">
      <defs>
        <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8fc6e6" />
          <stop offset="1" stopColor="#cfe6f0" />
        </linearGradient>
      </defs>
      <g className="text-[#3a2a1c]">
        <Palm x={92} h={52} lean={-8} />
        <Palm x={112} h={64} lean={6} />
        <Palm x={138} h={44} lean={12} />
        <path d="M60 100 Q120 92 180 100 Z" fill="currentColor" opacity="0.65" />
      </g>
      <ellipse className="shimmer" cx="120" cy="108" rx="78" ry="7" fill="url(#water)" style={{ transformOrigin: "120px 108px" }} />
      {/* reflejo invertido */}
      <g className="text-[#3a2a1c]" transform="translate(0 216) scale(1 -1)" opacity="0.22">
        <Palm x={92} h={52} lean={-8} />
        <Palm x={112} h={64} lean={6} />
        <Palm x={138} h={44} lean={12} />
      </g>
    </svg>
  );
}

export default function Mirage() {
  const section = useRef<HTMLElement>(null);
  const oasis = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    let raf = 0, flee = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const s = section.current, o = oasis.current;
      if (!s || !o) return;
      const sr = s.getBoundingClientRect();
      if (sr.bottom < 0 || sr.top > window.innerHeight) return;
      const p = Math.min(1, Math.max(0, -sr.top / (sr.height - window.innerHeight)));
      let target: number;
      if (fine) {
        // el oasis huye del cursor: cuanto más cerca, más lejos se va
        const r = o.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const d = Math.hypot(sky.px - cx, (sky.py - cy) * 1.6);
        target = Math.min(1, Math.max(0, 1 - (d - 60) / 420));
      } else {
        target = Math.min(1, p * 1.4);
      }
      flee += (target - flee) * 0.08;
      o.style.transform = `translate(-50%, ${-flee * 26}px) scale(${1 - flee * 0.55})`;
      o.style.opacity = String(1 - flee * 0.92);
      o.style.filter = `blur(${flee * 3}px)`;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={section} id="espejismo" data-h0="11" data-h1="14.6" className="relative h-[230vh]">
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="heat">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.12" numOctaves="2" seed="4">
            <animate attributeName="seed" values="1;2;3;4;5;6;7;8" dur="0.8s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="6" />
        </filter>
      </svg>
      <div className="sticky top-0 h-screen overflow-hidden px-5 pt-28 md:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="ink-soft font-mono text-[11px] uppercase tracking-[0.35em]">II · Mediodía</p>
            <SandTitle text="Espejismo" className="display mt-4 text-[clamp(64px,11vw,180px)] leading-[0.86]" />
          </div>
          <div className="glass self-start rounded-3xl p-6 md:mt-10 md:p-8">
            <p className="serif-it text-2xl leading-snug md:text-3xl">El agua del horizonte es el cielo.</p>
            <p className="ink-soft mt-3 text-[15px] leading-relaxed">
              La arena calienta una capa de aire pegada al suelo. La luz del cielo, al atravesarla, se curva hacia arriba y
              llega a tus ojos desde abajo: el desierto refleja el cielo como si fuera un lago.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-current/20 pt-5">
              <div>
                <p className="display text-5xl leading-none">+70°</p>
                <p className="ink-soft mt-1 text-xs">la superficie de la arena a pleno sol</p>
              </div>
              <div>
                <p className="display text-5xl leading-none">45°</p>
                <p className="ink-soft mt-1 text-xs">el aire, a la sombra que no hay</p>
              </div>
            </div>
          </div>
        </div>

        <div ref={oasis} className="heat absolute left-1/2 top-[60%] w-[min(560px,80vw)] will-change-transform" style={{ transform: "translate(-50%,0)" }}>
          <Oasis />
          <p className="ink-faint mt-2 text-center font-mono text-[11px] uppercase tracking-[0.3em]">
            <span className="hidden md:inline">Acércate…</span>
            <span className="md:hidden">Sigue bajando…</span>
          </p>
        </div>
      </div>
    </section>
  );
}
