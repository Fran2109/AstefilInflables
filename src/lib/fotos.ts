import type { Foto } from "@/types/catalogo";
import { fotoPlaceholder } from "@/lib/placeholder";

/** Los mismos anchos que sube `admin/lib/db.ts` → `subirFoto`. */
const ANCHOS = [400, 640, 1280];

/**
 * Arma el `srcset` de una foto subida desde el admin.
 *
 * Solo se guarda el path de la variante más grande (`<uuid>-1280.webp`); las
 * hermanas se derivan del nombre. Así no hizo falta migrar el esquema ni tocar
 * lo ya subido: una foto vieja (`<uuid>.jpg`) no matchea, devuelve `null` y se
 * renderiza como siempre, sin `srcset`.
 *
 * Recibe la URL pública completa, no el path: la landing ya las resuelve en
 * `lib/landingDb.ts`.
 */
export function srcsetDeFoto(url: string): string | null {
  if (!/-1280\.webp(\?|$)/.test(url)) return null;
  return ANCHOS.map((a) => `${url.replace("-1280.webp", `-${a}.webp`)} ${a}w`).join(", ");
}

/**
 * Una entrada de `fotos` puede ser dos cosas distintas: la URL/path real de
 * una foto subida al Storage, o una clave para generar un placeholder
 * on-brand. Esto decide cuál es, y vive acá porque lo necesitan tanto el
 * `Visor` como las cards del catálogo.
 */
export function esUrlReal(f: string): boolean {
  return /^(https?:|blob:|\/)/.test(f);
}

/** Resuelve una entrada de `fotos` a algo renderizable (foto real o placeholder). */
export function resolverFoto(f: string, alt?: string): Foto {
  return esUrlReal(f) ? { clave: f, src: f, alt: alt ?? "" } : fotoPlaceholder(f, alt);
}
