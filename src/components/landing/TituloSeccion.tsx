import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TituloSeccionProps {
  children: ReactNode;
  sub?: ReactNode;
  /** Clases extra para la banda (color/rotación). */
  bandaClassName?: string;
}

/**
 * Título de sección: la banda amarilla rotada + un subtítulo opcional.
 *
 * El subtítulo va **fuera del `<h2>`**. Antes estaba adentro como un `<span>`,
 * así que un lector de pantalla leía el párrafo explicativo entero como parte
 * del encabezado: navegar por títulos —que es como se recorre una página sin
 * ver— devolvía "Cotizá en 30 segundos Completá lo que sepas, tocá el botón y
 * te abrimos WhatsApp con el mensaje ya armado. Sin vueltas." en vez de un
 * título. Visualmente no cambia nada.
 */
export function TituloSeccion({ children, sub, bandaClassName }: TituloSeccionProps) {
  return (
    <>
      <h2 className="text-center text-[clamp(2rem,4.5vw,3rem)]">
        <span className={cn("banda-titulo", bandaClassName)}>{children}</span>
      </h2>
      {sub && (
        <p className="mb-3.5 mt-2.5 text-center font-body text-[1.05rem] font-medium text-[#3c2f28]">
          {sub}
        </p>
      )}
      {!sub && <div className="mb-3.5" />}
    </>
  );
}
