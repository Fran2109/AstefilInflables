import { useEffect, useRef } from "react";

/**
 * Corre `medir` al montar y cada vez que cambia lo que se ve en pantalla.
 *
 * Se mide con un listener de scroll y no con IntersectionObserver a propósito:
 * el panel de preview del proyecto no ejecuta los callbacks de IO, así que una
 * implementación con IO no se puede verificar acá ni en las sesiones que
 * vengan. Con pocos elementos medidos y rAF de por medio el costo es
 * irrelevante, y esto sí se puede probar.
 */
export function useMedirAlScrollear(medir: () => void) {
  const refMedir = useRef(medir);
  refMedir.current = medir;

  useEffect(() => {
    let frame = 0;
    const ahora = () => refMedir.current();

    // Cancelar y volver a pedir en vez de un flag "ya hay uno pendiente": si el
    // frame se descarta (pestaña en segundo plano, panel oculto), un flag queda
    // trabado en true y la medición no vuelve a correr nunca.
    const alScrollear = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(ahora);
    };

    ahora();
    window.addEventListener("scroll", alScrollear, { passive: true });
    window.addEventListener("resize", alScrollear);
    document.addEventListener("visibilitychange", ahora);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", alScrollear);
      window.removeEventListener("resize", alScrollear);
      document.removeEventListener("visibilitychange", ahora);
    };
  }, []);
}
