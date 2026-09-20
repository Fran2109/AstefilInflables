import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePanelFlotante } from "@/components/ui/use-panel-flotante";

interface Props {
  /** 'HH:MM', o "" si no hay horario elegido. */
  value: string;
  onChange: (v: string) => void;
  id?: string;
  ariaLabel?: string;
  placeholder?: string;
  /** Clases del botón disparador (define el estilo del "campo" en cada contexto). */
  triggerClassName: string;
}

const HORAS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTOS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

/**
 * Selector de horario con estilo propio (reemplaza al `<input type="time">`,
 * cuyo picker emergente usa el widget nativo del sistema operativo y no se
 * puede restylear). Mismo mecanismo de portal que `Select`/`DatePicker`.
 */
export function TimePicker({ value, onChange, id, ariaLabel, placeholder, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const { refTrigger, refPanel, estilo } = usePanelFlotante({
    abierto: open,
    cerrar: () => setOpen(false),
    ancho: 190,
  });
  const horaRef = useRef<HTMLButtonElement>(null);
  const minRef = useRef<HTMLButtonElement>(null);

  const [hora, min] = value ? value.split(":") : ["", ""];


  const elegirHora = (h: string) => onChange(h + ":" + (min || "00"));
  const elegirMin = (m: string) => onChange((hora || "00") + ":" + m);

  // Al abrir, centrar la hora y el minuto ya elegidos.
  useEffect(() => {
    if (!open) return;
    horaRef.current?.scrollIntoView({ block: "center" });
    minRef.current?.scrollIntoView({ block: "center" });
  }, [open]);

  return (
    <>
      <button
        ref={refTrigger}
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(triggerClassName, "flex items-center justify-between gap-2 text-left")}
      >
        <span className={cn("truncate tabular-nums", !value && "text-gris")}>
          {value || placeholder || "--:--"}
        </span>
        <Clock className="h-4 w-4 flex-none" strokeWidth={3} />
      </button>

      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
            <div
              ref={refPanel}
              role="dialog"
              aria-label="Elegir horario"
              style={estilo}
              className="z-[101] w-[190px] rounded-xl border-3 border-tinta bg-papel p-3 shadow-hard-xl"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="max-h-[190px] overflow-y-auto rounded-lg border-2 border-tinta bg-white">
                  {HORAS.map((h) => (
                    <button
                      key={h}
                      ref={h === hora ? horaRef : undefined}
                      type="button"
                      onClick={() => elegirHora(h)}
                      aria-selected={h === hora}
                      className={cn(
                        "block w-full py-1.5 text-center font-body text-[.9rem] tabular-nums hover:bg-cielo",
                        h === hora && "bg-amarillo font-extrabold"
                      )}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                <div className="max-h-[190px] overflow-y-auto rounded-lg border-2 border-tinta bg-white">
                  {MINUTOS.map((m) => (
                    <button
                      key={m}
                      ref={m === min ? minRef : undefined}
                      type="button"
                      onClick={() => elegirMin(m)}
                      aria-selected={m === min}
                      className={cn(
                        "block w-full py-1.5 text-center font-body text-[.9rem] tabular-nums hover:bg-cielo",
                        m === min && "bg-amarillo font-extrabold"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t-2 border-dashed border-[#e5d9cd] pt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="font-alt text-[.8rem] font-extrabold text-rojo hover:underline"
                >
                  Borrar
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="font-alt text-[.8rem] font-extrabold text-azul hover:underline"
                >
                  Listo
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
