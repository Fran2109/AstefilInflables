import { useEffect, useMemo, useState } from "react";
import type { Estado, Reserva } from "@/admin/types";
import { ESTADOS } from "@/admin/types";
import { conflictosDe } from "@/admin/lib/conflictos";
import { uid } from "@/admin/lib/formato";
import { hoyStr } from "@/admin/lib/fechas";
import { useAdmin } from "@/admin/store/AdminContext";
import { useConfirmar } from "@/admin/components/Confirm";
import { Modal } from "@/admin/components/Modal";
import { Campo, campoInputCls } from "@/admin/components/Campo";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Reserva a editar, o null para una nueva. */
  reserva: Reserva | null;
  /** Fecha precargada al crear (desde el calendario). */
  fechaSugerida?: string;
}

interface FormState {
  fecha: string;
  estado: Estado;
  cliente: string;
  telefono: string;
  horaEntrega: string;
  horaRetiro: string;
  inflableIds: string[];
  zona: string;
  direccion: string;
  precio: string;
  sena: string;
  notas: string;
}

function estadoInicial(r: Reserva | null, fechaSugerida?: string): FormState {
  return {
    fecha: r?.fecha || fechaSugerida || hoyStr(),
    estado: r?.estado || "Consulta",
    cliente: r?.cliente || "",
    telefono: r?.telefono || "",
    horaEntrega: r?.horaEntrega || "",
    horaRetiro: r?.horaRetiro || "",
    inflableIds: r?.inflableIds || [],
    zona: r?.zona || "",
    direccion: r?.direccion || "",
    precio: r?.precio != null ? String(r.precio) : "",
    sena: r?.sena != null ? String(r.sena) : "",
    notas: r?.notas || "",
  };
}

