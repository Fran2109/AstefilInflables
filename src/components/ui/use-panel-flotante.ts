import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/** Margen mínimo contra los bordes de la pantalla. */
const MARGEN = 8;
/** Separación entre el disparador y el panel. */
const SEPARACION = 6;

interface Opciones {
  abierto: boolean;
  cerrar: () => void;
  /** Ancho fijo del panel en px. Sin esto, copia el ancho del disparador. */
  ancho?: number;
}

interface Posicion {
  left: number;
  top: number;
  width: number;
}

/**
 * Posiciona el panel flotante de `Select`, `DatePicker` y `TimePicker`.
 *
 * Los tres portalean a `document.body` y se ubican con `position: fixed`
 * calculado desde el disparador, así que comparten los mismos dos problemas —
 * y conviene arreglarlos una sola vez:
 *
 * 1. **Se cerraban con cualquier scroll.** El listener era `scroll` en fase de
 *    captura, así que en un celular el mínimo desplazamiento del dedo mientras
 *    se elegía una opción descartaba el panel. Como el cotizador tiene cuatro
 *    campos con panel, era el punto de abandono más probable del formulario.
 *    Ahora el panel **se reposiciona** al scrollear y solo se cierra si el
 *    disparador se fue de la pantalla, que es cuando de verdad perdió su ancla.
 *
 * 2. **Se salían de la pantalla.** El panel se dibujaba desde `rect.left` con
 *    ancho fijo, así que un campo en la mitad derecha en 375px quedaba cortado
 *    — y como el `body` tiene `overflow-x: hidden`, no había forma de llegar a
 *    lo cortado. Ahora se clampea contra los bordes y, si no entra abajo, se
 *    abre hacia arriba.
 */
export function usePanelFlotante<P extends HTMLElement = HTMLDivElement>({
  abierto,
  cerrar,
  ancho,
}: Opciones) {
  const refTrigger = useRef<HTMLButtonElement>(null);
  const refPanel = useRef<P>(null);
  const [pos, setPos] = useState<Posicion | null>(null);

  // `cerrar` suele venir como lambda inline y cambiaría de identidad en cada
  // render; guardarla en una ref evita reinstalar los listeners todo el tiempo.
  const refCerrar = useRef(cerrar);
  refCerrar.current = cerrar;

  const calcular = useCallback(() => {
    const trigger = refTrigger.current;
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();

    // Sin disparador visible el panel no tiene a qué anclarse: ahí sí cerrar.
    if (r.bottom < 0 || r.top > window.innerHeight) {
      refCerrar.current();
      return;
    }

    const w = ancho ?? r.width;
    const h = refPanel.current?.offsetHeight ?? 0;

    let left = Math.min(r.left, window.innerWidth - w - MARGEN);
    left = Math.max(MARGEN, left);

    let top = r.bottom + SEPARACION;
    const noEntraAbajo = h > 0 && top + h + MARGEN > window.innerHeight;
    const entraArriba = r.top - h - SEPARACION > MARGEN;
    if (noEntraAbajo && entraArriba) top = r.top - h - SEPARACION;

    setPos({ left, top, width: w });
  }, [ancho]);

  // Dos pasadas: la primera ubica el panel (todavía sin medir), la segunda
  // corrige ya sabiendo su alto real, que es lo que decide si abre hacia arriba.
  useLayoutEffect(() => {
    if (!abierto) {
      setPos(null);
      return;
    }
    calcular();
    const id = requestAnimationFrame(calcular);
    return () => cancelAnimationFrame(id);
  }, [abierto, calcular]);

  useEffect(() => {
    if (!abierto) return;

    const alScrollear = (e: Event) => {
      // Scrollear dentro del propio panel (una lista larga de horas, por
      // ejemplo) no tiene por qué moverlo.
      if (refPanel.current?.contains(e.target as Node)) return;
      calcular();
    };
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && refCerrar.current();

    window.addEventListener("scroll", alScrollear, true);
    window.addEventListener("resize", calcular);
    window.addEventListener("keydown", alTeclear);
    return () => {
      window.removeEventListener("scroll", alScrollear, true);
      window.removeEventListener("resize", calcular);
      window.removeEventListener("keydown", alTeclear);
    };
  }, [abierto, calcular]);

  /** Estilo listo para el panel. `null` mientras todavía no se midió. */
  const estilo = pos
    ? ({ position: "fixed", left: pos.left, top: pos.top, width: pos.width } as const)
    : ({ position: "fixed", visibility: "hidden" } as const);

  return { refTrigger, refPanel, estilo };
}
