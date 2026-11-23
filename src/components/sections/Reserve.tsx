import { Suspense } from "react";
import { connection } from "next/server";
import { isoDay, nextNewMoons } from "@/lib/sky";
import ReserveForm from "./ReserveForm";

async function Form() {
  // las fechas se calculan en cada petición: siempre son las próximas lunas nuevas reales
  await connection();
  const moons = nextNewMoons(6).map(isoDay);
  return <ReserveForm moons={moons} />;
}

export default function Reserve() {
  return (
    <section id="reserva" data-h0="26.4" data-h1="28.7" data-l0="0.95" data-l1="0.35" className="relative px-5 py-[20vh] md:px-12">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="ink-soft font-mono text-[11px] uppercase tracking-[0.35em]">VI · Madrugada</p>
          <h2 className="display mt-4 text-[clamp(56px,7vw,110px)] leading-[0.88]">
            Una noche
            <br />
            <span className="serif-it font-normal tracking-normal">sin luna.</span>
          </h2>
          <p className="ink-soft mt-6 max-w-md text-[17px] leading-relaxed">
            Sólo salimos en luna nueva, cuando el cielo está más oscuro y la Vía Láctea proyecta sombra sobre la arena.
            Estas son las próximas fechas, calculadas a partir del mes lunar: 29 días, 12 horas y 44 minutos.
          </p>
          <ul className="ink-soft mt-8 space-y-2 text-sm">
            <li>· 5 días, 4 noches en jaima</li>
            <li>· Grupos de 12 viajeros como máximo</li>
            <li>· Guía tuareg y astrónomo en el grupo</li>
          </ul>
        </div>
        <Suspense fallback={<p className="ink-faint font-mono text-xs">Calculando lunas nuevas…</p>}>
          <Form />
        </Suspense>
      </div>
    </section>
  );
}
