import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePanelFlotante } from "@/components/ui/use-panel-flotante";

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  id?: string;
  /**
   * Id del `<label>` visible que nombra este campo.
   *
   * El disparador es un `<button>`, y un `<button>` no es un elemento
   * "labelable": un `<label for>` apuntándole NO crea la asociación, así que
   * el nombre accesible terminaba siendo el placeholder ("dd/mm/aaaa") y el
   * texto visible del campo no se anunciaba nunca. `aria-labelledby` sí
   * funciona y no duplica el texto.
   */
  ariaLabelledBy?: string;
  placeholder?: string;
  /** Clases del botón disparador (define el estilo del "campo" en cada contexto). */
  triggerClassName: string;
}

/**
 * Dropdown con estilo propio (reemplaza al `<select>` nativo, cuya lista usa
 * el estilo del sistema operativo). La lista se renderiza en un portal con
 * posición fija para que no la recorte el scroll de un contenedor/modal.
 */
export function Select({
  value,
  onChange,
  options,
  id,
  ariaLabelledBy,
  placeholder,
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const { refTrigger, refPanel, estilo } = usePanelFlotante<HTMLUListElement>({
    abierto: open,
    cerrar: () => setOpen(false),
  });

  return (
    <>
      <button
        ref={refTrigger}
        id={id}
        type="button"
        aria-labelledby={ariaLabelledBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(triggerClassName, "flex items-center justify-between gap-2 text-left")}
      >
        <span className={cn("truncate", !value && "text-gris")}>{value || placeholder || "Elegir…"}</span>
        <ChevronDown
          className={cn("h-4 w-4 flex-none transition-transform", open && "rotate-180")}
          strokeWidth={3}
        />
      </button>

      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
            <ul
              ref={refPanel}
              role="listbox"
              style={estilo}
              className="z-[101] max-h-64 overflow-auto rounded-xl border-3 border-tinta bg-papel p-1.5 shadow-hard-xl"
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
