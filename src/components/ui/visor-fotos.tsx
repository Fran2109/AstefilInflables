import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FotoVisor {
  src: string;
  alt: string;
}

interface Props {
  fotos: readonly FotoVisor[];
  /** Índice de la foto con la que abrir, o null si el visor está cerrado. */
  indice: number | null;
  onCerrar: () => void;
  /** Panel lateral opcional (info de producto + CTAs). Lo usa el catálogo. */
  detalle?: ReactNode;
  /** Nombre accesible del diálogo. */
  etiqueta?: string;
}

/**
 * Visor de fotos a pantalla completa: carrousel con flechas, teclado, swipe,
 * contador y miniaturas. Con `detalle` suma un panel al costado, que es lo que
 * usa el catálogo para la info del producto y sus CTAs.
 *
 * Está construido sobre `<dialog>` + `showModal()` y no sobre un div a propósito.
 * Antes eran dos implementaciones casi idénticas (esta y `landing/Visor.tsx`) y
 * **ninguna de las dos atrapaba el foco**: decían `role="dialog"
 * aria-modal="true"` pero el Tab se escapaba al contenido de atrás, que seguía
 * en el DOM, el foco nunca entraba al abrir y nunca volvía al disparador al
 * cerrar. Para alguien que usa lector de pantalla o solo teclado, el visor era
 * prácticamente inalcanzable.
 *
 * `showModal()` regala todo eso: foco atrapado, fondo inerte, Escape, y un
 * `::backdrop` real. De paso se van ~80 líneas de `useEffect` duplicadas.
 */
