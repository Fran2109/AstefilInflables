import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { FOTOS } from "@/data/fotos";
import { BULLETS_VISOR } from "@/data/productos";
import { linkWhatsApp } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import type { VisorConfig } from "@/context/LandingContext";

interface VisorProps {
  cfg: VisorConfig | null;
  onCerrar: () => void;
  onPrecargar: (valor: string) => void;
}

/**
 * Visor de detalle / galería. Soporta flechas, teclado, swipe y miniaturas.
 * Con una sola foto oculta flechas y miniaturas.
 */
export function Visor({ cfg, onCerrar, onPrecargar }: VisorProps) {
  const abierto = cfg !== null;

  // Solo fotos que existen realmente.
  const fotos = useMemo(
    () => (cfg ? cfg.fotos.filter((f) => FOTOS[f]) : []),
    [cfg]
  );
  const [idx, setIdx] = useState(0);
  const toqueX = useRef<number | null>(null);

  const mostrar = useCallback(
    (i: number) => {
      setIdx((prev) => {
        const n = fotos.length;
        if (!n) return prev;
        return ((i % n) + n) % n;
      });
    },
    [fotos.length]
  );

  // Al abrir/cambiar de config, arranca en la foto pedida.
  useEffect(() => {
    if (cfg) setIdx(cfg.indiceInicial ?? 0);
  }, [cfg]);

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

  if (!abierto || !cfg || !fotos.length) return null;

  const varias = fotos.length > 1;
  const foto = FOTOS[fotos[idx]];
  const waLink = linkWhatsApp(
    `¡Hola Astefil! Vi las fotos de ${cfg.titulo.toLowerCase()} en la página y quiero consultar 🎈`
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Detalle del producto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-tinta/80 p-3 md:p-[18px]"
    >
      <div className="relative grid max-h-[calc(100vh-20px)] w-[min(980px,100%)] grid-rows-[minmax(0,1.1fr)_minmax(0,1fr)] overflow-hidden rounded-[22px] border-3 border-tinta bg-papel shadow-hard-xl md:max-h-[calc(100vh-36px)] md:grid-cols-[1.25fr_.9fr] md:grid-rows-none">
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="absolute right-[18px] top-[18px] z-[5] flex h-11 w-11 items-center justify-center rounded-xl border-3 border-tinta bg-rojo font-alt text-[1.15rem] font-extrabold text-white shadow-hard-sm transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none md:right-[26px] md:top-[26px]"
        >
          <X className="h-5 w-5" strokeWidth={3} />
        </button>

        {/* Escena de foto */}
        <div className="relative flex min-h-[230px] flex-col border-b-3 border-tinta bg-cielo-osc md:min-h-[320px] md:border-b-0 md:border-r-3">
          {varias && (
            <span className="absolute left-3.5 top-3.5 z-[4] rounded-full border-3 border-tinta bg-papel px-3 py-1 font-alt text-[.8rem] font-extrabold shadow-hard-sm">
              {idx + 1}/{fotos.length}
            </span>
          )}

          <div
            className="flex min-h-0 flex-1 touch-pan-y items-center justify-center overflow-hidden"
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
              src={foto.src}
              alt={foto.alt}
              className="max-h-full max-w-full object-contain"
            />
          </div>

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

              <div className="flex gap-2 overflow-x-auto border-t-3 border-tinta bg-papel p-3">
                {fotos.map((f, i) => (
                  <button
                    key={f}
                    onClick={() => mostrar(i)}
                    aria-label={`Foto ${i + 1}`}
                    className={`h-[62px] w-[62px] flex-none overflow-hidden rounded-[10px] border-3 border-tinta bg-white ${
                      i === idx ? "opacity-100 outline outline-4 outline-amarillo" : "opacity-65"
                    }`}
                  >
                    <img src={FOTOS[f].src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3.5 overflow-y-auto p-[18px] md:p-6">
          <span className="self-start rounded-full border-3 border-tinta bg-amarillo px-[13px] py-1 font-alt text-[.8rem] font-extrabold shadow-hard-sm">
            {cfg.tag}
          </span>
          <h3 className="font-display text-2xl leading-[1.05] md:text-[2rem]">{cfg.titulo}</h3>
          <p className="text-[.98rem] leading-[1.55] text-[#3c2f28]">{cfg.desc}</p>
          <ul className="flex flex-col gap-2 text-[.9rem] text-[#3c2f28]">
            {BULLETS_VISOR.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-0.5 text-[.85rem] text-rojo">★</span>
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-2.5 pt-2">
            {cfg.inflableId && (
              <Button
                variant="rojo"
                onClick={() => {
                  const id = cfg.inflableId!;
                  onCerrar();
                  onPrecargar(id);
                }}
              >
                ¡Lo quiero!
              </Button>
            )}
            <Button asChild variant="verde">
              <a href={waLink} target="_blank" rel="noopener">
                Consultar por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
