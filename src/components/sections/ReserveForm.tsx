"use client";

import { useActionState, useState } from "react";
import { reserve, type ReserveState } from "@/app/actions";
import { milkyWayNote } from "@/lib/sky";
import { goTo } from "../Engine";

const initial: ReserveState = { status: "idle" };
const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("es-ES", { timeZone: "UTC", ...opts });
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Luna nueva: un disco oscuro con un filo de luz cenicienta. */
function NewMoon({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} aria-hidden>
      <circle cx="22" cy="22" r="18" fill="rgba(0,0,0,.35)" stroke="rgb(var(--ink-rgb))" strokeOpacity="0.5" />
      <path d="M22 4 A18 18 0 0 1 22 40" fill="none" stroke="rgb(var(--ink-rgb))" strokeOpacity="0.25" strokeWidth="1.5" />
    </svg>
  );
}

export default function ReserveForm({ moons }: { moons: string[] }) {
  const [state, action, pending] = useActionState(reserve, initial);
  const [night, setNight] = useState(moons[0]);
  const [guests, setGuests] = useState(2);

  if (state.status === "ok") {
    return (
      <div className="glass rounded-[2rem] p-8 md:p-10">
        <p className="ink-faint font-mono text-[11px] uppercase tracking-[0.3em]">{state.again ? "Ya tenías plaza" : "Plaza confirmada"}</p>
        <p className="display mt-3 text-[clamp(56px,8vw,110px)] leading-none">Jaima {String(state.tent).padStart(2, "0")}</p>
        <p className="serif-it mt-4 text-3xl">
          {state.name}, {fmt(state.night, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.
        </p>
        <div className="mt-6 grid gap-4 border-t border-current/20 pt-6 sm:grid-cols-3">
          <div>
            <p className="ink-faint text-xs">Luna</p>
            <p className="font-semibold">Nueva · 0 % iluminada</p>
          </div>
          <div>
            <p className="ink-faint text-xs">Cielo</p>
            <p className="font-semibold">{milkyWayNote(new Date(`${state.night}T12:00:00Z`))}</p>
          </div>
          <div>
            <p className="ink-faint text-xs">Viajeros</p>
            <p className="font-semibold">{state.guests}</p>
          </div>
        </div>
        <button onClick={() => goTo("#cielo")} className="ink-soft mt-8 font-mono text-[11px] uppercase tracking-[0.3em] underline decoration-dotted underline-offset-4 hover:opacity-100">
          ↑ Tu estrella ya brilla en el cielo de esta página
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-10">
      <fieldset>
        <legend className="ink-faint mb-4 font-mono text-[11px] uppercase tracking-[0.3em]">1 · Elige tu noche sin luna</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {moons.map((m) => {
            const on = night === m;
            return (
              <label
                key={m}
                className={`glass group relative cursor-pointer rounded-2xl border p-4 transition-all duration-500 ${
                  on ? "-translate-y-1 border-current" : "border-transparent hover:border-current/30"
                }`}
              >
                <input type="radio" name="night" value={m} checked={on} onChange={() => setNight(m)} className="sr-only" />
                <NewMoon size={34} />
                <p className="mt-3 text-[13px] capitalize opacity-70">{fmt(m, { weekday: "long" })}</p>
                <p className="display text-3xl leading-none">{fmt(m, { day: "numeric" })}</p>
                <p className="text-sm">{cap(fmt(m, { month: "long", year: "numeric" }))}</p>
                <p className="ink-faint mt-2 text-[11px] leading-snug">{milkyWayNote(new Date(`${m}T12:00:00Z`))}</p>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-end">
        <div>
          <p className="ink-faint mb-3 font-mono text-[11px] uppercase tracking-[0.3em]">2 · Viajeros</p>
          <div className="glass flex items-center gap-2 rounded-full p-1.5">
            <button type="button" aria-label="Menos viajeros" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="h-10 w-10 rounded-full text-xl transition-colors hover:bg-current/10">
              −
            </button>
            <output className="display w-10 text-center text-3xl" aria-live="polite">
              {guests}
            </output>
            <button type="button" aria-label="Más viajeros" onClick={() => setGuests((g) => Math.min(6, g + 1))} className="h-10 w-10 rounded-full text-xl transition-colors hover:bg-current/10">
              +
            </button>
            <input type="hidden" name="guests" value={guests} />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="ink-faint font-mono text-[11px] uppercase tracking-[0.3em]">3 · Nombre</span>
            <input name="name" required minLength={2} maxLength={30} autoComplete="given-name" placeholder="Nadia" className="mt-2 w-full border-b border-current/30 bg-transparent pb-2 text-2xl outline-none placeholder:opacity-30 focus:border-current" />
          </label>
          <label className="block">
            <span className="ink-faint font-mono text-[11px] uppercase tracking-[0.3em]">Email</span>
            <input name="email" type="email" required autoComplete="email" placeholder="tu@correo.com" className="mt-2 w-full border-b border-current/30 bg-transparent pb-2 text-2xl outline-none placeholder:opacity-30 focus:border-current" />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" disabled={pending} className="btn-ink rounded-full px-8 py-4 font-semibold disabled:opacity-60">
          {pending ? "Preparando la jaima…" : `Reservar la noche del ${fmt(night, { day: "numeric", month: "long" })}`}
        </button>
        <p aria-live="polite" className="text-sm text-[#ff9b6a]">
          {state.status === "error" ? state.message : ""}
        </p>
      </div>
    </form>
  );
}
