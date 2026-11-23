"use client";

import { useEffect, useRef, useState } from "react";

type Star = { id: string; name: string; x: number; y: number; mag: number; ar: string; tr: string; es: string; note?: string; group: "orion" | "taurus" };

const STARS: Star[] = [
  { id: "bet", name: "Betelgeuse", x: 380, y: 170, mag: 1.6, ar: "يد الجوزاء", tr: "yad al-jawzāʾ", es: "la mano de al-Jawzāʾ", note: "Una mala lectura medieval convirtió «yad» en «bet». Es una supergigante roja: si estuviera en el lugar del Sol, se tragaría la órbita de Marte.", group: "orion" },
  { id: "bel", name: "Bellatrix", x: 535, y: 190, mag: 1.1, ar: "المرزم", tr: "al-murzim", es: "la que ruge", note: "Su nombre europeo es latino («la guerrera»), pero los astrónomos árabes la llamaban así.", group: "orion" },
  { id: "mei", name: "Meissa", x: 455, y: 112, mag: 0.7, ar: "الميسان", tr: "al-maysān", es: "la que resplandece", group: "orion" },
  { id: "alk", name: "Alnitak", x: 425, y: 305, mag: 1.0, ar: "النطاق", tr: "an-niṭāq", es: "el cinturón", group: "orion" },
  { id: "alm", name: "Alnilam", x: 462, y: 294, mag: 1.1, ar: "النظام", tr: "an-niẓām", es: "el collar de perlas", group: "orion" },
  { id: "min", name: "Mintaka", x: 499, y: 282, mag: 1.0, ar: "المنطقة", tr: "al-minṭaqa", es: "la faja", group: "orion" },
  { id: "sai", name: "Saiph", x: 405, y: 440, mag: 1.0, ar: "سيف الجبار", tr: "sayf al-jabbār", es: "la espada del gigante", group: "orion" },
  { id: "rig", name: "Rigel", x: 560, y: 428, mag: 1.6, ar: "رجل الجوزاء", tr: "rijl al-jawzāʾ", es: "el pie de al-Jawzāʾ", note: "Una supergigante azul: brilla unas cien mil veces más que el Sol.", group: "orion" },
  { id: "ald", name: "Aldebarán", x: 735, y: 150, mag: 1.5, ar: "الدبران", tr: "al-dabarān", es: "el que sigue", note: "Sigue a las Pléyades por el cielo durante toda la noche, como un pastor tras su rebaño.", group: "taurus" },
  { id: "ple", name: "Pléyades", x: 860, y: 70, mag: 0.9, ar: "الثريا", tr: "ath-thurayyā", es: "la pequeña abundancia", note: "Un cúmulo de estrellas jóvenes. Para los nómadas, su salida al alba anunciaba las estaciones.", group: "taurus" },
];

const LINES: [string, string, "orion" | "taurus"][] = [
  ["mei", "bet", "orion"], ["mei", "bel", "orion"], ["bet", "alk", "orion"], ["bel", "min", "orion"],
  ["alk", "alm", "orion"], ["alm", "min", "orion"], ["alk", "sai", "orion"], ["min", "rig", "orion"],
  ["ald", "ple", "taurus"],
];

const MORE = [
  ["Vega", "النسر الواقع", "an-nasr al-wāqiʿ", "el águila que cae en picado"],
  ["Altair", "النسر الطائر", "an-nasr aṭ-ṭāʾir", "el águila que vuela"],
  ["Deneb", "ذنب الدجاجة", "dhanab ad-dajāja", "la cola de la gallina"],
  ["Fomalhaut", "فم الحوت", "fam al-ḥūt", "la boca del pez"],
  ["Algol", "رأس الغول", "raʾs al-ghūl", "la cabeza del demonio"],
];

export type Guest = { name: string; night: string };

const hash = (s: string) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967295;
};

/** Posición de la estrella de cada viajero, lejos de las constelaciones dibujadas. */
function guestPos(g: Guest, i: number) {
  const a = hash(`${g.name}${g.night}${i}`), b = hash(`${i}${g.name}`);
  const zones = [
    [40, 40, 260, 520],
    [620, 260, 360, 300],
    [260, 480, 320, 100],
  ];
  const z = zones[i % zones.length];
  return { x: z[0] + a * z[2], y: z[1] + b * z[3] };
}

