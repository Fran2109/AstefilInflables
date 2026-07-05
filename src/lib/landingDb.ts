import { supabase } from "@/lib/supabase";
import type { Foto, ModeloPublico, Producto } from "@/types/catalogo";

/**
 * Carga del catálogo público de la landing desde Supabase (lectura sin sesión,
 * habilitada por RLS). Mapea snake_case → camelCase manteniendo los tipos de
 * `types/catalogo`. Si no hay Supabase configurado, devuelve null y la app usa
 * los datos estáticos de `src/data/` como fallback.
 */

type ProductoRow = {
  id: string;
  titulo: string;
  tag: string;
  desc_corta: string;
  desc_larga: string;
  fotos: string[];
  ilustracion_id: string | null;
  cats: string[] | null;
  orden: number;
  activo: boolean;
};

type ModeloRow = {
  id: string;
  nombre: string;
  cat: string;
  descripcion: string | null;
  ancho: number | null;
  largo: number | null;
  alto: number | null;
};

type FotoRow = {
  clave: string;
  src: string;
  alt: string;
  en_galeria: boolean;
  orden: number;
};

export interface CatalogoData {
  productos: Producto[];
  fotos: Record<string, Foto>;
  galeria: string[];
  /** Modelos reales del inventario (vista pública), para el detalle de cada card. */
  modelos: ModeloPublico[];
}

export async function cargarCatalogo(): Promise<CatalogoData | null> {
  if (!supabase) return null;

  const [prod, fot, mod] = await Promise.all([
    supabase
      .from("productos")
      .select("*")
      .eq("activo", true)
      .order("orden"),
    supabase.from("fotos").select("*").order("orden"),
    // Vista pública del inventario (puede no existir todavía → se ignora el error).
    supabase.from("catalogo_inflables").select("*").order("nombre"),
  ]);
  if (prod.error) throw prod.error;
  if (fot.error) throw fot.error;

  const productos: Producto[] = (prod.data as ProductoRow[]).map((p) => ({
    id: p.id,
    titulo: p.titulo,
    tag: p.tag,
    descCorta: p.desc_corta,
    descLarga: p.desc_larga,
    fotos: p.fotos ?? [],
    ilustracionId: (p.ilustracion_id as Producto["ilustracionId"]) ?? undefined,
    cats: p.cats ?? [],
  }));

  const fotos: Record<string, Foto> = {};
  const galeria: string[] = [];
  for (const f of fot.data as FotoRow[]) {
    fotos[f.clave] = { clave: f.clave, src: f.src, alt: f.alt };
    if (f.en_galeria) galeria.push(f.clave);
  }

  const modelos: ModeloPublico[] = mod.error
    ? []
    : (mod.data as ModeloRow[]).map((m) => ({
        id: m.id,
        nombre: m.nombre,
        cat: m.cat,
        descripcion: m.descripcion ?? undefined,
        ancho: m.ancho ?? undefined,
        largo: m.largo ?? undefined,
        alto: m.alto ?? undefined,
      }));

  return { productos, fotos, galeria, modelos };
}
