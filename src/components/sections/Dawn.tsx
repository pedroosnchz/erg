"use client";

import SandTitle from "../SandTitle";
import { goTo } from "../Engine";

export default function Dawn() {
  return (
    <section data-h0="28.7" data-h1="30.1" data-l0="0.35" data-l1="0" className="relative flex min-h-[150vh] flex-col justify-end px-5 pb-16 md:px-12">
      <div className="mx-auto w-full max-w-7xl text-center">
        <p className="ink-soft font-mono text-[11px] uppercase tracking-[0.35em]">VII · Alba</p>
        <SandTitle text={"Amanece.\nOtra vez."} className="display mt-4 text-center text-[clamp(64px,11vw,190px)] leading-[0.86]" />
        <button onClick={() => goTo("#reserva")} className="btn-ink mt-12 rounded-full px-8 py-4 font-semibold">
          Volver a elegir mi noche
        </button>
        <div className="ink-faint mt-[18vh] flex flex-wrap items-center justify-between gap-4 border-t border-current/20 pt-6 text-left font-mono text-[11px] uppercase tracking-[0.2em]">
          <span>ERG · Travesías por el mar de arena</span>
          <span>Ficción con datos reales: el desierto, el cielo y la física sí existen</span>
        </div>
      </div>
    </section>
  );
}
