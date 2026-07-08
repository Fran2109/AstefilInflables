import { ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import type { Categoria } from "@/admin/types";
import { useAdmin } from "@/admin/store/AdminContext";
import { useConfirmar } from "@/admin/components/Confirm";
import { CabeceraVista, Vacio } from "@/admin/views/comunes";
import { Button } from "@/components/ui/button";

export function CategoriasView({
  onAbrirCategoria,
}: {
  onAbrirCategoria: (c: Categoria | null) => void;
}) {
  const { categorias, inflables, toggleCategoria, eliminarCategoria, moverCategoria } = useAdmin();
  const confirmar = useConfirmar();
  const orden = [...categorias].sort((a, b) => a.orden - b.orden);

  const usosDe = (nombre: string) =>
    inflables.filter((i) => i.cat === nombre).length;

  return (
    <div>
      <CabeceraVista
        titulo="Categorías"
        sub="Agrupan tus inflables y ordenan los filtros del catálogo en la web."
        accion={
          <Button variant="rojo" size="chico" onClick={() => onAbrirCategoria(null)}>
            + Agregar
          </Button>
        }
      />

      {orden.length === 0 ? (
        <Vacio>Todavía no hay categorías. Creá la primera con "+ Agregar".</Vacio>
      ) : (
        <div className="flex flex-col gap-3">
          {orden.map((c, i) => {
            const usos = usosDe(c.nombre);
            return (
              <div
                key={c.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border-3 border-tinta bg-white p-3.5 shadow-hard-sm"
                style={{ opacity: c.activo ? 1 : 0.55 }}
              >
                {/* Reordenar */}
                <div className="flex flex-col">
                  <button
                    aria-label="Subir"
                    disabled={i === 0}
                    onClick={() => moverCategoria(c.id, -1)}
                    className="rounded-md border-2 border-tinta bg-papel px-1.5 py-0.5 disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" strokeWidth={3} />
                  </button>
                  <button
                    aria-label="Bajar"
                    disabled={i === orden.length - 1}
                    onClick={() => moverCategoria(c.id, 1)}
                    className="mt-1 rounded-md border-2 border-tinta bg-papel px-1.5 py-0.5 disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" strokeWidth={3} />
                  </button>
                </div>

                {/* Nombre + usos */}
                <div className="min-w-[9rem] flex-1">
                  <div className="text-[1.1rem] font-extrabold">{c.nombre}</div>
                  <div className="font-alt text-[.78rem] font-bold text-[#5a4a41]">
                    {usos} inflable{usos === 1 ? "" : "s"}
                    {c.activo ? "" : " · oculta"}
                  </div>
                </div>

                {/* Activo */}
                <label className="inline-flex cursor-pointer items-center gap-2 font-body text-[.9rem]">
                  <input
                    type="checkbox"
                    className="h-[18px] w-[18px] accent-verde"
                    checked={c.activo}
                    onChange={() => toggleCategoria(c.id)}
                  />
                  Activa
                </label>

                {/* Acciones */}
                <div className="flex gap-2">
                  <Button variant="blanco" size="mini" onClick={() => onAbrirCategoria(c)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" strokeWidth={3} /> Editar
                  </Button>
                  <Button
                    variant="peligro"
                    size="mini"
                    onClick={async () => {
                      if (usos > 0) {
                        eliminarCategoria(c.id); // muestra el aviso de bloqueo
                        return;
                      }
                      const ok = await confirmar({
                        titulo: "Eliminar categoría",
                        mensaje: (
                          <>
                            ¿Eliminar la categoría <strong>{c.nombre}</strong>? Esta acción no se
                            puede deshacer.
                          </>
                        ),
                        textoConfirmar: "Eliminar",
                        peligro: true,
                      });
                      if (ok) eliminarCategoria(c.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={3} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
