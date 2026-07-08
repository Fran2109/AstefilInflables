import { useEffect, useState } from "react";
import type { Categoria } from "@/admin/types";
import { useAdmin } from "@/admin/store/AdminContext";
import { Modal } from "@/admin/components/Modal";
import { Campo, campoInputCls } from "@/admin/components/Campo";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  categoria: Categoria | null;
}

/** Alta/edición de una categoría (solo el nombre; el orden se maneja con las flechas). */
export function CategoriaDialog({ open, onClose, categoria }: Props) {
  const { guardarCategoria } = useAdmin();
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    if (!open) return;
    setNombre(categoria?.nombre || "");
  }, [open, categoria]);

  const guardar = async () => {
    await guardarCategoria(nombre, categoria?.id);
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
        <p className="mt-2 text-[.82rem] text-[#5a4a41]">
          Si la renombrás, los inflables que la usan se reetiquetan solos.
        </p>
      )}
    </Modal>
  );
}
