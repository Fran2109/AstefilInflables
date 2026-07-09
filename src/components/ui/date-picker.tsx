import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  /** 'YYYY-MM-DD', o "" si no hay fecha elegida. */
  value: string;
  onChange: (v: string) => void;
  id?: string;
  placeholder?: string;
  /** Clases del botón disparador (define el estilo del "campo" en cada contexto). */
  triggerClassName: string;
}

const DIAS = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/** Date local (sin componente horaria) → 'YYYY-MM-DD', sin corrimiento de UTC. */
function aISO(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

/** 'YYYY-MM-DD' → Date local a medianoche (evita el corrimiento de `new Date(iso)`, que es UTC). */
function deISO(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatearCorta(iso: string): string {
  const d = deISO(iso);
  if (!d) return "";
  return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
}

/** Los 42 días (6 semanas) que se muestran para el mes de `vista`, arrancando el domingo previo. */
function grilla(vista: Date): Date[] {
  const primero = new Date(vista.getFullYear(), vista.getMonth(), 1);
  const inicio = new Date(primero);
  inicio.setDate(primero.getDate() - primero.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    return d;
  });
}

/**
 * Selector de fecha con estilo propio (reemplaza al `<input type="date">`, cuyo
 * calendario emergente usa el widget nativo del sistema operativo y no se puede
 * restylear). Mismo mecanismo de portal que `Select`.
 */
export function DatePicker({ value, onChange, id, placeholder, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [vista, setVista] = useState(() => deISO(value) ?? new Date());
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setVista(deISO(value) ?? new Date());
    setOpen((o) => !o);
  };

  const elegir = (d: Date) => {
    onChange(aISO(d));
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const cerrar = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("scroll", cerrar, true);
    window.addEventListener("resize", cerrar);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", cerrar, true);
      window.removeEventListener("resize", cerrar);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hoy = new Date();
  const hoyISO = aISO(hoy);

  return (
    <>
      <button
        ref={btnRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
        className={cn(triggerClassName, "flex items-center justify-between gap-2 text-left")}
      >
        <span className={cn("truncate", !value && "text-gris")}>
          {value ? formatearCorta(value) : placeholder || "dd/mm/aaaa"}
        </span>
        <Calendar className="h-4 w-4 flex-none" strokeWidth={3} />
      </button>

      {open &&
        rect &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Elegir fecha"
              style={{ position: "fixed", left: rect.left, top: rect.bottom + 6 }}
              className="z-[91] w-[300px] rounded-xl border-3 border-tinta bg-papel p-3.5 shadow-hard-xl"
            >
              {/* Header: mes/año + navegación */}
              <div className="mb-2.5 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Mes anterior"
                  onClick={() => setVista((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-tinta bg-white hover:bg-cielo"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={3} />
                </button>
                <span className="font-alt text-[.95rem] font-extrabold">
                  {MESES[vista.getMonth()]} {vista.getFullYear()}
                </span>
                <button
                  type="button"
                  aria-label="Mes siguiente"
                  onClick={() => setVista((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-tinta bg-white hover:bg-cielo"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={3} />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 text-center font-alt text-[.72rem] font-bold text-[#5a4a41]">
                {DIAS.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              {/* Grilla de días */}
              <div className="mt-1 grid grid-cols-7 gap-1">
                {grilla(vista).map((d) => {
                  const iso = aISO(d);
                  const delMes = d.getMonth() === vista.getMonth();
                  const esHoy = iso === hoyISO;
                  const esElegido = iso === value;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => elegir(d)}
                      aria-label={iso}
                      aria-current={esHoy ? "date" : undefined}
                      aria-selected={esElegido}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg text-[.85rem] font-body hover:bg-cielo",
                        !delMes && "text-gris opacity-50",
                        esHoy && !esElegido && "border-2 border-azul font-extrabold",
                        esElegido && "border-2 border-tinta bg-amarillo font-extrabold"
                      )}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Acciones */}
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
                  onClick={() => elegir(hoy)}
                  className="font-alt text-[.8rem] font-extrabold text-azul hover:underline"
                >
                  Hoy
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
