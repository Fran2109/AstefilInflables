import { supabase } from "@/lib/supabase";
import type { ModeloPublico } from "@/types/catalogo";

/**
 * Carga del catálogo público de la landing desde Supabase (lectura sin sesión,
 * habilitada por RLS). Mapea snake_case → camelCase manteniendo los tipos de
 * `types/catalogo`. Sin Supabase configurado devuelve null y la landing
 * muestra sus estados vacíos: el catálogo es el inventario, así que no hay
 * contenido estático con el que rellenarlo.
 */

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
  /** Modelos reales del inventario (vista pública): el catálogo entero sale de acá. */
  modelos: ModeloPublico[];
  /** Nombres de categorías, en orden (tabla `categorias`). Vacío si no existe aún. */
  categorias: string[];
  /** Nombres de zonas de cobertura, en orden (tabla `zonas`). Vacío si no existe aún. */
  zonas: string[];
}

export async function cargarCatalogo(): Promise<CatalogoData | null> {
  if (!supabase) return null;

  const [mod, cats, zon] = await Promise.all([
    // Vista pública del inventario (puede no existir todavía → se ignora el error).
    supabase.from("catalogo_articulos").select("*").order("nombre"),
    // Categorías (puede no existir todavía → se ignora el error).
    supabase.from("categorias").select("nombre").eq("activo", true).order("orden"),
    // Zonas (puede no existir todavía → se ignora el error).
    supabase.from("zonas").select("nombre").eq("activo", true).order("orden"),
  ]);
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

  const zonas: string[] = zon.error
    ? []
    : (zon.data as { nombre: string }[]).map((z) => z.nombre);

  return { modelos, categorias, zonas };
}
