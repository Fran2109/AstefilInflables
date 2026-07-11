import type { Reserva } from "@/admin/types";
import { fmtFechaLarga } from "@/admin/lib/fechas";
import { nombresInf } from "@/admin/lib/conflictos";
import { useAdmin } from "@/admin/store/AdminContext";
import { Modal } from "@/admin/components/Modal";
import { EstadoBadge } from "@/admin/components/EstadoBadge";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  iso: string | null;
  onClose: () => void;
  onAbrirReserva: (r: Reserva) => void;
  onNuevaEnDia: (iso: string) => void;
}

export function DiaDialog({ open, iso, onClose, onAbrirReserva, onNuevaEnDia }: Props) {
  const { reservas, articulos } = useAdmin();
  if (!iso) return null;

  const delDia = reservas
    .filter((r) => r.fecha === iso)
    .sort((a, b) => String(a.horaEntrega).localeCompare(String(b.horaEntrega)));

  return (
    <Modal
      open={open}
      onClose={onClose}
      titulo={fmtFechaLarga(iso)}
      footer={
        <div className="ml-auto flex gap-2.5">
          <Button variant="blanco" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="rojo" onClick={() => onNuevaEnDia(iso)}>
            + Reserva este día
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-2.5">
        {delDia.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gris p-6 text-center text-[.95rem] text-gris">
            Día libre por ahora 🌤
          </div>
        ) : (
          delDia.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-tinta bg-papel px-3 py-2.5">
              <span className="flex-1 min-w-[140px]">
                <strong>{r.cliente || "Sin nombre"}</strong>
                <small className="block text-[#5a4a41]">
                  {nombresInf(r.articuloIds, articulos).join(", ")}
                  {r.horaEntrega ? " · " + r.horaEntrega : ""}
                </small>
              </span>
              <EstadoBadge estado={r.estado} />
              <Button variant="blanco" size="mini" onClick={() => onAbrirReserva(r)}>
                Abrir
              </Button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
