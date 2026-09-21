import { supabase } from "@/lib/supabase";
import type { ModeloPublico, TestimonioPublico } from "@/types/catalogo";

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

// ---- Comentarios de la landing ----

/** Límites que la base también valida con CHECK (ver los .sql de `testimonios`). */
export const LIMITES_COMENTARIO = { texto: 600, quien: 60, localidad: 60, articulo: 80 } as const;

/** Los datos que puede mandar un visitante. Solo `quien` y `texto` son obligatorios. */
export interface ComentarioNuevo {
  quien: string;
  texto: string;
  puntaje?: number;
  articulo?: string;
  localidad?: string;
  /** 'YYYY-MM-DD'. */
  fechaEvento?: string;
}

/**
 * Los comentarios aprobados, del más reciente al más antiguo.
 *
 * No hace falta filtrar por estado acá: la política de RLS solo expone
 * `estado = 'aprobado'` a quien consulta sin sesión de admin. Pedirlo igual
 * sería duplicar la regla en un lugar donde podría quedar desincronizada.
 */
export async function cargarTestimonios(): Promise<TestimonioPublico[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("testimonios")
    .select("id, texto, quien, creado, puntaje, articulo, localidad, fecha_evento")
    .order("creado", { ascending: false });
  if (error) throw error;
  // `fecha_evento` es la única columna con nombre distinto entre DB y app.
  return (data as (Omit<TestimonioPublico, "fechaEvento"> & { fecha_evento: string | null })[]).map(
    ({ fecha_evento, ...resto }) => ({ ...resto, fechaEvento: fecha_evento })
  );
}

/**
 * Deja un comentario nuevo. Entra como `pendiente` y no se ve en la web hasta
 * que un admin lo apruebe.
 *
 * ⚠️ El insert NO puede pedir la fila de vuelta (nada de `.select()` acá): la
 * fila recién creada está en `pendiente`, la política de lectura pública solo
 * matchea `aprobado`, y PostgREST fallaría al intentar devolverla. El alta
 * funciona igual; lo que el visitante ve enseguida lo sostiene el componente
 * con su propio estado.
 *
 * Tampoco se manda `estado`: lo pone el default de la tabla y el `with check`
 * de la política lo clava en `pendiente`. Mandarlo desde el cliente sugeriría
 * que es el cliente quien decide, y no lo es.
 */
export async function enviarTestimonio(c: ComentarioNuevo): Promise<void> {
  if (!supabase) throw new Error("Supabase no está configurado");
  // Los opcionales vacíos van como `null`, no como "": un string vacío
  // reventaría contra el CHECK de longitud de la base.
  const limpio = (v?: string) => {
    const t = v?.trim();
    return t ? t : null;
  };
  const { error } = await supabase.from("testimonios").insert({
    quien: c.quien.trim(),
    texto: c.texto.trim(),
    puntaje: c.puntaje ?? null,
    articulo: limpio(c.articulo),
    localidad: limpio(c.localidad),
    fecha_evento: limpio(c.fechaEvento),
  });
  if (error) throw error;
}
