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
