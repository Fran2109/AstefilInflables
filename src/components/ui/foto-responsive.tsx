import { MEDIDAS } from "@/data/imagenes";

/** Los mismos anchos que genera `tools/build_fotos.py`. */
const ANCHOS = [400, 800, 1440];

interface Props {
  /** Ruta del master JPEG, tal como está en `data/quinta.ts` o en el código. */
  src: string;
  alt: string;
  /** Qué ancho va a ocupar en pantalla. Sin esto el navegador asume 100vw y baja de más. */
  sizes: string;
  /** Solo para la imagen que es el LCP de la página: baja con prioridad y sin lazy. */
  prioridad?: boolean;
  className?: string;
}

/**
 * Foto de contenido con variantes WebP y medidas declaradas.
 *
 * Dos cosas que resuelve y que antes faltaban en todo el sitio:
 *
 * - **Peso.** Los masters de `public/img/` son de ~1800px y se servían tal cual
 *   como miniaturas de ~330px. Acá el navegador elige la variante que
 *   corresponde según `sizes` y la densidad de la pantalla.
 * - **CLS.** `width`/`height` salen de `data/imagenes.ts`, que genera el mismo
 *   script que las variantes, así que el navegador reserva el espacio exacto
 *   antes de que la foto baje y la página no salta.
 *
 * Si la foto no está en `MEDIDAS` —una subida por el admin a Supabase Storage,
 * por ejemplo— degrada a un `<img>` común sin `srcset`. No rompe nada: las
 * fotos viejas se siguen viendo igual.
 */
export function FotoResponsive({ src, alt, sizes, prioridad = false, className }: Props) {
  const medida = MEDIDAS[src];

  const carga = prioridad
    ? ({ loading: "eager", decoding: "sync", fetchPriority: "high" } as const)
    : ({ loading: "lazy", decoding: "async" } as const);

  if (!medida) {
    return <img src={src} alt={alt} className={className} {...carga} />;
  }

  // Solo las variantes que existen: el script no agranda un master chico.
  const base = src.replace(/\.jpg$/, "");
  const srcSet = ANCHOS.filter((a) => a <= medida.w)
    .map((a) => `${base}-${a}.webp ${a}w`)
    .join(", ");

  return (
    <picture>
      {srcSet && <source type="image/webp" srcSet={srcSet} sizes={sizes} />}
      <img
        src={src}
        alt={alt}
        width={medida.w}
        height={medida.h}
        className={className}
        {...carga}
      />
    </picture>
  );
}
