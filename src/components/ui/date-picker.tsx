import { useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePanelFlotante } from "@/components/ui/use-panel-flotante";

interface Props {
  /** 'YYYY-MM-DD', o "" si no hay fecha elegida. */
  value: string;
  onChange: (v: string) => void;
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
  /**
   * Fecha máxima elegible, 'YYYY-MM-DD'. Los días posteriores quedan
   * deshabilitados. Lo usa el formulario de comentarios: una opinión habla de
   * una fiesta que ya pasó, así que no tiene sentido ofrecer fechas futuras.
   */
  max?: string;
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
export function DatePicker({
  value,
  onChange,
  id,
  ariaLabelledBy,
  placeholder,
  max,
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const { refTrigger, refPanel, estilo, contenedor } = usePanelFlotante({
    abierto: open,
    cerrar: () => setOpen(false),
    ancho: 300,
  });
  const [vista, setVista] = useState(() => deISO(value) ?? new Date());

  const toggle = () => {
    // Al reabrir, volver al mes de la fecha ya elegida. La posición del panel
    // la resuelve `usePanelFlotante`.
    setVista(deISO(value) ?? new Date());
    setOpen((o) => !o);
  };

  const elegir = (d: Date) => {
    onChange(aISO(d));
    setOpen(false);
  };


  const hoy = new Date();
  const hoyISO = aISO(hoy);

  return (
    <>
      <button
        ref={refTrigger}
        id={id}
        type="button"
        aria-labelledby={ariaLabelledBy}
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
        createPortal(
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
            <div
              ref={refPanel}
              role="dialog"
              aria-label="Elegir fecha"
              style={estilo}
              className="z-[101] w-[300px] rounded-xl border-3 border-tinta bg-papel p-3.5 shadow-hard-xl"
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
                  // Comparar los ISO como texto alcanza: 'YYYY-MM-DD' ordena
                  // igual lexicográfica que cronológicamente.
                  const bloqueado = !!max && iso > max;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => elegir(d)}
                      disabled={bloqueado}
                      aria-label={iso}
                      aria-current={esHoy ? "date" : undefined}
                      aria-selected={esElegido}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg text-[.85rem] font-body enabled:hover:bg-cielo",
                        bloqueado && "cursor-not-allowed text-gris opacity-30",
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
          contenedor
        )}
    </>
  );
}
