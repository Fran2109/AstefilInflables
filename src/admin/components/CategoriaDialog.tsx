import { useEffect, useState } from "react";
import type { Categoria, Requisito } from "@/admin/types";
import { useAdmin } from "@/admin/store/AdminContext";
import { Modal } from "@/admin/components/Modal";
import { Campo, campoInputCls } from "@/admin/components/Campo";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  categoria: Categoria | null;
}

const OPCIONES_REQ = ["Obligatorio", "Opcional", "No aplica"];
const LABEL_DE_REQ: Record<Requisito, string> = {
  obligatorio: "Obligatorio",
  opcional: "Opcional",
  no_aplica: "No aplica",
};
const REQ_DE_LABEL: Record<string, Requisito> = {
  Obligatorio: "obligatorio",
  Opcional: "opcional",
  "No aplica": "no_aplica",
};

/**
 * Alta/edición de una categoría: nombre + qué atributos de sus artículos son
 * obligatorios/opcionales/no aplican (el orden se maneja con las flechas).
 */
export function CategoriaDialog({ open, onClose, categoria }: Props) {
  const { guardarCategoria } = useAdmin();
  const [nombre, setNombre] = useState("");
  const [descripcionReq, setDescripcionReq] = useState("Opcional");
  const [medidasReq, setMedidasReq] = useState("Opcional");
  const [medidasTurbinaReq, setMedidasTurbinaReq] = useState("Opcional");
  const [fotosReq, setFotosReq] = useState("Opcional");

  useEffect(() => {
    if (!open) return;
    setNombre(categoria?.nombre || "");
    setDescripcionReq(LABEL_DE_REQ[categoria?.descripcionReq ?? "opcional"]);
    setMedidasReq(LABEL_DE_REQ[categoria?.medidasReq ?? "opcional"]);
    setMedidasTurbinaReq(LABEL_DE_REQ[categoria?.medidasTurbinaReq ?? "opcional"]);
    setFotosReq(LABEL_DE_REQ[categoria?.fotosReq ?? "opcional"]);
  }, [open, categoria]);

  const guardar = async () => {
    await guardarCategoria(
      {
        nombre,
        descripcionReq: REQ_DE_LABEL[descripcionReq],
        medidasReq: REQ_DE_LABEL[medidasReq],
        medidasTurbinaReq: REQ_DE_LABEL[medidasTurbinaReq],
        fotosReq: REQ_DE_LABEL[fotosReq],
      },
      categoria?.id
    );
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      titulo={categoria ? "Editar categoría" : "Nueva categoría"}
      footer={
        <div className="ml-auto flex gap-2.5">
          <Button variant="blanco" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="verde" onClick={guardar}>
            {categoria ? "Guardar" : "Crear"}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Campo label="Nombre *" htmlFor="c-nombre" ancho>
          <input
            id="c-nombre"
            placeholder="Ej: Temáticos"
            className={campoInputCls}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && guardar()}
            autoFocus
          />
        </Campo>
        {categoria && (
          <p className="-mt-2 text-[.82rem] text-[#5a4a41] sm:col-span-2">
            Si la renombrás, los artículos que la usan se reetiquetan solos.
          </p>
        )}

        <Campo label="Descripción" htmlFor="c-desc-req">
          <Select id="c-desc-req" value={descripcionReq} onChange={setDescripcionReq} options={OPCIONES_REQ} triggerClassName={campoInputCls} />
        </Campo>
        <Campo label="Fotos" htmlFor="c-fotos-req">
          <Select id="c-fotos-req" value={fotosReq} onChange={setFotosReq} options={OPCIONES_REQ} triggerClassName={campoInputCls} />
        </Campo>
        <Campo label="Medidas (ancho × largo × alto)" htmlFor="c-medidas-req">
          <Select id="c-medidas-req" value={medidasReq} onChange={setMedidasReq} options={OPCIONES_REQ} triggerClassName={campoInputCls} />
        </Campo>
        <Campo label="Medidas con turbina" htmlFor="c-medidas-turbina-req">
          <Select id="c-medidas-turbina-req" value={medidasTurbinaReq} onChange={setMedidasTurbinaReq} options={OPCIONES_REQ} triggerClassName={campoInputCls} />
        </Campo>
        <p className="text-[.78rem] text-[#5a4a41] sm:col-span-2">
          Define qué le pide el formulario del inventario a los artículos de esta categoría. "No
          aplica" oculta el campo (ej: un gazebo no usa turbina).
        </p>
      </div>
    </Modal>
  );
}