export function ReservaDialog({ open, onClose, reserva, fechaSugerida }: Props) {
  const { inflables, reservas, zonas, guardarReserva, eliminarReserva, mostrarToast } = useAdmin();
  const nombresZona = [...zonas]
    .filter((z) => z.activo)
    .sort((a, b) => a.orden - b.orden)
    .map((z) => z.nombre);
  const confirmar = useConfirmar();
  const [f, setF] = useState<FormState>(() => estadoInicial(reserva, fechaSugerida));

  useEffect(() => {
    if (open) setF(estadoInicial(reserva, fechaSugerida));
  }, [open, reserva, fechaSugerida]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const toggleInflable = (id: string) =>
    setF((prev) => ({
      ...prev,
      inflableIds: prev.inflableIds.includes(id)
        ? prev.inflableIds.filter((x) => x !== id)
        : [...prev.inflableIds, id],
    }));

  // Inflables activos + los ya seleccionados aunque estén inactivos.
  const disponibles = useMemo(
    () => inflables.filter((i) => i.activo || f.inflableIds.includes(i.id)),
    [inflables, f.inflableIds]
  );

  const confs = useMemo(
    () =>
      conflictosDe(
        { id: reserva?.id ?? "", estado: f.estado, fecha: f.fecha, inflableIds: f.inflableIds },
        reservas,
        inflables
      ),
    [reserva, f.estado, f.fecha, f.inflableIds, reservas, inflables]
  );

  const guardar = async () => {
    if (!f.fecha) return mostrarToast("Falta la fecha");
    if (!f.cliente.trim()) return mostrarToast("Poné el nombre del cliente");
    if (!f.inflableIds.length) return mostrarToast("Elegí al menos un inflable");
    if (confs.length) {
      const ok = await confirmar({
        titulo: "Conflicto de reserva",
        mensaje: (
          <>
            ⚠ Ese inflable ya está reservado ese día ({confs.map((c) => c.res.cliente).join(", ")}).
            ¿Guardar igual?
          </>
        ),
        textoConfirmar: "Guardar igual",
        peligro: true,
      });
      if (!ok) return;
    }

    const nueva: Reserva = {
      id: reserva?.id || uid(),
      fecha: f.fecha,
      estado: f.estado,
      cliente: f.cliente.trim(),
      telefono: f.telefono.trim(),
      horaEntrega: f.horaEntrega,
      horaRetiro: f.horaRetiro,
      inflableIds: f.inflableIds,
      zona: f.zona.trim(),
      direccion: f.direccion.trim(),
      precio: Number(f.precio) || 0,
      sena: Number(f.sena) || 0,
      notas: f.notas.trim(),
      creado: reserva?.creado || new Date().toISOString(),
    };
    await guardarReserva(nueva);
    onClose();
    mostrarToast("Reserva guardada ✓");
  };

  const eliminar = async () => {
    if (!reserva) return;
    const ok = await confirmar({
      titulo: "Eliminar reserva",
      mensaje: (
        <>
          ¿Eliminar la reserva de <strong>{reserva.cliente || "este cliente"}</strong>?
        </>
      ),
      textoConfirmar: "Eliminar",
      peligro: true,
    });
    if (!ok) return;
    await eliminarReserva(reserva.id);
    onClose();
    mostrarToast("Reserva eliminada");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      titulo={reserva ? "Editar reserva" : "Nueva reserva"}
      footer={
        <>
          {reserva && (
            <Button variant="peligro" size="mini" onClick={eliminar}>
              🗑 Eliminar
            </Button>
          )}
          <div className="ml-auto flex gap-2.5">
            <Button variant="blanco" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="verde" onClick={guardar}>
              Guardar
            </Button>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Campo label="Fecha *" htmlFor="r-fecha">
          <input id="r-fecha" type="date" className={campoInputCls} value={f.fecha} onChange={(e) => set("fecha", e.target.value)} />
        </Campo>
        <Campo label="Estado" htmlFor="r-estado">
          <select id="r-estado" className={campoInputCls} value={f.estado} onChange={(e) => set("estado", e.target.value as Estado)}>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Cliente *" htmlFor="r-cliente">
          <input id="r-cliente" placeholder="Nombre" className={campoInputCls} value={f.cliente} onChange={(e) => set("cliente", e.target.value)} />
        </Campo>
        <Campo label="Teléfono" htmlFor="r-tel">
          <input id="r-tel" inputMode="tel" placeholder="11 1234-5678" className={campoInputCls} value={f.telefono} onChange={(e) => set("telefono", e.target.value)} />
        </Campo>
        <Campo label="Hora entrega" htmlFor="r-hent">
          <input id="r-hent" type="time" className={campoInputCls} value={f.horaEntrega} onChange={(e) => set("horaEntrega", e.target.value)} />
        </Campo>
        <Campo label="Hora retiro" htmlFor="r-hret">
          <input id="r-hret" type="time" className={campoInputCls} value={f.horaRetiro} onChange={(e) => set("horaRetiro", e.target.value)} />
        </Campo>

        <Campo label="Inflables / juegos *" ancho>
          <div className="flex flex-wrap gap-2">
            {disponibles.map((inf) => {
              const checked = f.inflableIds.includes(inf.id);
              return (
                <label
                  key={inf.id}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-tinta px-3 py-1.5 font-alt text-[.85rem] font-bold ${
                    checked ? "bg-amarillo shadow-hard-sm" : "bg-white"
                  }`}
                >
                  <input type="checkbox" className="h-4 w-4 accent-rojo" checked={checked} onChange={() => toggleInflable(inf.id)} />
                  {inf.nombre}
                </label>
              );
            })}
          </div>
          {confs.length > 0 && (
            <div className="font-alt text-[.78rem] font-semibold text-rojo">
              ⚠ Ese día ya está reservado:{" "}
              {confs.map((c) => c.inflables.join("/") + " (" + (c.res.cliente || "otra reserva") + ")").join(" · ")}
            </div>
          )}
        </Campo>

        <Campo label="Zona / localidad" htmlFor="r-zona">
          <input id="r-zona" list="zonas-list" placeholder="Grand Bourg" className={campoInputCls} value={f.zona} onChange={(e) => set("zona", e.target.value)} />
          <datalist id="zonas-list">
            {nombresZona.map((z) => (
              <option key={z} value={z} />
            ))}
          </datalist>
        </Campo>
        <Campo label="Dirección" htmlFor="r-dir">
          <input id="r-dir" placeholder="Calle 123" className={campoInputCls} value={f.direccion} onChange={(e) => set("direccion", e.target.value)} />
        </Campo>
        <Campo label="Precio total ($)" htmlFor="r-precio">
          <input id="r-precio" type="number" min={0} step={500} className={campoInputCls} value={f.precio} onChange={(e) => set("precio", e.target.value)} />
        </Campo>
        <Campo label="Seña ($)" htmlFor="r-sena">
          <input id="r-sena" type="number" min={0} step={500} className={campoInputCls} value={f.sena} onChange={(e) => set("sena", e.target.value)} />
        </Campo>
        <Campo label="Notas" htmlFor="r-notas" ancho>
          <textarea id="r-notas" placeholder="Salón techado, hay enchufe cerca…" className={`${campoInputCls} min-h-16 resize-y`} value={f.notas} onChange={(e) => set("notas", e.target.value)} />
        </Campo>
      </div>
    </Modal>
  );
}
