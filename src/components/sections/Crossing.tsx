"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SandTitle from "../SandTitle";

const STOPS = [
  { t: 0.12, day: "Día 1", title: "Tin Amal, el último pozo", text: "Cargamos agua para cinco días. Un dromedario sediento puede beberse cien litros en diez minutos." },
  { t: 0.32, day: "Día 2", title: "Las dunas que cantan", text: "Cuando la arena se desliza por la cara de una gran duna, la duna entera zumba como un órgano. Se oye a kilómetros." },
  { t: 0.52, day: "Día 3", title: "La hamada", text: "Una llanura de piedra negra sembrada de conchas fósiles. Hace millones de años, este desierto era fondo de mar." },
  { t: 0.72, day: "Día 4", title: "La noche sin luna", text: "Acampamos lejos de cualquier luz, en la fecha exacta de luna nueva. El cielo hace el resto." },
  { t: 0.9, day: "Día 5", title: "La gran duna", text: "Subimos de madrugada, a oscuras, para ver salir el sol desde la cresta." },
];

type Size = { w: number; h: number };
const pathX = (t: number, w: number) => w / 2 + w * (w < 700 ? 0.26 : 0.2) * Math.sin(t * Math.PI * 2.4 + 0.5);
const pathY = (t: number, h: number) => h * (0.06 + t * 0.9);

export default function Crossing() {
  const section = useRef<HTMLElement>(null);
  const [size, setSize] = useState<Size | null>(null);
  const prints = useRef<(SVGGElement | null)[]>([]);
  const cards = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(section.current!);
    return () => ro.disconnect();
  }, []);

  // huellas a intervalos regulares de longitud de arco, alternando pie izquierdo y derecho
  const steps = useMemo(() => {
    if (!size) return [];
    const out: { x: number; y: number; a: number; t: number; left: boolean }[] = [];
    let acc = 0, px = pathX(0, size.w), py = pathY(0, size.h), left = true;
    const STRIDE = 46;
    for (let i = 1; i <= 2000; i++) {
      const t = i / 2000;
      const x = pathX(t, size.w), y = pathY(t, size.h);
      acc += Math.hypot(x - px, y - py);
      if (acc >= STRIDE) {
        acc = 0;
        const a = Math.atan2(y - py, x - px);
        const off = left ? -11 : 11;
        out.push({ x: x + Math.cos(a + Math.PI / 2) * off, y: y + Math.sin(a + Math.PI / 2) * off, a: (a * 180) / Math.PI + 90, t, left });
        left = !left;
      }
      px = x;
      py = y;
    }
    return out;
  }, [size]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const s = section.current;
      if (!s || !size) return;
      const r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      // el caminante va a la altura del 62 % de la pantalla
      const walker = window.innerHeight * 0.62 - r.top;
      steps.forEach((st, i) => {
        const g = prints.current[i];
        if (!g) return;
        const age = (walker - st.y) / window.innerHeight;
        // aparece al pisar; el viento la borra cuando queda atrás
        const o = age < 0 ? 0 : age < 0.03 ? age / 0.03 : 1 - Math.min(1, Math.max(0, (age - 0.35) / 0.45));
        g.style.opacity = o.toFixed(3);
      });
      STOPS.forEach((st, i) => {
        const c = cards.current[i];
        if (c) c.classList.toggle("is-in", walker > pathY(st.t, size.h) - 40);
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [steps, size]);

  return (
    <section ref={section} id="travesia" data-h0="14.6" data-h1="18.4" className="relative h-[340vh]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-5 pt-[16vh] md:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="ink-soft font-mono text-[11px] uppercase tracking-[0.35em]">III · Tarde</p>
          <SandTitle text={"La\ntravesía"} className="display mt-4 text-[clamp(64px,11vw,180px)] leading-[0.86]" />
        </div>
      </div>

      {size && (
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden>
          {steps.map((s, i) => (
            <g
              key={i}
              ref={(el) => {
                prints.current[i] = el;
              }}
              transform={`translate(${s.x} ${s.y}) rotate(${s.a})`}
              style={{ opacity: 0 }}
              fill="rgb(var(--ink-rgb))"
              fillOpacity="0.55"
            >
              {/* suela y talón de una bota */}
              <ellipse cx="0" cy="-5" rx="5.2" ry="8" transform={`scale(${s.left ? -1 : 1} 1)`} />
              <ellipse cx="0" cy="8" rx="4" ry="4.4" />
            </g>
          ))}
        </svg>
      )}

      {size &&
        STOPS.map((st, i) => {
          const x = pathX(st.t, size.w);
          const right = x < size.w / 2;
          const small = size.w < 700;
          return (
            <article
              key={st.day}
              ref={(el) => {
                cards.current[i] = el;
              }}
              className="absolute z-10 w-[min(360px,calc(100vw-2.5rem))]"
              style={
                small
                  ? { top: pathY(st.t, size.h) + 40, left: 20 }
                  : { top: pathY(st.t, size.h) - 60, left: right ? x + 70 : undefined, right: right ? undefined : size.w - x + 70 }
              }
            >
              <div className="rise glass rounded-3xl p-6">
                <p className="ink-soft font-mono text-[11px] uppercase tracking-[0.3em]">{st.day}</p>
                <h3 className="serif-it mt-2 text-3xl leading-tight">{st.title}</h3>
                <p className="ink-soft mt-2 text-[15px] leading-relaxed">{st.text}</p>
              </div>
            </article>
          );
        })}
    </section>
  );
}
