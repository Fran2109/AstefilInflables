import { useMemo, useState } from "react";
import type { CategoriaConModelos, ModeloPublico } from "@/types/catalogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TituloSeccion } from "@/components/landing/TituloSeccion";
import { CategoriaCard } from "@/components/landing/CategoriaCard";
import { ModeloCard } from "@/components/landing/ModeloCard";
import { Esqueleto, EsqueletoGrilla } from "@/components/landing/Esqueleto";
import { linkWhatsApp } from "@/lib/whatsapp";
import { useCatalogo } from "@/context/CatalogoContext";

export function Catalogo() {
  const { modelos, categorias, cargando } = useCatalogo();
  // null = "Todos" (overview de categorías con fotos).
  const [filtro, setFiltro] = useState<string | null>(null);

  const modelosFiltrados = filtro ? modelos.filter((m) => m.cat === filtro) : [];
  const conModelos = useMemo(() => agrupar(categorias, modelos), [categorias, modelos]);

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
        <div className="mt-8 flex flex-wrap gap-2.5" role="group" aria-label="Filtrar por categoría">
          <ChipFiltro activo={filtro === null} onClick={() => setFiltro(null)}>
            Todos
          </ChipFiltro>
          {cargando
            ? Array.from({ length: 4 }, (_, i) => (
                <Esqueleto key={i} className="h-[34px] w-[104px] !rounded-full" />
              ))
            : categorias.map((c) => (
                <ChipFiltro key={c} activo={filtro === c} onClick={() => setFiltro(c)}>
                  {c}
                </ChipFiltro>
              ))}
        </div>

        {/* Filtrar reemplaza la grilla entera. Sin esto, para quien usa lector
            de pantalla el botón se marca como presionado y nada más: no hay
            forma de saber qué apareció abajo. */}
        <p aria-live="polite" className="sr-only">
          {cargando
            ? "Cargando el catálogo"
            : filtro === null
              ? `${conModelos.length} categorías en el catálogo`
              : `${modelosFiltrados.length} modelos de ${filtro}`}
        </p>

        {cargando ? (
          <EsqueletoGrilla />
        ) : filtro === null ? (
          /* Overview: una card por categoría con modelos cargados */
          conModelos.length ? (
            <div className="mt-7 grid grid-cols-1 gap-[26px] sm:grid-cols-2 lg:grid-cols-3">
              {conModelos.map((c) => (
                <CategoriaCard key={c.nombre} categoria={c} />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-lg border-3 border-dashed border-tinta bg-papel p-8 text-center">
              <p className="mx-auto max-w-[30rem] text-[1.05rem]">
                Estamos armando el catálogo. Escribinos y te contamos qué tenemos disponible 👇
              </p>
              <Button asChild variant="verde" size="chico" className="mt-4">
                <a
                  href={linkWhatsApp("¡Hola Astefil! Quiero consultar por los inflables 🎈")}
                  target="_blank"
                  rel="noopener"
                >
                  Consultar por WhatsApp
                </a>
              </Button>
            </div>
          )
        ) : modelosFiltrados.length ? (
          /* Vista filtrada: los modelos reales de esa categoría */
          <div
            /* `key={filtro}` fuerza el remonte al cambiar de categoría: sin
               esto React reusa las cards y la cascada solo correría la primera
               vez. Es el único movimiento coreografiado del sitio. */
            key={filtro}
            className="grilla-modelos mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
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
      aria-pressed={activo}
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

/**
 * Arma el overview "Todos" desde el inventario: una card por categoría que
 * tenga al menos un modelo cargado, en el orden del ABM de Categorías.
 *
 * Una categoría sin modelos no genera card a propósito — sería una card que
 * lleva a una lista vacía. Su chip de filtro sigue estando, y ahí la vista
 * filtrada explica que todavía no hay modelos de ese tipo.
 */
function agrupar(categorias: string[], modelos: ModeloPublico[]): CategoriaConModelos[] {
  return categorias
    .map((nombre) => {
      const suyos = modelos.filter((m) => m.cat === nombre);
      return {
        nombre,
        modelos: suyos,
        fotos: suyos.flatMap((m) => m.fotos ?? []),
      };
    })
    .filter((c) => c.modelos.length > 0);
}
