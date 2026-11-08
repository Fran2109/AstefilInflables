import { supabase } from "@/lib/supabase";

/** Los mismos valores que el CHECK de `clics_whatsapp.origen`. */
const ORIGENES = [
  "hero",
  "cotizador",
  "catalogo",
  "modelo",
  "visor",
  "zonas",
  "cta-final",
  "header",
  "flotante",
  "footer",
  "formulario-quinta",
];

/**
 * Cuenta los clicks a WhatsApp de las páginas públicas. Un solo listener en vez
 * de un `onClick` por botón: cada link solo declara `data-origen`, y uno nuevo
 * que se olvide de declararlo igual se cuenta, como "otro".
 *
 * Solo en producción, para que probar en local no ensucie los números. El alta
 * es solo para `anon`, así que con la sesión del panel abierta la base la rechaza
 * y el click no cuenta: es lo que queremos, por eso se ignora el error.
 */
export function medirClicksWhatsApp(): () => void {
  const db = supabase;
  if (!db || !import.meta.env.PROD) return () => {};

  const alClickear = (e: MouseEvent) => {
    if (!(e.target instanceof Element)) return;
    const link = e.target.closest<HTMLAnchorElement>('a[href^="https://api.whatsapp.com/send"]');
    const { pathname } = window.location;
    if (!link || pathname.startsWith("/admin")) return;

    const declarado = link.dataset.origen ?? "";
    // El builder de Supabase no sale hasta que alguien lo espera: sin `then` no manda nada.
    void db
      .from("clics_whatsapp")
      .insert({
        origen: ORIGENES.includes(declarado) ? declarado : "otro",
        pagina: pathname.startsWith("/quinta") ? "quinta" : "landing",
      })
      .then(() => {});
  };

  document.addEventListener("click", alClickear, true);
  return () => document.removeEventListener("click", alClickear, true);
}
