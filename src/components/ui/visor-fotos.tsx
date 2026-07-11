import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface FotoVisor {
  src: string;
  alt: string;
}

interface Props {
  fotos: readonly FotoVisor[];
  /** Índice de la foto con la que abrir, o null si el visor está cerrado. */
  indice: number | null;
  onCerrar: () => void;
}

/**
 * Visor de fotos a pantalla completa, solo imágenes (sin la parte de producto
 * del `Visor` de la landing): carrousel con flechas, teclado, swipe, contador
 * y miniaturas. El alt queda solo como accesibilidad, no se muestra. Se usa
 * en la página de la quinta.
 */
export function VisorFotos({ fotos, indice, onCerrar }: Props) {
  const abierto = indice !== null;
  const [idx, setIdx] = useState(0);
  const toqueX = useRef<number | null>(null);

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

  // Bloqueo de scroll del body mientras está abierto.
  useEffect(() => {
    if (!abierto) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  // Teclado: Escape cierra, flechas navegan.
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowLeft") mostrar(idx - 1);
      if (e.key === "ArrowRight") mostrar(idx + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, idx, mostrar, onCerrar]);

  if (!abierto || !fotos.length) return null;

  const foto = fotos[idx];
  const varias = fotos.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galería de fotos"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-tinta/85 p-3 md:p-[18px]"
    >
      <div className="relative flex max-h-[calc(100vh-24px)] w-[min(920px,100%)] flex-col overflow-hidden rounded-[22px] border-3 border-tinta bg-papel shadow-hard-xl">
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
          <img src={foto.src} alt={foto.alt} className="max-h-[68vh] max-w-full object-contain" />

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
                className={`h-[62px] w-[62px] flex-none overflow-hidden rounded-[10px] border-3 border-tinta bg-white ${
                  i === idx ? "opacity-100 outline outline-4 outline-amarillo" : "opacity-65"
                }`}
              >
                <img src={f.src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
