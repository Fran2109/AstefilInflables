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
   * Id del `<label>` visible que nombra este campo. Sin esto el nombre
   * accesible termina siendo el placeholder ("dd/mm/aaaa").
   */
  ariaLabelledBy?: string;
  placeholder?: string;
  /**
   * Fecha máxima elegible, 'YYYY-MM-DD'. Los días posteriores quedan
   * deshabilitados. Lo usa el formulario de comentarios: una opinión habla de
   * una fiesta que ya pasó, así que no tiene sentido ofrecer fechas futuras.
   */
  max?: string;
  /**
   * Fecha mínima elegible, 'YYYY-MM-DD'. Los días anteriores quedan
   * deshabilitados. Lo usan el cotizador y la quinta: se consulta por un evento
   * que todavía no pasó.
   */
  min?: string;
  /** Clases de la caja del campo (define su estilo en cada contexto). */
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

/** Dígitos → 'dd/mm/aaaa'. La barra aparece con el dígito siguiente, así borrar no se traba en ella. */
function enmascarar(digitos: string): string {
  return [digitos.slice(0, 2), digitos.slice(2, 4), digitos.slice(4, 8)].filter(Boolean).join("/");
}

/** 'ddmmaaaa' → 'YYYY-MM-DD', o null si esa fecha no existe (31/02, mes 13…). */
function isoDeDigitos(digitos: string): string | null {
  const [d, m, y] = [digitos.slice(0, 2), digitos.slice(2, 4), digitos.slice(4)].map(Number);
  const fecha = new Date(y, m - 1, d);
  if (y < 2000 || y > 2100 || fecha.getMonth() !== m - 1 || fecha.getDate() !== d) return null;
  return aISO(fecha);
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
 *
 * La fecha se escribe en el campo o se elige con el botón del calendario. Lo
 * escrito vive en `borrador` hasta que forma una fecha válida: `onChange` solo
 * recibe fechas completas o "".
 */
export function DatePicker({
  value,
  onChange,
  id,
  ariaLabelledBy,
  placeholder,
  max,
  min,
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  // El panel se ancla a la caja entera, no al botoncito del calendario.
  const { refTrigger, refPanel, estilo, contenedor } = usePanelFlotante<HTMLDivElement, HTMLDivElement>({
    abierto: open,
    cerrar: () => setOpen(false),
    ancho: 300,
  });
  const [vista, setVista] = useState(() => deISO(value) ?? new Date());
  const [borrador, setBorrador] = useState<string | null>(null);
  const [error, setError] = useState("");

  const problemaDe = (iso: string | null): string => {
    if (!iso) return "Esa fecha no existe";
    if (min && iso < min) return "No puede ser antes del " + formatearCorta(min);
    if (max && iso > max) return "No puede ser después del " + formatearCorta(max);
    return "";
  };

  /** Valida 'ddmmaaaa' y publica el resultado. Devuelve si quedó aceptada. */
  const confirmarDigitos = (digitos: string): boolean => {
    const iso = isoDeDigitos(digitos);
    const problema = problemaDe(iso);
    setError(problema);
    onChange(problema ? "" : (iso as string));
    return !problema;
  };

  const escribir = (texto: string) => {
    const digitos = texto.replace(/\D/g, "").slice(0, 8);
    setBorrador(enmascarar(digitos));
    if (digitos.length === 8) {
      confirmarDigitos(digitos);
    } else {
      setError("");
      if (value) onChange("");
    }
  };

  const alSalir = () => {
    if (borrador === null) return;
    const digitos = borrador.replace(/\D/g, "");
    if (!digitos) return setBorrador(null);
    // Año corto: 12/11/26 es 2026.
    const completos = digitos.length === 6 ? digitos.slice(0, 4) + "20" + digitos.slice(4) : digitos;
    if (completos.length < 8) return setError("Completá la fecha: dd/mm/aaaa");
    if (confirmarDigitos(completos)) setBorrador(null);
    else setBorrador(enmascarar(completos));
  };

  const toggle = () => {
    // Al reabrir, volver al mes de la fecha ya elegida. La posición del panel
    // la resuelve `usePanelFlotante`.
    setVista(deISO(value) ?? new Date());
    setOpen((o) => !o);
  };

  const elegir = (d: Date) => {
    setBorrador(null);
    setError("");
    onChange(aISO(d));
    setOpen(false);
  };


  const hoy = new Date();
  const hoyISO = aISO(hoy);

  return (
    <>
      <div
        ref={refTrigger}
        className={cn(
          triggerClassName,
          "flex items-center justify-between gap-2 focus-within:outline focus-within:outline-4 focus-within:outline-azul"
        )}
      >
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-labelledby={ariaLabelledBy}
          aria-invalid={!!error}
          placeholder={placeholder || "dd/mm/aaaa"}
          value={borrador ?? formatearCorta(value)}
          onChange={(e) => escribir(e.target.value)}
          onBlur={alSalir}
          className="w-full min-w-0 flex-1 bg-transparent outline-none"
        />
        <button
          id={id && id + "-calendario"}
          type="button"
          aria-label="Abrir calendario"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={toggle}
          className="-my-2.5 -mr-2 flex h-10 w-10 flex-none items-center justify-center rounded-lg hover:bg-cielo"
        >
          <Calendar className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1 font-alt text-[.8rem] font-bold text-rojo">
          {error}
        </p>
      )}

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
                  const bloqueado = (!!max && iso > max) || (!!min && iso < min);
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
                    setBorrador(null);
                    setError("");
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
