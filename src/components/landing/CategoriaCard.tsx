import { Search } from "lucide-react";
import type { CategoriaConModelos } from "@/types/catalogo";
import { Button } from "@/components/ui/button";
import { resolverFoto, srcsetDeFoto } from "@/lib/fotos";
import { useLanding } from "@/context/LandingContext";

/**
 * Card del overview "Todos" del catálogo: una categoría con lo que el
 * inventario tiene cargado adentro.
 *
 * Todo lo que muestra es real — la portada es la foto de uno de sus modelos,
 * el contador dice cuántos hay y el cuerpo los nombra. No hay copy de
 * marketing porque no hay de dónde sacarlo: la categoría no tiene descripción
 * propia, y antes eso se llenaba a mano en una tabla aparte.
 */
export function CategoriaCard({ categoria }: { categoria: CategoriaConModelos }) {
  const { precargar, abrirVisor } = useLanding();
  const { nombre, modelos, fotos } = categoria;
  const tieneFotos = fotos.length > 0;
  const portada = resolverFoto(tieneFotos ? fotos[0] : nombre, `Foto de ${nombre}`);
  const cuenta = `${modelos.length} ${modelos.length === 1 ? "modelo" : "modelos"}`;

  const abrir = () =>
    abrirVisor({
      titulo: nombre,
      tag: cuenta,
      desc: "",
      // Sin fotos reales va el nombre como clave de placeholder: la card sigue
      // abriendo el visor, donde está la lista de modelos de la categoría.
      fotos: tieneFotos ? fotos : [nombre],
      valorCotizador: nombre,
      modelos,
    });

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border-3 border-tinta bg-papel shadow-hard transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-1 hover:translate-x-[-3px] hover:-rotate-[.4deg] hover:shadow-[10px_12px_0_var(--tinta)]">
      <div
        role="button"
        tabIndex={0}
        aria-label={tieneFotos ? `Ver fotos de ${nombre}` : `Ver ${nombre}`}
        onClick={abrir}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrir();
          }
        }}
        className="group relative aspect-[4/3.4] cursor-zoom-in overflow-hidden border-b-3 border-tinta bg-cielo-osc"
      >
        <img
          src={portada.src}
          srcSet={srcsetDeFoto(portada.src) ?? undefined}
          sizes="(min-width: 1024px) 340px, (min-width: 640px) 45vw, 92vw"
          alt={portada.alt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full border-3 border-tinta bg-amarillo px-3 py-1 font-alt text-[.78rem] font-extrabold shadow-hard-sm">
          {cuenta}
        </span>
        {tieneFotos && (
          <span className="pointer-events-none absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full border-3 border-tinta bg-papel px-2.5 py-1 font-alt text-[.74rem] font-extrabold shadow-hard-sm">
            <Search className="h-3 w-3" strokeWidth={3} /> {fotos.length}{" "}
            {fotos.length === 1 ? "foto" : "fotos"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-[18px]">
        <h3 className="text-[1.35rem] font-extrabold leading-[1.1]">{nombre}</h3>
        <p className="flex-1 text-[.95rem] leading-[1.5] text-[#3c2f28]">{resumen(modelos)}</p>
        <Button variant="rojo" size="chico" className="self-start" onClick={() => precargar(nombre)}>
          ¡Lo quiero!
        </Button>
      </div>
    </article>
  );
}

/** Nombra los primeros modelos de la categoría y resume el resto. */
function resumen(modelos: CategoriaConModelos["modelos"]): string {
  const nombres = modelos.slice(0, 3).map((m) => m.nombre);
  const resto = modelos.length - nombres.length;
  return nombres.join(" · ") + (resto > 0 ? ` y ${resto} más` : "");
}
