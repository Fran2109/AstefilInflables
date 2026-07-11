import type { Articulo } from "@/admin/types";
import { plata } from "@/admin/lib/formato";
import { useAdmin } from "@/admin/store/AdminContext";
import { CabeceraVista, Vacio } from "@/admin/views/comunes";
import { Button } from "@/components/ui/button";

export function InventarioView({ onAbrirArticulo }: { onAbrirArticulo: (a: Articulo | null) => void }) {
  const { articulos, reservas, esAdmin } = useAdmin();

  return (
    <div>
      <CabeceraVista
        titulo="Inventario"
        sub="Tus artículos y juegos, con su precio base por evento."
        accion={
          esAdmin ? (
            <Button variant="rojo" size="chico" onClick={() => onAbrirArticulo(null)}>
              + Agregar
            </Button>
          ) : undefined
        }
      />

      {articulos.length === 0 ? (
        <Vacio>
          {esAdmin
            ? 'Todavía no hay artículos cargados. Creá el primero con "+ Agregar".'
            : "Todavía no hay artículos cargados."}
        </Vacio>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          {articulos.map((art) => {
            const usos = reservas.filter(
              (r) => r.estado !== "Cancelado" && (r.articuloIds || []).includes(art.id)
            ).length;
            return (
              <div
                key={art.id}
                className="rounded-2xl border-3 border-tinta bg-white p-4 shadow-hard-sm"
                style={{ opacity: art.activo ? 1 : 0.55 }}
              >
                <h4 className="flex items-center justify-between gap-2 text-[1.05rem]">
                  {art.nombre}
                  <span className="h-3.5 w-3.5 flex-none rounded-full border-2 border-tinta" style={{ background: art.color }} />
                </h4>
                <div className="font-alt text-[.78rem] font-bold text-[#5a4a41]">
                  {art.cat}
                  {art.activo ? "" : " · fuera de servicio"}
                </div>
                {art.ancho && art.largo ? (
                  <div className="mt-1 font-alt text-[.78rem] font-bold text-[#5a4a41]">
                    📏 {art.ancho} × {art.largo}
                    {art.alto ? " × " + art.alto : ""} m
                  </div>
                ) : null}
                {art.precio > 0 ? (
                  <div className="my-2.5 font-display text-[1.4rem]">{plata(art.precio)}</div>
                ) : (
                  <div className="my-2.5 text-[.95rem] text-gris">precio sin definir</div>
                )}
                <div className="mb-2.5 font-alt text-[.78rem] font-bold text-[#5a4a41]">
                  {usos} reserva{usos === 1 ? "" : "s"}
                </div>
                {esAdmin && (
                  <Button variant="blanco" size="mini" onClick={() => onAbrirArticulo(art)}>
                    Editar
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
