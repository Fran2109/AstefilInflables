import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { linkWhatsApp, mensajeConsulta } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * Botón flotante de WhatsApp. El mensaje se ajusta a la ruta.
 *
 * Se esconde cuando hay un CTA de conversión en pantalla (los marcados con
 * `data-cta-conversion`: el del cotizador y el de la CTA final). Los dos son
 * botones de ancho completo y el flotante les caía justo sobre la esquina
 * derecha, tapando el botón que más queremos que toquen. Además, ahí abajo el
 * flotante ofrece la salida genérica —sin fecha ni zona— y compite con el
 * mensaje bien armado que el visitante acaba de completar.
 */
export function WhatsAppFloat() {
  const { pathname } = useLocation();
  const [tapaAlgo, setTapaAlgo] = useState(false);

  useEffect(() => {
    // Se mide con un listener de scroll y no con IntersectionObserver a
    // propósito: el panel de preview del proyecto no ejecuta los callbacks de
    // IO, así que una implementación con IO no se puede verificar acá ni en
    // las sesiones que vengan. Con dos elementos observados y rAF de por medio
    // el costo es irrelevante, y esto sí se puede probar.
    let frame = 0;

    const medir = () => {
      const ctas = document.querySelectorAll("[data-cta-conversion]");
      const alto = window.innerHeight;
      let alguno = false;
      ctas.forEach((c) => {
        const r = c.getBoundingClientRect();
        // El margen de 80px hace que el flotante se vaya un poco antes de
        // llegar a pisar el botón, no justo cuando ya lo está pisando.
        if (r.top < alto - 80 && r.bottom > 0) alguno = true;
      });
      setTapaAlgo(alguno);
    };

    // Cancelar y volver a pedir en vez de un flag "ya hay uno pendiente": si el
    // frame se descarta (pestaña en segundo plano, panel oculto), un flag queda
    // trabado en true y la medición no vuelve a correr nunca.
    const alScrollear = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener("scroll", alScrollear, { passive: true });
    window.addEventListener("resize", alScrollear);
    document.addEventListener("visibilitychange", medir);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", alScrollear);
      window.removeEventListener("resize", alScrollear);
      document.removeEventListener("visibilitychange", medir);
    };
  }, [pathname]);

  return (
    <a
      href={linkWhatsApp(mensajeConsulta(pathname))}
      target="_blank"
      rel="noopener"
      aria-label="Escribinos por WhatsApp"
      aria-hidden={tapaAlgo}
      tabIndex={tapaAlgo ? -1 : undefined}
      className={cn(
        "fixed bottom-[22px] right-[22px] z-[70] flex h-[62px] w-[62px] items-center justify-center rounded-full border-3 border-tinta bg-verde shadow-hard-sm",
        "transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard active:translate-x-[3px] active:translate-y-[3px] active:scale-95 active:shadow-none",
        tapaAlgo && "pointer-events-none scale-75 opacity-0"
      )}
    >
      <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white" aria-hidden="true">
        <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.33 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.83 9.83 0 0 0 12.04 2zm5.82 14.13c-.25.7-1.45 1.34-2 1.39-.51.05-1.15.07-1.86-.12-.43-.11-.98-.29-1.69-.55-2.97-1.09-4.9-4.08-5.05-4.27-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.25.58.84 2 .91 2.15.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.76 1.24 1.63 2.01 1.12.99 2.06 1.3 2.36 1.45.3.15.47.12.64-.07.17-.2.74-.86.94-1.15.2-.3.39-.25.66-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.07.12.07.72-.18 1.42z" />
      </svg>
    </a>
  );
}
