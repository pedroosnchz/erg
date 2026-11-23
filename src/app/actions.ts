"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isoDay, nextNewMoons } from "@/lib/sky";

export type ReserveState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; name: string; night: string; guests: number; tent: number; again: boolean };

const schema = z.object({
  name: z.string().trim().min(2, "Dinos al menos cómo te llamas (2 letras).").max(30, "Nombre demasiado largo (máx. 30)."),
  email: z.email("Ese email se ha perdido en el desierto. Revísalo."),
  night: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elige una noche de luna nueva."),
  guests: z.coerce.number().int().min(1).max(6, "Máximo 6 viajeros por jaima."),
});

export async function reserve(_prev: ReserveState, formData: FormData): Promise<ReserveState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    night: formData.get("night"),
    guests: formData.get("guests"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  const { name, email, night, guests } = parsed.data;

  // sólo se aceptan noches de luna nueva reales (recalculadas aquí, no en el cliente)
  if (!nextNewMoons(8).map(isoDay).includes(night)) {
    return { status: "error", message: "Esa noche tiene luna. Elige una de las fechas propuestas." };
  }

  const existing = await prisma.traveler.findUnique({ where: { email } });
  if (existing) {
    return { status: "ok", name: existing.name, night: existing.night, guests: existing.guests, tent: existing.tent, again: true };
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const t = await prisma.$transaction(async (tx) => {
        const last = await tx.traveler.findFirst({ orderBy: { tent: "desc" } });
        return tx.traveler.create({ data: { name, email, night, guests, tent: (last?.tent ?? 0) + 1 } });
      });
      revalidatePath("/");
      return { status: "ok", name: t.name, night: t.night, guests: t.guests, tent: t.tent, again: false };
    } catch (err) {
      if ((err as { code?: string }).code !== "P2002") throw err;
    }
  }
  return { status: "error", message: "Tormenta de arena en la línea. Inténtalo otra vez." };
}
