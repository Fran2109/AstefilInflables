import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  id?: string;
  placeholder?: string;
  /** Clases del botón disparador (define el estilo del "campo" en cada contexto). */
  triggerClassName: string;
}

/**
 * Dropdown con estilo propio (reemplaza al `<select>` nativo, cuya lista usa
 * el estilo del sistema operativo). La lista se renderiza en un portal con
 * posición fija para que no la recorte el scroll de un contenedor/modal.
 */
export function Select({ value, onChange, options, id, placeholder, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);

  const toggle = () => {
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const cerrar = (e: Event) => {
      // Scrollear la lista misma (para ver más opciones) no debe cerrarla.
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // Al scrollear la página/resize se cierra para no dejar la lista descolocada.
    window.addEventListener("scroll", cerrar, true);
    window.addEventListener("resize", cerrar);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", cerrar, true);
      window.removeEventListener("resize", cerrar);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        className={cn(triggerClassName, "flex items-center justify-between gap-2 text-left")}
      >
        <span className={cn("truncate", !value && "text-gris")}>{value || placeholder || "Elegir…"}</span>
        <ChevronDown
          className={cn("h-4 w-4 flex-none transition-transform", open && "rotate-180")}
          strokeWidth={3}
        />
      </button>

      {open &&
        rect &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
            <ul
              ref={panelRef}
              role="listbox"
              style={{ position: "fixed", left: rect.left, top: rect.bottom + 6, width: rect.width }}
              className="z-[91] max-h-64 overflow-auto rounded-xl border-3 border-tinta bg-papel p-1.5 shadow-hard-xl"
            >
              {options.map((o) => (
                <li key={o}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={o === value}
                    onClick={() => {
                      onChange(o);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center rounded-lg px-3 py-2 text-left font-body text-[.95rem] hover:bg-amarillo",
                      o === value && "bg-amarillo font-extrabold"
                    )}
                  >
                    {o}
                  </button>
                </li>
              ))}
            </ul>
          </>,
          document.body
        )}
    </>
  );
}
