import type { Inflable, Reserva } from "@/admin/types";

const NO_BLOQUEAN = ["Consulta", "Cancelado"];

export interface Conflicto {
  res: Reserva;
  inflables: string[];
}

/** Nombres de inflables a partir de sus ids. */
export function nombresInf(ids: string[], inflables: Inflable[]): string[] {
  return (ids || [])
    .map((id) => inflables.find((i) => i.id === id)?.nombre)
    .filter((n): n is string => Boolean(n));
}

/**
 * Conflictos de una reserva: misma fecha + intersección de inflableIds con otra
 * reserva "bloqueante". Consulta y Cancelado no bloquean ni son bloqueadas.
 */
export function conflictosDe(
  res: Pick<Reserva, "id" | "estado" | "fecha" | "inflableIds">,
  reservas: Reserva[],
  inflables: Inflable[]
): Conflicto[] {
  if (NO_BLOQUEAN.includes(res.estado)) return [];
  const out: Conflicto[] = [];
  for (const o of reservas) {
    if (o.id === res.id || o.fecha !== res.fecha) continue;
    if (NO_BLOQUEAN.includes(o.estado)) continue;
    const comunes = (res.inflableIds || []).filter((id) => (o.inflableIds || []).includes(id));
    if (comunes.length) out.push({ res: o, inflables: nombresInf(comunes, inflables) });
  }
  return out;
}
