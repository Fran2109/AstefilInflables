import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { scrollAId } from "@/lib/scroll";
import { useMedirAlScrollear } from "@/lib/use-medir-al-scrollear";

/** ¿Algo de `selector` está en pantalla? */
function enPantalla(selector: string): boolean {
  return [...document.querySelectorAll(selector)].some((el) => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  });
}

/**
 * Atajo al cotizador en el celular, donde queda a varias pantallas de la portada.
 *
 * Es una píldora y no una barra de ancho completo: termina donde empieza el
 * botón flotante de WhatsApp, así que los dos conviven sin moverse y tapa menos
 * contenido. Se va cuando ya no hace falta (la portada todavía tiene sus propios
 * botones; en el cotizador, la CTA final y el footer ya llegaste) y mientras se
 * escribe, para no tapar el campo de un formulario.
 */
export function BotonCotizarFijo() {
  const [visible, setVisible] = useState(false);

  useMedirAlScrollear(() => {
    const hero = document.getElementById("hero");
    const pasoElHero = !!hero && hero.getBoundingClientRect().bottom < 0;
    const escribiendo = !!document.activeElement?.matches("input, textarea");
    setVisible(pasoElHero && !escribiendo && !enPantalla("#cotizar, [data-cta-conversion], footer"));
  });

  return (
    <Button
      onClick={() => scrollAId("cotizar")}
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      className={cn(
        "fixed bottom-[22px] left-3.5 right-[98px] z-[60] h-[62px] whitespace-nowrap px-3 md:hidden",
        !visible && "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      💬 Cotizá tu fecha
    </Button>
  );
}