export function VisorFotos({ fotos, indice, onCerrar, detalle, etiqueta }: Props) {
  const abierto = indice !== null;
  const [idx, setIdx] = useState(0);
  const toqueX = useRef<number | null>(null);
  const refDialog = useRef<HTMLDialogElement>(null);

  const mostrar = useCallback(
    (i: number) => {
      const n = fotos.length;
      if (n) setIdx(((i % n) + n) % n);
    },
    [fotos.length]
  );

  // Al abrir, arranca en la foto clickeada.
  useEffect(() => {
    if (indice !== null) setIdx(indice);
  }, [indice]);

  useEffect(() => {
    const d = refDialog.current;
    if (!d) return;
    if (abierto && !d.open) {
      d.showModal();
      // `showModal` no bloquea el scroll de la página de forma consistente
      // entre navegadores. Compensar el ancho de la barra evita el salto
      // horizontal que había al abrir en desktop.
      const barra = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (barra > 0) document.body.style.paddingRight = `${barra}px`;
    } else if (!abierto && d.open) {
      d.close();
    }
  }, [abierto]);

  // Limpieza del bloqueo, tanto al cerrar como al desmontar.
  useEffect(() => {
    if (abierto) return;
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }, [abierto]);

  // `cancel` (Escape) y `close` no burbujean, y React 18 no los delega de forma
  // confiable: con `onCancel` en el JSX el navegador cerraba el diálogo y el
  // estado de React se quedaba en "abierto". Listener nativo, entonces.
  useEffect(() => {
    const d = refDialog.current;
    if (!d) return;
    const alCancelar = (e: Event) => {
      // El cierre lo manda el estado de React, no el navegador.
      e.preventDefault();
      onCerrar();
    };
    d.addEventListener("cancel", alCancelar);
    return () => d.removeEventListener("cancel", alCancelar);
  }, [onCerrar]);

  // Flechas para navegar, y Escape también acá.
  //
  // En teoría Escape sobre un <dialog> modal dispara `cancel` y el navegador
  // cierra solo, pero no en todos lados: el panel de preview del proyecto
  // despacha el keydown y nunca el `cancel`. Depender solo del camino nativo
  // dejaría un cierre que no se puede verificar. El listener de `cancel` de
  // arriba queda igual, para los navegadores donde sí llega primero; llamar
  // dos veces a `onCerrar` no hace nada malo.
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCerrar();
      }
      if (e.key === "ArrowLeft") mostrar(idx - 1);
      if (e.key === "ArrowRight") mostrar(idx + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, idx, mostrar, onCerrar]);

  const foto = fotos.length ? fotos[idx] : null;
  const varias = fotos.length > 1;

  return (
    <dialog
      ref={refDialog}
      aria-label={etiqueta ?? "Galería de fotos"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
      className="visor max-h-none max-w-none bg-transparent p-3 backdrop:bg-tinta/85 md:p-[18px]"
    >
      {foto && (
        <div
          className={cn(
            "relative mx-auto flex max-h-[calc(100dvh-24px)] w-[min(920px,100%)] flex-col overflow-hidden rounded-[22px] border-3 border-tinta bg-papel shadow-hard-xl",
            detalle && "md:grid md:max-h-[calc(100dvh-36px)] md:grid-cols-[1.25fr_.9fr]"
          )}
        >
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="absolute right-3.5 top-3.5 z-[5] flex h-11 w-11 items-center justify-center rounded-xl border-3 border-tinta bg-rojo text-white shadow-hard-sm transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            <X className="h-5 w-5" strokeWidth={3} />
          </button>

          {varias && (
            <span className="absolute left-3.5 top-3.5 z-[4] rounded-full border-3 border-tinta bg-papel px-3 py-1 font-alt text-[.8rem] font-extrabold shadow-hard-sm">
              {idx + 1}/{fotos.length}
            </span>
          )}

          <div className="flex min-w-0 flex-col">
            <div
              className="relative flex min-h-[260px] flex-1 touch-pan-y items-center justify-center overflow-hidden bg-cielo-osc"
              onTouchStart={(e) => {
                toqueX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (toqueX.current === null) return;
                const dx = e.changedTouches[0].clientX - toqueX.current;
                if (Math.abs(dx) > 40) mostrar(idx + (dx < 0 ? 1 : -1));
                toqueX.current = null;
              }}
            >
              <img
                /* La `key` reinicia la animación en cada cambio de foto: la
                   nueva aterriza en lugar de saltar. */
                key={foto.src}
                src={foto.src}
                alt={foto.alt}
                className="animate-aterrizar max-h-[68dvh] max-w-full object-contain"
              />

              {varias && (
                <>
                  <button
                    onClick={() => mostrar(idx - 1)}
                    aria-label="Foto anterior"
                    className="absolute left-3.5 top-1/2 z-[4] flex h-[46px] w-[46px] -translate-y-1/2 items-center justify-center rounded-full border-3 border-tinta bg-amarillo shadow-hard-sm transition active:translate-x-[3px] active:shadow-none"
                  >
                    <ChevronLeft strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => mostrar(idx + 1)}
                    aria-label="Foto siguiente"
                    className="absolute right-3.5 top-1/2 z-[4] flex h-[46px] w-[46px] -translate-y-1/2 items-center justify-center rounded-full border-3 border-tinta bg-amarillo shadow-hard-sm transition active:translate-x-[3px] active:shadow-none"
                  >
                    <ChevronRight strokeWidth={3} />
                  </button>
                </>
              )}
            </div>

            {varias && (
              <div className="flex gap-2 overflow-x-auto border-t-3 border-tinta bg-papel p-3">
                {fotos.map((f, i) => (
                  <button
                    key={f.src}
                    onClick={() => mostrar(i)}
                    aria-label={`Foto ${i + 1}`}
                    aria-current={i === idx}
                    className={cn(
                      "h-[62px] w-[62px] flex-none overflow-hidden rounded-[10px] border-3 border-tinta bg-white transition-opacity duration-150",
                      i === idx ? "opacity-100 outline outline-4 outline-amarillo" : "opacity-65"
                    )}
                  >
                    <img src={f.src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {detalle && (
            <div className="flex min-w-0 flex-col gap-3 overflow-y-auto border-t-3 border-tinta p-5 md:border-l-3 md:border-t-0">
              {detalle}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
