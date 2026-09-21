import { useMemo } from "react";
import { BULLETS_VISOR } from "@/data/site";
import { linkWhatsApp } from "@/lib/whatsapp";
import { resolverFoto } from "@/lib/fotos";
import { Button } from "@/components/ui/button";
import { VisorFotos } from "@/components/ui/visor-fotos";
import type { VisorConfig } from "@/context/LandingContext";

interface VisorProps {
  cfg: VisorConfig | null;
  onCerrar: () => void;
  onPrecargar: (valor: string) => void;
}

/**
 * Visor de detalle del catálogo: la galería de `VisorFotos` más el panel de
 * producto (tag, descripción, modelos de la categoría y CTAs).
 *
 * Antes era una copia casi literal de `VisorFotos` con el panel pegado: las
 * dos implementaban por separado el bloqueo de scroll, el teclado, el swipe y
 * las miniaturas, y ninguna atrapaba el foco. Ahora esto es solo el contenido
 * del slot `detalle`; toda la mecánica del diálogo vive en un lugar.
 */
export function Visor({ cfg, onCerrar, onPrecargar }: VisorProps) {
  const fotos = useMemo(
    () => (cfg ? cfg.fotos.filter(Boolean).map((f) => resolverFoto(f, cfg.titulo)) : []),
    [cfg]
  );

  if (!cfg || !fotos.length) {
    return <VisorFotos fotos={[]} indice={null} onCerrar={onCerrar} />;
  }

  const waLink = linkWhatsApp(
    `¡Hola Astefil! Vi las fotos de ${cfg.titulo.toLowerCase()} en la página y quiero consultar 🎈`
  );

  const detalle = (
    <>
      <span className="self-start rounded-full border-3 border-tinta bg-amarillo px-[13px] py-1 font-alt text-[.8rem] font-extrabold shadow-hard-sm">
        {cfg.tag}
      </span>
      <h2 className="font-display text-2xl leading-[1.05] md:text-[2rem]">{cfg.titulo}</h2>
      {/* Una categoría no tiene descripción propia: sin esto quedaba un <p>
          vacío empujando el layout. */}
      {cfg.desc && <p className="text-[.98rem] leading-[1.55] text-[#3c2f28]">{cfg.desc}</p>}

      {cfg.modelos && cfg.modelos.length > 0 && (
        <div className="rounded-xl border-3 border-tinta bg-white p-3">
          <h3 className="mb-2 font-alt text-[.92rem] font-extrabold">
            Modelos disponibles ({cfg.modelos.length})
          </h3>
          <ul className="flex flex-col gap-1.5">
            {cfg.modelos.map((m) => (
              <li key={m.id} className="flex items-baseline justify-between gap-3 text-[.9rem]">
                <span className="font-alt font-bold">{m.nombre}</span>
                {m.ancho && m.largo && (
                  <span className="flex-none font-alt text-[.78rem] font-bold text-[#5a4a41]">
                    {m.ancho} × {m.largo}
                    {m.alto ? " × " + m.alto : ""} m
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="flex flex-col gap-2 text-[.9rem] text-[#3c2f28]">
        {BULLETS_VISOR.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-0.5 text-[.85rem] text-rojo" aria-hidden="true">
              ★
            </span>
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-2.5 pt-2">
        {cfg.valorCotizador && (
          <Button
            variant="rojo"
            onClick={() => {
              const valor = cfg.valorCotizador!;
              onCerrar();
              onPrecargar(valor);
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
    </>
  );

  return (
    <VisorFotos
      fotos={fotos}
      indice={cfg.indiceInicial ?? 0}
      onCerrar={onCerrar}
      etiqueta={`Detalle de ${cfg.titulo}`}
      detalle={detalle}
    />
  );
}
