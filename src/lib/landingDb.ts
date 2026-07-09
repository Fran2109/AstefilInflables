import { supabase } from "@/lib/supabase";
import type { ModeloPublico, Producto } from "@/types/catalogo";

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
  fotos: string[] | null;
};

/** Path del bucket `inflables` → URL pública (o el path si no hay Supabase). */
function urlPublicaFoto(path: string): string {
  return supabase ? supabase.storage.from("inflables").getPublicUrl(path).data.publicUrl : path;
}

export interface CatalogoData {
  productos: Producto[];
  /** Modelos reales del inventario (vista pública), para el detalle de cada card. */
  modelos: ModeloPublico[];
  /** Nombres de categorías, en orden (tabla `categorias`). Vacío si no existe aún. */
  categorias: string[];
}

export async function cargarCatalogo(): Promise<CatalogoData | null> {
  if (!supabase) return null;

  const [prod, mod, cats] = await Promise.all([
    supabase
      .from("productos")
      .select("*")
      .eq("activo", true)
      .order("orden"),
    // Vista pública del inventario (puede no existir todavía → se ignora el error).
    supabase.from("catalogo_inflables").select("*").order("nombre"),
    // Categorías (puede no existir todavía → se ignora el error).
    supabase.from("categorias").select("nombre").eq("activo", true).order("orden"),
  ]);
  if (prod.error) throw prod.error;

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
        fotos: (m.fotos ?? []).map(urlPublicaFoto),
      }));

  const categorias: string[] = cats.error
    ? []
    : (cats.data as { nombre: string }[]).map((c) => c.nombre);

  return { productos, modelos, categorias };
}
