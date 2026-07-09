import type { Foto } from "@/types/catalogo";

/**
 * Placeholder "trucha" on-brand: no hay fotos reales todavía para esta clave,
 * así que se genera una imagen de relleno (SVG inline, sin red) con los
 * colores de la marca. Es determinístico: la misma clave siempre da la misma
 * imagen, para que no "parpadee" distinto en cada render.
 */

const COLORES = ["#E8352B", "#FFC61B", "#1F6FD0", "#23B15D", "#FF7AA2", "#C9E9FF"];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function fotoPlaceholder(seed: string, alt?: string): Foto {
  const h = hash(seed || "astefil");
  const bg = COLORES[h % COLORES.length];
  const bg2 = COLORES[(h + 2) % COLORES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
    <defs>
      <pattern id="p" width="70" height="70" patternTransform="rotate(-18)" patternUnits="userSpaceOnUse">
        <rect width="70" height="70" fill="${bg}"/>
        <rect width="35" height="70" fill="${bg2}" opacity=".4"/>
      </pattern>
    </defs>
    <rect width="640" height="480" fill="url(#p)"/>
    <rect x="14" y="14" width="612" height="452" fill="none" stroke="#1B1310" stroke-width="6" rx="20"/>
    <text x="320" y="248" text-anchor="middle" font-family="Baloo 2, Arial, sans-serif" font-size="38" font-weight="800" fill="#1B1310" opacity=".55">FOTO</text>
    <text x="320" y="286" text-anchor="middle" font-family="Baloo 2, Arial, sans-serif" font-size="20" font-weight="700" fill="#1B1310" opacity=".45">de muestra</text>
  </svg>`;
  return {
    clave: seed,
    src: "data:image/svg+xml;utf8," + encodeURIComponent(svg),
    alt: alt || "Foto de muestra (todavía no cargamos la real)",
  };
}
