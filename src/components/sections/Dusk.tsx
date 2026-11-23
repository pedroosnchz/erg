"use client";

import { CSSProperties } from "react";
import SandTitle from "../SandTitle";
import { useReveal } from "@/lib/hooks";

export default function Dusk() {
  const ref = useReveal<HTMLDivElement>(0.4);
  return (
    <section id="ocaso" data-h0="18.4" data-h1="20.7" data-l0="0" data-l1="0.55" className="relative flex min-h-[190vh] items-center px-5 md:px-12">
      <div className="mx-auto w-full max-w-7xl text-center">
        <p className="ink-soft font-mono text-[11px] uppercase tracking-[0.35em]">IV · Ocaso</p>
        <SandTitle text={"Se va en\nminutos"} className="display mt-4 text-center text-[clamp(64px,12vw,200px)] leading-[0.86]" />
        <div ref={ref} className="mx-auto mt-12 max-w-xl">
          <p className="rise serif-it text-3xl leading-snug">Cuando el sol toca la cresta, el desierto empieza a enfriarse.</p>
          <p className="rise ink-soft mt-4 text-[15px] leading-relaxed" style={{ "--d": ".2s" } as CSSProperties}>
            Sin nubes ni humedad que guarden el calor, el aire puede perder más de veinte grados en unas pocas horas.
            Saca el abrigo. Sí, en el Sahara.
          </p>
        </div>
      </div>
    </section>
  );
}
