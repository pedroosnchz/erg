"use client";

import { CSSProperties } from "react";
import SandTitle from "../SandTitle";
import { useReveal } from "@/lib/hooks";

const FACTS = [
  { n: "¼", t: "Sólo una cuarta parte del Sahara es arena.", d: "El resto es roca desnuda y grava. Los mares de dunas —los ergs— son islas dentro del desierto." },
  { n: "300 m", t: "Hay dunas más altas que la torre Eiffel.", d: "En los grandes ergs del planeta, algunas montañas de arena superan los 300 metros." },
  { n: "→", t: "Las dunas caminan.", d: "El viento empuja la arena por la ladera suave y la deja caer por la cara abrupta: algunas avanzan decenas de metros al año." },
  { n: "6 000", t: "Hace unos 6 000 años, esto era verde.", d: "Lagos, sabana, jirafas e hipopótamos. Las pinturas rupestres del Sahara todavía lo recuerdan." },
];

export default function Erg() {
  const ref = useReveal<HTMLDivElement>(0.15);
  return (
    <section id="erg" data-h0="7.4" data-h1="11" className="relative px-5 py-[22vh] md:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="ink-soft font-mono text-[11px] uppercase tracking-[0.35em]">I · Mañana</p>
        <SandTitle text={"El mar\nde arena"} className="display mt-4 text-[clamp(72px,13vw,210px)] leading-[0.86]" />

        <div ref={ref} className="mt-[14vh] grid gap-x-16 gap-y-20 md:grid-cols-2">
          {FACTS.map((f, i) => (
            <article key={f.n} className={`rise max-w-md ${i % 2 ? "md:mt-40 md:justify-self-end" : ""}`} style={{ "--d": `${i * 0.12}s` } as CSSProperties}>
              <p className="display text-[clamp(56px,7vw,110px)] leading-none">{f.n}</p>
              <h3 className="serif-it mt-4 text-3xl leading-tight">{f.t}</h3>
              <p className="ink-soft mt-3 text-[15px] leading-relaxed">{f.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
