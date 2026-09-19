import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { FAQ, SITIO } from "./src/data/site";
import { WHATSAPP } from "./src/lib/whatsapp";

/**
 * Inyecta el JSON-LD (datos estructurados para buscadores) en `index.html`.
 *
 * Se genera acá en vez de escribirlo a mano en el HTML porque el contenido ya
 * existe en `src/data/site.ts`: si se copiara, el día que Francisco edite una
 * pregunta del FAQ quedarían dos versiones distintas y la que ve Google sería
 * la vieja. Google además exige que el FAQPage coincida con lo que se ve en la
 * página, así que la copia desactualizada no es solo fea, es incorrecta.
 *
 * Qué NO va acá, a propósito (ver "Verdad vs. placeholder" en CLAUDE.md):
 * - `url`: todavía no hay dominio de producción definido.
 * - `address`: no hay dirección pública del negocio.
 * - `priceRange` / ofertas: los precios no se publican, el funnel es "consultá".
 * Inventar cualquiera de esos tres sería mentirle a Google y al que busca.
 */
function jsonLd() {
  const negocio = {
    "@type": "LocalBusiness",
    "@id": "#astefil",
    name: SITIO.nombre,
    description:
      "Alquiler de castillos inflables, inflables acuáticos y juegos de salón " +
      "para cumpleaños y eventos en zona norte y noroeste del Gran Buenos Aires.",
    image: "/og-image.jpg",
    telephone: "+" + WHATSAPP,
    email: SITIO.email,
    // Región estable en vez de la lista de localidades: las zonas concretas se
    // gestionan desde el ABM (tabla `zonas`) y cambian sin tocar este archivo.
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Zona norte y noroeste del Gran Buenos Aires, Argentina",
    },
    sameAs: [SITIO.instagram.url, SITIO.facebook.url],
  };

  const faq = {
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return {
    name: "astefil-json-ld",
    transformIndexHtml() {
      return [
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          children: JSON.stringify(
            { "@context": "https://schema.org", "@graph": [negocio, faq] },
            null,
            2,
          ),
          injectTo: "head" as const,
        },
      ];
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), jsonLd()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
