import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TituloSeccion } from "@/components/landing/TituloSeccion";
import { ProductoCard } from "@/components/landing/ProductoCard";
import { ModeloCard } from "@/components/landing/ModeloCard";
import { JUEGOS_SALON } from "@/data/site";
import { linkWhatsApp } from "@/lib/whatsapp";
import { useLanding } from "@/context/LandingContext";
import { useCatalogo } from "@/context/CatalogoContext";

export function Catalogo() {
  const { precargar } = useLanding();
  const { productos, modelos, categorias } = useCatalogo();
  // null = "Todos" (overview de categorías con fotos).
  const [filtro, setFiltro] = useState<string | null>(null);

  const juegos = modelos.filter((m) => m.cat === "Juegos");
  const modelosFiltrados = filtro ? modelos.filter((m) => m.cat === filtro) : [];

  return (
    <section id="catalogo" className="py-16">
      <div className="container">
        <TituloSeccion
          sub={
            <>
              Filtrá por categoría o mirá todo lo que llega a tu fiesta. Tocá "Lo quiero" y armamos
              la consulta por WhatsApp.
            </>
          }
        >
          Nuestros inflables
        </TituloSeccion>

        {/* Barra de filtros por categoría */}
        <div className="mt-8 flex flex-wrap gap-2.5" role="tablist" aria-label="Filtrar por categoría">
          <ChipFiltro activo={filtro === null} onClick={() => setFiltro(null)}>
            Todos
          </ChipFiltro>
          {categorias.map((c) => (
            <ChipFiltro key={c} activo={filtro === c} onClick={() => setFiltro(c)}>
              {c}
            </ChipFiltro>
          ))}
        </div>

        {filtro === null ? (
          <>
            {/* Overview: las categorías con foto */}
            <div className="mt-7 grid grid-cols-1 gap-[26px] sm:grid-cols-2 lg:grid-cols-3">
              {productos.map((p) => (
                <ProductoCard key={p.id} producto={p} />
              ))}
            </div>

            {/* Banda juegos de salón */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-[18px] rounded-lg border-3 border-tinta bg-azul p-[26px] text-white shadow-hard">
              <div>
                <h3 className="text-[1.5rem] font-extrabold">🎱 Juegos de salón</h3>
                <p className="mt-1 max-w-[34rem] opacity-95">
                  Sumale clásicos que enganchan a chicos y grandes por igual. Combinálos con cualquier
                  inflable.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {(juegos.length ? juegos.map((j) => j.nombre) : JUEGOS_SALON).map((j) => (
                  <span key={j} className="chip">
                    {j}
                  </span>
                ))}
              </div>
              <Button size="chico" onClick={() => precargar("Juegos de salón")}>
                Consultar juegos
              </Button>
            </div>
          </>
        ) : modelosFiltrados.length ? (
          /* Vista filtrada: los modelos reales de esa categoría */
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modelosFiltrados.map((m) => (
              <ModeloCard key={m.id} modelo={m} />
            ))}
          </div>
        ) : (
          /* Categoría sin modelos cargados todavía (ej. Eventos) */
          <div className="mt-7 rounded-lg border-3 border-dashed border-tinta bg-papel p-8 text-center">
            <p className="mx-auto max-w-[30rem] text-[1.05rem]">
              Estamos sumando modelos de <strong>{filtro}</strong>. Escribinos y te contamos qué
              tenemos disponible 👇
            </p>
            <Button asChild variant="verde" size="chico" className="mt-4">
              <a
                href={linkWhatsApp(`¡Hola Astefil! Quiero consultar por ${filtro} 🎈`)}
                target="_blank"
                rel="noopener"
              >
                Consultar por WhatsApp
              </a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function ChipFiltro({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={activo}
      onClick={onClick}
      className={cn(
        "rounded-full border-3 border-tinta px-4 py-1.5 font-alt text-[.9rem] font-extrabold transition-transform active:translate-y-[2px]",
        activo
          ? "bg-amarillo shadow-hard-sm"
          : "bg-white hover:-translate-y-0.5 hover:shadow-hard-sm"
      )}
    >
      {children}
    </button>
  );
}
