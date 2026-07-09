import { Search } from "lucide-react";
import type { Producto } from "@/types/catalogo";
import { Button } from "@/components/ui/button";
import { fotoPlaceholder } from "@/lib/placeholder";
import { useLanding } from "@/context/LandingContext";
import { useCatalogo } from "@/context/CatalogoContext";
import { ILUSTRACIONES } from "@/components/landing/ilustraciones";

export function ProductoCard({ producto }: { producto: Producto }) {
  const { precargar, abrirVisor } = useLanding();
  const { modelos } = useCatalogo();
  const fotos = producto.fotos;
  const tieneFotos = fotos.length > 0;
  const primera = tieneFotos ? fotoPlaceholder(fotos[0], producto.titulo) : null;

  // Modelos reales de esta categoría (según el mapeo `cats` de la card).
  const cats = producto.cats ?? [];
  const modelosCat = modelos.filter((m) => cats.includes(m.cat));

  const abrir = () =>
    abrirVisor({
      titulo: producto.titulo,
      tag: producto.tag,
      desc: producto.descLarga,
      fotos: producto.fotos,
      inflableId: producto.id,
      modelos: modelosCat,
    });

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border-3 border-tinta bg-papel shadow-hard transition-transform duration-150 hover:-translate-y-1 hover:translate-x-[-3px] hover:-rotate-[.4deg] hover:shadow-[10px_12px_0_var(--tinta)]">
      {tieneFotos && primera ? (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Ver fotos de ${producto.titulo}`}
          onClick={abrir}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              abrir();
            }
          }}
          className="group relative aspect-[4/3.4] cursor-zoom-in overflow-hidden border-b-3 border-tinta bg-cielo-osc"
        >
          <img src={primera.src} alt={primera.alt} loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full border-3 border-tinta bg-amarillo px-3 py-1 font-alt text-[.78rem] font-extrabold shadow-hard-sm">
            {producto.tag}
          </span>
          <span className="pointer-events-none absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full border-3 border-tinta bg-papel px-2.5 py-1 font-alt text-[.74rem] font-extrabold shadow-hard-sm">
            <Search className="h-3 w-3" strokeWidth={3} /> {fotos.length}{" "}
            {fotos.length === 1 ? "foto" : "fotos"}
          </span>
        </div>
      ) : (
        <div
          className="flex aspect-[4/3.4] items-center justify-center border-b-3 border-tinta"
          style={{ background: producto.ilustracionId ? ILUSTRACIONES[producto.ilustracionId].fondo : undefined }}
        >
          {producto.ilustracionId && ILUSTRACIONES[producto.ilustracionId].svg}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2.5 p-[18px]">
        <h3 className="text-[1.35rem] font-extrabold leading-[1.1]">{producto.titulo}</h3>
        <p className="flex-1 text-[.95rem] leading-[1.5] text-[#3c2f28]">{producto.descCorta}</p>
        <Button variant="rojo" size="chico" className="self-start" onClick={() => precargar(producto.id)}>
          ¡Lo quiero!
        </Button>
      </div>
    </article>
  );
}
