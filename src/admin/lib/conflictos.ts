import type { Articulo, Reserva } from "@/admin/types";

const NO_BLOQUEAN = ["Consulta", "Cancelado"];

export interface Conflicto {
  res: Reserva;
  articulos: string[];
}

/** Nombres de artículos a partir de sus ids. */
export function nombresInf(ids: string[], articulos: Articulo[]): string[] {
  return (ids || [])
    .map((id) => articulos.find((a) => a.id === id)?.nombre)
    .filter((n): n is string => Boolean(n));
}

/**
 * Conflictos de una reserva: misma fecha + intersección de articuloIds con otra
 * reserva "bloqueante". Consulta y Cancelado no bloquean ni son bloqueadas.
 */
export function conflictosDe(
  res: Pick<Reserva, "id" | "estado" | "fecha" | "articuloIds">,
  reservas: Reserva[],
  articulos: Articulo[]
): Conflicto[] {
  if (NO_BLOQUEAN.includes(res.estado)) return [];
  const out: Conflicto[] = [];
  for (const o of reservas) {
    if (o.id === res.id || o.fecha !== res.fecha) continue;
    if (NO_BLOQUEAN.includes(o.estado)) continue;
    const comunes = (res.articuloIds || []).filter((id) => (o.articuloIds || []).includes(id));
    if (comunes.length) out.push({ res: o, articulos: nombresInf(comunes, articulos) });
  }
  return out;
}
