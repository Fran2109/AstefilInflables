import { useEffect, useState } from "react";
import type { Inflable } from "@/admin/types";
import { CATEGORIAS } from "@/admin/lib/seed";
import { useAdmin } from "@/admin/store/AdminContext";
import { Modal } from "@/admin/components/Modal";
import { Campo, campoInputCls } from "@/admin/components/Campo";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  inflable: Inflable | null;
}

export function InflableDialog({ open, onClose, inflable }: Props) {
  const { reservas, guardarInflable, eliminarInflable, mostrarToast } = useAdmin();
  const [nombre, setNombre] = useState("");
  const [cat, setCat] = useState(CATEGORIAS[0]);
  const [precio, setPrecio] = useState("");
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (!open) return;
    setNombre(inflable?.nombre || "");
    setCat(inflable?.cat || CATEGORIAS[0]);
    setPrecio(inflable?.precio ? String(inflable.precio) : "");
    setActivo(inflable ? inflable.activo : true);
  }, [open, inflable]);

  const guardar = async () => {
    if (!nombre.trim()) return mostrarToast("Poné un nombre");
    await guardarInflable(
      { nombre: nombre.trim(), cat, precio: Number(precio) || 0, activo },
      inflable?.id
    );
    onClose();
    mostrarToast("Inventario guardado ✓");
  };

  const eliminar = async () => {
    if (!inflable) return;
    const usos = reservas.filter((r) => (r.inflableIds || []).includes(inflable.id)).length;
    if (
      !window.confirm(
        '¿Eliminar "' + inflable.nombre + '"?' +
          (usos ? " Está en " + usos + " reserva(s); quedarán sin ese ítem." : "")
      )
    )
      return;
    await eliminarInflable(inflable.id);
    onClose();
    mostrarToast("Eliminado");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      titulo={inflable ? "Editar inflable" : "Agregar al inventario"}
      footer={
        <>
          {inflable && (
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
        <Campo label="Nombre *" htmlFor="i-nombre" ancho>
          <input id="i-nombre" placeholder="Castillo arcoíris" className={campoInputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Campo>
        <Campo label="Categoría" htmlFor="i-cat">
          <select id="i-cat" className={campoInputCls} value={cat} onChange={(e) => setCat(e.target.value)}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Campo>
        <Campo label="Precio base ($)" htmlFor="i-precio">
          <input id="i-precio" type="number" min={0} step={500} placeholder="0 = sin definir" className={campoInputCls} value={precio} onChange={(e) => setPrecio(e.target.value)} />
        </Campo>
        <Campo label="Disponibilidad" ancho>
          <label className="inline-flex cursor-pointer items-center gap-2 font-body text-[.95rem]">
            <input type="checkbox" className="h-[18px] w-[18px] accent-verde" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
            Disponible para alquilar
          </label>
        </Campo>
      </div>
    </Modal>
  );
}
