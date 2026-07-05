import type { Inflable } from "@/admin/types";
import { plata } from "@/admin/lib/formato";
import { useAdmin } from "@/admin/store/AdminContext";
import { CabeceraVista } from "@/admin/views/comunes";
import { Button } from "@/components/ui/button";

export function InventarioView({ onAbrirInflable }: { onAbrirInflable: (i: Inflable | null) => void }) {
  const { inflables, reservas } = useAdmin();

  return (
    <div>
      <CabeceraVista
        titulo="Inventario"
        sub="Tus inflables y juegos, con su precio base por evento."
        accion={
          <Button variant="rojo" size="chico" onClick={() => onAbrirInflable(null)}>
            + Agregar
          </Button>
        }
      />

      <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
        {inflables.map((inf) => {
          const usos = reservas.filter(
            (r) => r.estado !== "Cancelado" && (r.inflableIds || []).includes(inf.id)
          ).length;
          return (
            <div
              key={inf.id}
              className="rounded-2xl border-3 border-tinta bg-white p-4 shadow-hard-sm"
              style={{ opacity: inf.activo ? 1 : 0.55 }}
            >
              <h4 className="flex items-center justify-between gap-2 text-[1.05rem]">
                {inf.nombre}
                <span className="h-3.5 w-3.5 flex-none rounded-full border-2 border-tinta" style={{ background: inf.color }} />
              </h4>
              <div className="font-alt text-[.78rem] font-bold text-[#5a4a41]">
                {inf.cat}
                {inf.activo ? "" : " · fuera de servicio"}
              </div>
              {inf.precio > 0 ? (
                <div className="my-2.5 font-display text-[1.4rem]">{plata(inf.precio)}</div>
              ) : (
                <div className="my-2.5 text-[.95rem] text-gris">precio sin definir</div>
              )}
              <div className="mb-2.5 font-alt text-[.78rem] font-bold text-[#5a4a41]">
                {usos} reserva{usos === 1 ? "" : "s"}
              </div>
              <Button variant="blanco" size="mini" onClick={() => onAbrirInflable(inf)}>
                Editar
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