export default function StarChart({ guests }: { guests: Guest[] }) {
  const [active, setActive] = useState<string>("bet");
  const [drawn, setDrawn] = useState(false);
  const [guest, setGuest] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const star = STARS.find((s) => s.id === active)!;

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setDrawn(true), { threshold: 0.4 });
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);

  const pos = Object.fromEntries(STARS.map((s) => [s.id, s]));

  return (
    <div ref={root} className="grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
      <svg viewBox="0 0 1000 600" className="w-full" role="group" aria-label="Carta estelar de Orión y Tauro">
        {LINES.map(([a, b, grp], i) => (
          <line
            key={i}
            x1={pos[a].x}
            y1={pos[a].y}
            x2={pos[b].x}
            y2={pos[b].y}
            pathLength={1}
            className={`draw-line ${drawn ? "on" : ""}`}
            style={{ transitionDelay: `${i * 0.12}s` }}
            stroke="rgb(var(--ink-rgb))"
            strokeOpacity={star.group === grp ? 0.55 : 0.18}
            strokeWidth="1.2"
          />
        ))}
        {/* estrellas de los viajeros */}
        {guests.map((g, i) => {
          const p = guestPos(g, i);
          return (
            <g key={`${g.name}-${i}`} onMouseEnter={() => setGuest(i)} onMouseLeave={() => setGuest(null)} className="cursor-default">
              <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
              <circle
                cx={p.x}
                cy={p.y}
                r="2.2"
                fill="#ffc56b"
                className="twinkle"
                style={{ "--tw": `${2 + (i % 5) * 0.6}s`, "--td": `${(i % 7) * 0.3}s` } as React.CSSProperties}
              />
              {guest === i && (
                <text x={p.x + 8} y={p.y - 8} fontSize="13" fill="#ffd89a" fontFamily="var(--font-dmmono)">
                  {g.name} · {new Date(g.night).toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" })}
                </text>
              )}
            </g>
          );
        })}
        {STARS.map((s) => {
          const on = s.id === active;
          return (
            <g
              key={s.id}
              role="button"
              tabIndex={0}
              aria-label={`${s.name}: ${s.tr}, ${s.es}`}
              aria-pressed={on}
              className="star-btn cursor-pointer outline-none"
              onMouseEnter={() => setActive(s.id)}
              onFocus={() => setActive(s.id)}
              onClick={() => setActive(s.id)}
            >
              <circle cx={s.x} cy={s.y} r="26" fill="transparent" />
              <circle cx={s.x} cy={s.y} r={on ? 22 : 12 * s.mag} fill="rgb(var(--ink-rgb))" opacity={on ? 0.12 : 0.06} />
              {s.id === "ple" ? (
                [[0, 0], [-10, 6], [8, 8], [-4, -9], [12, -4], [3, 12]].map(([dx, dy], k) => (
                  <circle key={k} cx={s.x + dx} cy={s.y + dy} r="1.8" fill="rgb(var(--ink-rgb))" />
                ))
              ) : (
                <circle className="star-core" cx={s.x} cy={s.y} r={2.2 + s.mag * 1.6} fill="rgb(var(--ink-rgb))" style={{ transition: "r .3s" }} />
              )}
              <text x={s.x + 14} y={s.y + 4} fontSize="13" fill="rgb(var(--ink-rgb))" opacity={on ? 1 : 0.55} fontFamily="var(--font-dmmono)">
                {s.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="glass rounded-3xl p-7" aria-live="polite">
        <p className="ink-faint font-mono text-[11px] uppercase tracking-[0.3em]">{star.group === "orion" ? "Orión · al-Jabbār, el gigante" : "Tauro · ath-Thawr, el toro"}</p>
        <p className="font-arabic mt-4 text-right text-5xl leading-[1.4]" dir="rtl" lang="ar">
          {star.ar}
        </p>
        <p className="mt-2 font-mono text-sm">{star.tr}</p>
        <h3 className="serif-it mt-3 text-3xl leading-tight">«{star.es}»</h3>
        <p className="ink-soft mt-1 text-sm">hoy la llamamos {star.name}</p>
        {star.note && <p className="ink-soft mt-4 border-t border-current/20 pt-4 text-[15px] leading-relaxed">{star.note}</p>}
      </div>

      <div className="lg:col-span-2">
        <p className="ink-faint mb-3 font-mono text-[11px] uppercase tracking-[0.3em]">En otras noches del año</p>
        <ul className="flex flex-wrap gap-2">
          {MORE.map(([n, ar, tr, es]) => (
            <li key={n} className="glass rounded-full px-4 py-2 text-sm">
              <span className="font-semibold">{n}</span> · <span className="font-arabic" lang="ar">{ar}</span> · <span className="ink-soft">{tr}, «{es}»</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
