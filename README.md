# ERG — Cinco días cruzando el mar de arena

Landing cinematográfica de una travesía por el Sahara. Al hacer scroll vives 24 horas en el desierto: alba, mediodía, ocaso, la noche sin luna y otra vez el amanecer.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · Tailwind CSS 4 · Prisma 7 + SQLite · WebGL · Lenis

## Arrancar

```bash
npm install          # ejecuta también prisma generate
npx prisma migrate dev
npm run dev
```

## Piezas

| Pieza | Archivo | Qué hace |
|---|---|---|
| Desierto 3D | `src/components/DesertGL.tsx` | Raymarching de un campo de dunas asimétricas (con interpolación en el cruce para evitar escalonado), sombras suaves hacia el sol, cielo según la elevación solar, estrellas y Vía Láctea que giran con la hora, calima y espejismo al mediodía. La resolución se adapta al rendimiento |
| Reloj del scroll | `src/components/Engine.tsx`, `src/lib/sky.ts` | Cada sección declara su franja horaria (`data-h0`/`data-h1`) y cuánto mira la cámara al cielo (`data-l0`/`data-l1`). Hace el amanecer de introducción y adapta el color de la tinta (`--ink-rgb`) para leerse sobre el día o la noche |
| Titulares de arena | `src/components/SandTitle.tsx` | El texto real queda en el DOM; un canvas lo dibuja con hasta ~20 000 granos que el viento forma y deshace de forma reversible con el scroll. El cursor dispersa la arena |
| Reloj solar | `src/components/Header.tsx` | Muestra el arco del sol, la hora, el momento del día y la temperatura |
| Espejismo | `sections/Mirage.tsx` | Un oasis que huye del cursor (en móvil, del scroll) |
| Travesía | `sections/Crossing.tsx` | Huellas que aparecen al ritmo del scroll y que el viento borra; paradas de 5 días |
| Cielo sin luna | `sections/StarChart.tsx`, `NightSky.tsx` | Orión y Tauro con los nombres árabes de sus estrellas (escritura árabe, transliteración y significado). Los viajeros aparecen como estrellas doradas |
| Reserva | `sections/Reserve.tsx`, `ReserveForm.tsx`, `src/app/actions.ts` | Las fechas son las próximas lunas nuevas, calculadas en cada petición con el mes sinódico y validadas en el servidor. Asigna una jaima |

Respeta `prefers-reduced-motion`: sin Lenis, titulares ya formados y escena estática.
