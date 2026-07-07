import type { ModeloPublico } from "@/types/catalogo";
import { linkWhatsApp } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

/** Acento de color por categoría (con fallback para nombres viejos/desconocidos). */
const COLOR_CAT: Record<string, string> = {
  Castillos: "bg-rojo",
  Gigantes: "bg-azul",
  Acuáticos: "bg-cielo-osc",
  Juegos: "bg-verde",
  Eventos: "bg-rosa",
};

/**
 * Tarjeta de un modelo real del inventario, para la vista filtrada por categoría.
 * Sin foto propia todavía: usa una banda de color por categoría + nombre + medidas.
 */
export function ModeloCard({ modelo }: { modelo: ModeloPublico }) {
  const { nombre, cat, descripcion, ancho, largo, alto } = modelo;
  const tieneMedidas = ancho != null && largo != null;
  const wa = linkWhatsApp(`¡Hola Astefil! Quiero consultar por ${nombre} (${cat}) 🎈`);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border-3 border-tinta bg-papel shadow-hard-sm transition-transform duration-150 hover:-translate-y-1 hover:shadow-hard">
      <div className={`flex items-center justify-between gap-2 border-b-3 border-tinta px-4 py-2.5 ${COLOR_CAT[cat] ?? "bg-amarillo"}`}>
        <h3 className="font-alt text-[1.05rem] font-extrabold leading-tight text-white [text-shadow:1px_1px_0_var(--tinta)]">
          {nombre}
        </h3>
        {tieneMedidas && (
          <span className="flex-none rounded-full border-2 border-tinta bg-papel px-2 py-0.5 font-alt text-[.72rem] font-extrabold">
            {ancho} × {largo}
            {alto != null ? " × " + alto : ""} m
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {descripcion && (
          <p className="flex-1 text-[.9rem] leading-[1.45] text-[#3c2f28]">{descripcion}</p>
        )}
        <Button asChild variant="verde" size="chico" className="self-start">
          <a href={wa} target="_blank" rel="noopener">
            Consultar
          </a>
        </Button>
      </div>
    </article>
  );
}
