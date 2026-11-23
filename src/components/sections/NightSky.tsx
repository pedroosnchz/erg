import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import SandTitle from "../SandTitle";
import StarChart from "./StarChart";

async function Chart() {
  await connection();
  const guests = await prisma.traveler.findMany({ orderBy: { createdAt: "desc" }, take: 60, select: { name: true, night: true } });
  return (
    <>
      <StarChart guests={guests} />
      <p className="ink-faint mt-6 text-center font-mono text-[11px] uppercase tracking-[0.3em]">
        {guests.length === 0
          ? "Todavía no hay viajeros en este cielo. La primera estrella dorada puede ser la tuya."
          : `${guests.length} ${guests.length === 1 ? "viajero ya tiene" : "viajeros ya tienen"} su estrella dorada en este cielo`}
      </p>
    </>
  );
}

export default function NightSky() {
  return (
    <section id="cielo" data-h0="20.7" data-h1="26.4" data-l0="0.6" data-l1="0.95" className="relative px-5 py-[22vh] md:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="ink-soft font-mono text-[11px] uppercase tracking-[0.35em]">V · Noche</p>
        <SandTitle text="Sin luna" className="display mt-4 text-[clamp(72px,13vw,210px)] leading-[0.86]" />
        <p className="ink-soft mt-8 max-w-2xl text-[17px] leading-relaxed">
          Muchas de las estrellas más brillantes tienen nombre árabe. Los astrónomos del mundo islámico —como al-Sufi, en el
          siglo X— las catalogaron, y sus nombres llegaron a Europa a través de al-Ándalus. Pasa el cursor por el cielo de
          invierno.
        </p>
        <div className="mt-14">
          <Suspense fallback={<p className="ink-faint font-mono text-xs">Abriendo el cielo…</p>}>
            <Chart />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
