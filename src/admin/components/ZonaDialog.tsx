import { useEffect, useState } from "react";
import type { Zona } from "@/admin/types";
import { useAdmin } from "@/admin/store/AdminContext";
import { Modal } from "@/admin/components/Modal";
import { Campo, campoInputCls } from "@/admin/components/Campo";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  zona: Zona | null;
}

/** Alta/edición de una zona (solo el nombre; el orden se maneja con las flechas). */
export function ZonaDialog({ open, onClose, zona }: Props) {
  const { guardarZona } = useAdmin();
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    if (!open) return;
    setNombre(zona?.nombre || "");
  }, [open, zona]);

  const guardar = async () => {
    await guardarZona(nombre, zona?.id);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      titulo={zona ? "Editar zona" : "Nueva zona"}
      footer={
        <div className="ml-auto flex gap-2.5">
          <Button variant="blanco" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="verde" onClick={guardar}>
            {zona ? "Guardar" : "Crear"}
          </Button>
        </div>
      }
    >
      <Campo label="Nombre *" htmlFor="z-nombre" ancho>
        <input
          id="z-nombre"
          placeholder="Ej: Ingeniero Maschwitz"
          className={campoInputCls}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && guardar()}
          autoFocus
        />
      </Campo>
      <p className="mt-2 text-[.82rem] text-[#5a4a41]">
        Aparece en "¿Llegamos a tu zona?" de la web y como sugerencia al cargar una reserva.
      </p>
    </Modal>
  );
}
