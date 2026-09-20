import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  titulo: string;
  children: ReactNode;
  /** Contenido del pie (botones). */
  footer?: ReactNode;
}

/**
 * Diálogo modal con el estilo del panel (cabecera amarilla, sombra dura).
 *
 * Sobre `<dialog>` + `showModal()`: es el mayor apalancamiento del admin,
 * porque `Confirm`, `ReservaDialog`, `ArticuloDialog`, `CategoriaDialog` y
 * `ZonaDialog` heredan todos de acá y ninguno atrapaba el foco — se podía
 * tabular hasta la tabla de atrás mientras el diálogo estaba abierto.
 *
 * Escape se maneja a mano además del `cancel` nativo: el panel de preview del
 * proyecto no despacha `cancel`, y no conviene tener un cierre que no se pueda
 * verificar. Llamar dos veces a `onClose` es inofensivo.
 */
export function Modal({ open, onClose, titulo, children, footer }: ModalProps) {
  const refDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = refDialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const d = refDialog.current;
    const alCancelar = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    d?.addEventListener("cancel", alCancelar);
    window.addEventListener("keydown", alTeclear);
    return () => {
      d?.removeEventListener("cancel", alCancelar);
      window.removeEventListener("keydown", alTeclear);
    };
  }, [open, onClose]);

  return (
    <dialog
      ref={refDialog}
      aria-label={titulo}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="visor max-w-none bg-transparent p-5 backdrop:bg-tinta/45"
    >
      {open && (
        <div className="mx-auto w-[560px] max-w-full overflow-hidden rounded-[20px] border-3 border-tinta bg-papel shadow-hard-xl">
          <div className="flex items-center justify-between gap-2.5 border-b-3 border-tinta bg-amarillo px-[22px] py-[18px]">
            <h2 className="text-[1.2rem] font-extrabold">{titulo}</h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="h-9 w-9 rounded-[10px] border-3 border-tinta bg-white text-base font-extrabold shadow-hard-sm transition-[transform,box-shadow] duration-100 ease-out active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              ✕
            </button>
          </div>
          <div className="max-h-[70dvh] overflow-auto px-[22px] py-5">{children}</div>
          {footer && (
            <div className="flex flex-wrap justify-between gap-2.5 border-t-3 border-tinta px-[22px] py-4">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
