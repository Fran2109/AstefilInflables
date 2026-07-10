import { ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import type { Zona } from "@/admin/types";
import { useAdmin } from "@/admin/store/AdminContext";
import { useConfirmar } from "@/admin/components/Confirm";
import { CabeceraVista, Vacio } from "@/admin/views/comunes";
import { Button } from "@/components/ui/button";

export function ZonasView({ onAbrirZona }: { onAbrirZona: (z: Zona | null) => void }) {
  const { zonas, reservas, toggleZona, eliminarZona, moverZona } = useAdmin();
  const confirmar = useConfirmar();
  const orden = [...zonas].sort((a, b) => a.orden - b.orden);

  // Zona es texto libre en la reserva (no FK): esto es solo informativo, no bloquea el borrado.
  const usosDe = (nombre: string) =>
    reservas.filter((r) => r.zona.toLowerCase() === nombre.toLowerCase()).length;

  return (
    <div>
      <CabeceraVista
        titulo="Zonas"
        sub='Localidades que mostramos en "¿Llegamos a tu zona?" y sugerimos al cargar una reserva.'
        accion={
          <Button variant="rojo" size="chico" onClick={() => onAbrirZona(null)}>
            + Agregar
          </Button>
        }
      />

      {orden.length === 0 ? (
        <Vacio>Todavía no hay zonas. Creá la primera con "+ Agregar".</Vacio>
      ) : (
        <div className="flex flex-col gap-3">
          {orden.map((z, i) => {
            const usos = usosDe(z.nombre);
            return (
              <div
                key={z.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border-3 border-tinta bg-white p-3.5 shadow-hard-sm"
                style={{ opacity: z.activo ? 1 : 0.55 }}
              >
                {/* Reordenar */}
                <div className="flex flex-col">
                  <button
                    aria-label="Subir"
                    disabled={i === 0}
                    onClick={() => moverZona(z.id, -1)}
                    className="rounded-md border-2 border-tinta bg-papel px-1.5 py-0.5 disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" strokeWidth={3} />
                  </button>
                  <button
                    aria-label="Bajar"
                    disabled={i === orden.length - 1}
                    onClick={() => moverZona(z.id, 1)}
                    className="mt-1 rounded-md border-2 border-tinta bg-papel px-1.5 py-0.5 disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" strokeWidth={3} />
                  </button>
                </div>

                {/* Nombre + usos */}
                <div className="min-w-[9rem] flex-1">
                  <div className="text-[1.1rem] font-extrabold">{z.nombre}</div>
                  <div className="font-alt text-[.78rem] font-bold text-[#5a4a41]">
                    {usos} reserva{usos === 1 ? "" : "s"}
                    {z.activo ? "" : " · oculta"}
                  </div>
                </div>

                {/* Activo */}
                <label className="inline-flex cursor-pointer items-center gap-2 font-body text-[.9rem]">
                  <input
                    type="checkbox"
                    className="h-[18px] w-[18px] accent-verde"
                    checked={z.activo}
                    onChange={async () => {
                      const ok = await confirmar({
                        titulo: z.activo ? "Desactivar zona" : "Activar zona",
                        mensaje: z.activo ? (
                          <>
                            ¿Desactivar <strong>{z.nombre}</strong>? Deja de aparecer en "¿Llegamos a
                            tu zona?" de la web.
                          </>
                        ) : (
                          <>
                            ¿Activar <strong>{z.nombre}</strong>? Vuelve a aparecer en la web.
                          </>
                        ),
                        textoConfirmar: z.activo ? "Desactivar" : "Activar",
                        peligro: z.activo,
                      });
                      if (ok) toggleZona(z.id);
                    }}
                  />
                  Activa
                </label>

                {/* Acciones */}
                <div className="flex gap-2">
                  <Button variant="blanco" size="mini" onClick={() => onAbrirZona(z)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" strokeWidth={3} /> Editar
                  </Button>
                  <Button
                    variant="peligro"
                    size="mini"
                    onClick={async () => {
                      const ok = await confirmar({
                        titulo: "Eliminar zona",
                        mensaje: (
                          <>
                            ¿Eliminar <strong>{z.nombre}</strong>?
                            {usos
                              ? ` Hay ${usos} reserva(s) que la mencionan; quedan como estaban, solo deja de sugerirse.`
                              : ""}
                          </>
                        ),
                        textoConfirmar: "Eliminar",
                        peligro: true,
                      });
                      if (ok) eliminarZona(z.id);
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
