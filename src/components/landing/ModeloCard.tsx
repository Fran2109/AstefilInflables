import { Search } from "lucide-react";
import type { ModeloPublico } from "@/types/catalogo";
import { linkWhatsApp } from "@/lib/whatsapp";
import { useLanding } from "@/context/LandingContext";
import { Button } from "@/components/ui/button";

/** Acento de color por categoría (con fallback para nombres viejos/desconocidos). */
const COLOR_CAT: Record<string, string> = {
  Castillos: "bg-rojo",
  Gigantes: "bg-azul",
  Acuáticos: "bg-cielo-osc",
  Juegos: "bg-verde",
  Eventos: "bg-rosa",
};

/**
 * Tarjeta de un modelo real del inventario, para la vista filtrada por categoría.
 * Con foto: portada real + galería en el visor. Sin foto: banda de color por categoría.
 */
export function ModeloCard({ modelo }: { modelo: ModeloPublico }) {
  const { abrirVisor } = useLanding();
  const { nombre, cat, descripcion, ancho, largo, alto, fotos = [] } = modelo;
  const tieneFotos = fotos.length > 0;
  const tieneMedidas = ancho != null && largo != null;
  const medidas = tieneMedidas ? `${ancho} × ${largo}${alto != null ? " × " + alto : ""} m` : null;
  const wa = linkWhatsApp(`¡Hola Astefil! Quiero consultar por ${nombre} (${cat}) 🎈`);

  const abrir = () =>
    abrirVisor({ titulo: nombre, tag: cat, desc: descripcion ?? "", fotos });

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border-3 border-tinta bg-papel shadow-hard-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-hard">
      {tieneFotos ? (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Ver fotos de ${nombre}`}
          onClick={abrir}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              abrir();
            }
          }}
          className="group relative aspect-[4/3.2] cursor-zoom-in overflow-hidden border-b-3 border-tinta bg-cielo-osc"
        >
          <img src={fotos[0]} alt={nombre} loading="lazy" className="h-full w-full object-cover" />
          {medidas && (
            <span className="absolute left-2.5 top-2.5 rounded-full border-3 border-tinta bg-papel px-2.5 py-0.5 font-alt text-[.72rem] font-extrabold shadow-hard-sm">
              📏 {medidas}
            </span>
          )}
          {fotos.length > 1 && (
            <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full border-3 border-tinta bg-papel px-2 py-0.5 font-alt text-[.7rem] font-extrabold shadow-hard-sm">
              <Search className="h-3 w-3" strokeWidth={3} /> {fotos.length}
            </span>
          )}
        </div>
      ) : (
        <div className={`flex items-center justify-between gap-2 border-b-3 border-tinta px-4 py-2.5 ${COLOR_CAT[cat] ?? "bg-amarillo"}`}>
          <h3 className="font-alt text-[1.05rem] font-extrabold leading-tight text-white [text-shadow:1px_1px_0_var(--tinta)]">
            {nombre}
          </h3>
          {medidas && (
            <span className="flex-none rounded-full border-2 border-tinta bg-papel px-2 py-0.5 font-alt text-[.72rem] font-extrabold">
              {medidas}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        {tieneFotos && <h3 className="text-[1.1rem] font-extrabold leading-tight">{nombre}</h3>}
        {descripcion && (
          <p className="flex-1 text-[.9rem] leading-[1.45] text-[#3c2f28]">{descripcion}</p>
        )}
        <Button asChild variant="verde" size="chico" className="self-start">
          <a href={wa} target="_blank" rel="noopener">
            Consultar
          </a>
        </Button>
      </div>
    </article>
  );
}
