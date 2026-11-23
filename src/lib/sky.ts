/** Estado compartido (mutable, leído en cada frame por el shader y la interfaz). */
export const sky = {
  /** hora continua: 5.8 = 05:48; pasa de 24 durante la noche (27 = 03:00) */
  hour: 5.8,
  /** 0..1 cuánto mira la cámara hacia arriba (noche) */
  look: 0,
  /** ratón normalizado -1..1 y en píxeles */
  mx: 0,
  my: 0,
  px: -9999,
  py: -9999,
  /** velocidad de avance de la cámara según el scroll */
  travel: 0,
};

/** Dirección del sol. a = 0 al amanecer (06:00), π al ocaso (18:00). Misma fórmula que el shader. */
export function sunDir(hour: number): [number, number, number] {
  const a = ((((hour % 24) + 24) % 24) - 6) / 12 * Math.PI;
  const x = -Math.cos(a), y = Math.sin(a) * 0.92, z = 0.55;
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
}

/** 1 = pleno día, 0 = noche (en función de la elevación solar). */
export function dayness(hour: number) {
  const el = sunDir(hour)[1];
  const t = Math.min(1, Math.max(0, (el + 0.06) / 0.2));
  return t * t * (3 - 2 * t);
}

/** Temperatura típica del aire en verano en el Sahara: mínima al alba, máxima a media tarde. */
export function tempAt(hour: number) {
  const h = ((hour % 24) + 24) % 24;
  return 25 + 19 * Math.cos(((h - 15) / 24) * Math.PI * 2);
}

export function clock(hour: number) {
  const h = ((hour % 24) + 24) % 24;
  const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function momentAt(hour: number) {
  const h = ((hour % 24) + 24) % 24;
  if (h < 5) return "Noche cerrada";
  if (h < 6.5) return "Alba";
  if (h < 10) return "Mañana";
  if (h < 15) return "Mediodía";
  if (h < 18.3) return "Tarde";
  if (h < 20) return "Ocaso";
  return "Noche";
}

// ---------- Lunas nuevas ----------
const SYNODIC = 29.530588853; // días
// luna nueva de referencia: 6 ene 2000, 18:14 UTC
const EPOCH = Date.UTC(2000, 0, 6, 18, 14);

/** Próximas `n` lunas nuevas (aproximación por mes sinódico medio, error de unas horas). */
export function nextNewMoons(n: number, from = new Date()) {
  const days = (from.getTime() - EPOCH) / 86400000;
  let k = Math.ceil(days / SYNODIC);
  const out: Date[] = [];
  while (out.length < n) {
    out.push(new Date(EPOCH + k * SYNODIC * 86400000));
    k++;
  }
  return out;
}

export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Con luna nueva, ¿qué Vía Láctea se ve? El núcleo galáctico se ve de noche de marzo a octubre. */
export function milkyWayNote(d: Date) {
  const m = d.getUTCMonth() + 1;
  return m >= 3 && m <= 10 ? "Núcleo galáctico visible" : "Brazo de Orión y cielo de invierno";
}
