"use client";

import SandTitle from "../SandTitle";
import { goTo } from "../Engine";

export default function Hero() {
  return (
    <section id="top" data-h0="5.8" data-h1="7.4" className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pb-16 pt-28 text-center">
      <p className="ink-soft mb-6 font-mono text-[11px] uppercase tracking-[0.35em]">
        Sahara · Gran Erg · 5 días · 4 noches
      </p>
      <SandTitle text="ERG" as="h1" mode="intro" className="display text-[56vw] leading-[0.8] sm:text-[clamp(140px,34vw,520px)]" />
      <p className="serif-it mt-6 max-w-2xl text-[clamp(26px,3.4vw,52px)] leading-[1.05]">
        Cinco días cruzando el mar de arena.
        <br />
        <span className="ink-soft">Y una noche sin luna.</span>
      </p>
      <div className="mt-12 flex flex-col items-center gap-8 sm:flex-row">
        <button
          onClick={() => goTo("#reserva")}
          className="btn-ink rounded-full px-7 py-4 text-sm font-semibold"
        >
          Reservar una noche sin luna
        </button>
        <button onClick={() => goTo("#erg")} className="group flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
          <span className="relative block h-10 w-px overflow-hidden bg-current/20">
            <span className="hint-line absolute inset-0 bg-current" />
          </span>
          Desliza: el día avanza contigo
        </button>
      </div>
    </section>
  );
}
