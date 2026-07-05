import type { Estado } from "@/admin/types";

/** Genera un id único. */
export function uid(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now() + "-" + Math.random().toString(36).slice(2);
}

/** Formatea un monto en ARS: 45000 → "$45.000". */
export function plata(n: number | string): string {
  return "$" + (Number(n) || 0).toLocaleString("es-AR");
}

/** Slug de estado para clases CSS: "Señado" → "senado". */
export function slugEstado(e: Estado | string): string {
  return String(e)
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
}

/**
 * Normaliza un teléfono a formato WhatsApp AR (549…). Devuelve null si no hay dígitos.
 */
export function telWa(t: string): string | null {
  const d = String(t || "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("549")) return d;
  if (d.startsWith("54")) return "549" + d.slice(2);
  if (d.length === 10) return "549" + d;
  if (d.length === 8) return "54911" + d;
  return "549" + d;
}
