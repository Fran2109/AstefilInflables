import { cn } from "@/lib/utils";

/**
 * Bloque de espera, con la forma final de lo que va a llegar.
 *
 * Dos decisiones que lo separan del skeleton genérico:
 *
 * - **Sin shimmer.** El brillo que recorre un skeleton es un degradado en
 *   movimiento, y la marca no admite degradados ("ningún degradado, ningún
 *   brillo falso"). La espera se comunica con un pulso de opacidad.
 * - **Con borde y sombra dura.** Ocupa exactamente el lugar y el peso visual
 *   de la card que va a reemplazar, así que cuando llega el contenido real no
 *   se mueve nada. Un skeleton que no reserva el espacio correcto cambia un
 *   parpadeo por un salto de layout, que es peor.
 */
export function Esqueleto({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-motion="decorativo"
      className={cn(
        "animate-respirar rounded-lg border-3 border-tinta bg-papel shadow-hard-sm",
        className
      )}
    />
  );
}

/**
 * Grilla de espera del catálogo. Tres bloques con la proporción de las cards
 * reales (`aspect-[4/3.2]` de foto + el bloque de texto y botones de abajo).
 */
export function EsqueletoGrilla({ cantidad = 3 }: { cantidad?: number }) {
  return (
    <div
      className="mt-7 grid grid-cols-1 gap-[26px] sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Cargando el catálogo"
    >
      {Array.from({ length: cantidad }, (_, i) => (
        <Esqueleto key={i} className="h-[310px]" />
      ))}
    </div>
  );
}
