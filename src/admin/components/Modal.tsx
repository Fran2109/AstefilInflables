import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  titulo: string;
  children: ReactNode;
  /** Contenido del pie (botones). */
  footer?: ReactNode;
}

/** Diálogo modal con el estilo del panel (cabecera amarilla, sombra dura). */
export function Modal({ open, onClose, titulo, children, footer }: ModalProps) {
  // Cerrar con Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-tinta/45 p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[560px] max-w-full overflow-hidden rounded-[20px] border-3 border-tinta bg-papel shadow-hard-xl">
        <div className="flex items-center justify-between gap-2.5 border-b-3 border-tinta bg-amarillo px-[22px] py-[18px]">
          <h3 className="text-[1.2rem] font-extrabold">{titulo}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="h-9 w-9 rounded-[10px] border-3 border-tinta bg-white text-base font-extrabold shadow-hard-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto px-[22px] py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-between gap-2.5 border-t-3 border-tinta px-[22px] py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
