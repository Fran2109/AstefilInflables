import { supabase } from "@/lib/supabase";
import type { Articulo, Categoria, Config, Perfil, Requisito, Reserva, Rol, Zona } from "@/admin/types";

/**
 * Capa de acceso a datos del panel contra Supabase (Postgres relacional).
 * Es la costura que reemplaza al adaptador `store` (localStorage) cuando hay
 * credenciales configuradas. Todas las tablas del panel exigen sesión (RLS),
 * así que estas funciones asumen que el usuario ya inició sesión.
 *
 * Convención: la DB usa snake_case; la app usa camelCase. El mapeo vive acá.
 */

function sb() {
  if (!supabase) throw new Error("Supabase no está configurado");
  return supabase;
}

// ---- Mapeos Reserva ----
type ReservaRow = {
  id: string;
  fecha: string;
  estado: string;
  cliente: string;
  telefono: string;
  hora_entrega: string;
  hora_retiro: string;
  articulo_ids: string[];
  zona: string;
  direccion: string;
  precio: number;
  sena: number;
  notas: string;
  creado: string;
};

function reservaDesde(r: ReservaRow): Reserva {
  return {
    id: r.id,
    fecha: r.fecha,
    estado: r.estado as Reserva["estado"],
    cliente: r.cliente,
    telefono: r.telefono,
    horaEntrega: r.hora_entrega ?? "",
    horaRetiro: r.hora_retiro ?? "",
    articuloIds: r.articulo_ids ?? [],
    zona: r.zona ?? "",
    direccion: r.direccion ?? "",
    precio: Number(r.precio) || 0,
    sena: Number(r.sena) || 0,
    notas: r.notas ?? "",
    creado: r.creado,
  };
}

function reservaHacia(r: Reserva): ReservaRow {
  return {
    id: r.id,
    fecha: r.fecha,
    estado: r.estado,
    cliente: r.cliente,
    telefono: r.telefono,
    hora_entrega: r.horaEntrega ?? "",
    hora_retiro: r.horaRetiro ?? "",
    articulo_ids: r.articuloIds ?? [],
    zona: r.zona ?? "",
    direccion: r.direccion ?? "",
    precio: Number(r.precio) || 0,
    sena: Number(r.sena) || 0,
    notas: r.notas ?? "",
    creado: r.creado,
  };
}

// ---- Mapeos Articulo (nombres casi idénticos) ----
type ArticuloRow = {
  id: string;
  nombre: string;
  cat: string;
  precio: number;
  activo: boolean;
  color: string;
  descripcion: string | null;
  ancho: number | null;
  largo: number | null;
  alto: number | null;
  ancho_turbina: number | null;
  largo_turbina: number | null;
  alto_turbina: number | null;
  fotos: string[] | null;
  notas_internas: string | null;
};

function articuloDesde(a: ArticuloRow): Articulo {
  return {
    id: a.id,
    nombre: a.nombre,
    cat: a.cat,
    precio: Number(a.precio) || 0,
    activo: a.activo,
    color: a.color,
    descripcion: a.descripcion ?? "",
    ancho: a.ancho ?? undefined,
    largo: a.largo ?? undefined,
    alto: a.alto ?? undefined,
    anchoTurbina: a.ancho_turbina ?? undefined,
    largoTurbina: a.largo_turbina ?? undefined,
    altoTurbina: a.alto_turbina ?? undefined,
    fotos: a.fotos ?? [],
    notasInternas: a.notas_internas ?? "",
  };
}

function articuloHacia(a: Articulo): ArticuloRow {
  return {
    id: a.id,
    nombre: a.nombre,
    cat: a.cat,
    precio: Number(a.precio) || 0,
    activo: a.activo,
    color: a.color,
    descripcion: a.descripcion ?? "",
    ancho: a.ancho ?? null,
    largo: a.largo ?? null,
    alto: a.alto ?? null,
    ancho_turbina: a.anchoTurbina ?? null,
    largo_turbina: a.largoTurbina ?? null,
    alto_turbina: a.altoTurbina ?? null,
    fotos: a.fotos ?? [],
    notas_internas: a.notasInternas ?? "",
  };
}

// ---- Mapeos Categoria (los 4 *_req en snake_case ↔ camelCase) ----
type CategoriaRow = {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
  descripcion_req: Requisito;
  medidas_req: Requisito;
  medidas_turbina_req: Requisito;
  fotos_req: Requisito;
};

function categoriaDesde(c: CategoriaRow): Categoria {
  return {
    id: c.id,
    nombre: c.nombre,
    orden: c.orden,
    activo: c.activo,
    descripcionReq: c.descripcion_req,
    medidasReq: c.medidas_req,
    medidasTurbinaReq: c.medidas_turbina_req,
    fotosReq: c.fotos_req,
  };
}

function categoriaHacia(c: Categoria): CategoriaRow {
  return {
    id: c.id,
    nombre: c.nombre,
    orden: c.orden,
    activo: c.activo,
    descripcion_req: c.descripcionReq,
    medidas_req: c.medidasReq,
    medidas_turbina_req: c.medidasTurbinaReq,
    fotos_req: c.fotosReq,
  };
}

/** Mapea los campos camelCase de un `Partial<Categoria>` a columnas snake_case. */
function camposCategoriaHacia(
  cambios: Partial<Pick<Categoria, "nombre" | "orden" | "activo" | "descripcionReq" | "medidasReq" | "medidasTurbinaReq" | "fotosReq">>
): Partial<CategoriaRow> {
  const out: Partial<CategoriaRow> = {};
  if (cambios.nombre !== undefined) out.nombre = cambios.nombre;
  if (cambios.orden !== undefined) out.orden = cambios.orden;
  if (cambios.activo !== undefined) out.activo = cambios.activo;
  if (cambios.descripcionReq !== undefined) out.descripcion_req = cambios.descripcionReq;
  if (cambios.medidasReq !== undefined) out.medidas_req = cambios.medidasReq;
  if (cambios.medidasTurbinaReq !== undefined) out.medidas_turbina_req = cambios.medidasTurbinaReq;
  if (cambios.fotosReq !== undefined) out.fotos_req = cambios.fotosReq;
  return out;
}

// ---- Fotos de artículos (Supabase Storage, bucket público `inflables`) ----
const BUCKET = "inflables";

/** URL pública de una foto a partir de su path en el bucket. */
export function urlFoto(path: string): string {
  if (!supabase) return path;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Comprime una imagen a JPEG (~1280px lado mayor) antes de subirla, para que
 * las fotos del cel no pesen de más. Devuelve un Blob JPEG.
 */
async function comprimir(file: File, maxLado = 1280, calidad = 0.75): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * escala);
  const h = Math.round(bitmap.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no blob"))), "image/jpeg", calidad)
  );
}

/** Sube una foto al bucket y devuelve su path. Comprime antes de subir. */
export async function subirFoto(file: File): Promise<string> {
  const blob = await comprimir(file);
  const path = `${crypto.randomUUID()}.jpg`;
  const { error } = await sb().storage.from(BUCKET).upload(path, blob, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

/** Borra una foto del bucket por su path. */
export async function borrarFoto(path: string): Promise<void> {
  const { error } = await sb().storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

// ---- Carga inicial ----
export async function cargarTodo(): Promise<{
  articulos: Articulo[];
  reservas: Reserva[];
  config: Config;
  categorias: Categoria[];
  zonas: Zona[];
}> {
  const [art, res, cfg, cats, zon] = await Promise.all([
    sb().from("articulos").select("*").order("nombre"),
    sb().from("reservas").select("*").order("fecha"),
    sb().from("config").select("*").eq("id", 1).maybeSingle(),
    // Puede no existir todavía (base sin la tabla `categorias`) → se ignora el error.
    sb().from("categorias").select("*").order("orden"),
    // Puede no existir todavía (base sin la tabla `zonas`) → se ignora el error.
    sb().from("zonas").select("*").order("orden"),
  ]);
  if (art.error) throw art.error;
  if (res.error) throw res.error;
  if (cfg.error) throw cfg.error;
  return {
    articulos: (art.data as ArticuloRow[]).map(articuloDesde),
    reservas: (res.data as ReservaRow[]).map(reservaDesde),
    config: cfg.data
      ? { nombre: (cfg.data as { nombre: string }).nombre ?? "", pin: null }
      : { nombre: "", pin: null },
    categorias: cats.error ? [] : (cats.data as CategoriaRow[]).map(categoriaDesde),
    zonas: zon.error ? [] : (zon.data as Zona[]),
  };
}

// ---- Roles / perfiles ----
/**
 * Rol del usuario logueado. Reglas:
 *  - Si la tabla `perfiles` todavía no existe (base sin migrar) ⇒ "admin"
 *    (estado pre-roles: no bloquear al dueño; la RLS sigue siendo la protección).
 *  - Si existe pero no hay fila para el usuario ⇒ "empleado" (mínimo privilegio).
 */
export async function cargarRol(): Promise<Rol> {
  const { data: userData } = await sb().auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return "empleado";
  const { data, error } = await sb()
    .from("perfiles")
    .select("rol")
    .eq("id", uid)
    .maybeSingle();
  if (error) {
    // Tabla inexistente (aún no se corrió roles.sql) → tratar como admin.
    if (error.code === "PGRST205" || error.code === "42P01") return "admin";
    return "empleado";
  }
  return data ? (data as { rol: Rol }).rol : "empleado";
}

/** Lista de perfiles (solo la ve un admin, por RLS). */
export async function cargarPerfiles(): Promise<Perfil[]> {
  const { data, error } = await sb().from("perfiles").select("*").order("email");
  if (error) throw error;
  return data as Perfil[];
}

export async function cambiarRol(id: string, rol: Rol): Promise<void> {
  const { error } = await sb().from("perfiles").update({ rol }).eq("id", id);
  if (error) throw error;
}

// ---- Categorías ----
export async function crearCategoria(c: Categoria): Promise<void> {
  const { error } = await sb().from("categorias").insert(categoriaHacia(c));
  if (error) throw error;
}

export async function actualizarCategoria(
  id: string,
  cambios: Partial<Pick<Categoria, "nombre" | "orden" | "activo" | "descripcionReq" | "medidasReq" | "medidasTurbinaReq" | "fotosReq">>
): Promise<void> {
  const { error } = await sb().from("categorias").update(camposCategoriaHacia(cambios)).eq("id", id);
  if (error) throw error;
}

export async function borrarCategoria(id: string): Promise<void> {
  const { error } = await sb().from("categorias").delete().eq("id", id);
  if (error) throw error;
}

// ---- Zonas ----
export async function crearZona(z: Zona): Promise<void> {
  const { error } = await sb().from("zonas").insert(z);
  if (error) throw error;
}

export async function actualizarZona(
  id: string,
  cambios: Partial<Pick<Zona, "nombre" | "orden" | "activo">>
): Promise<void> {
  const { error } = await sb().from("zonas").update(cambios).eq("id", id);
  if (error) throw error;
}

export async function borrarZona(id: string): Promise<void> {
  const { error } = await sb().from("zonas").delete().eq("id", id);
  if (error) throw error;
}

// ---- Reservas ----
export async function upsertReserva(r: Reserva): Promise<void> {
  const { error } = await sb().from("reservas").upsert(reservaHacia(r));
  if (error) throw error;
}

export async function borrarReserva(id: string): Promise<void> {
  const { error } = await sb().from("reservas").delete().eq("id", id);
  if (error) throw error;
}

export async function insertarReservas(rs: Reserva[]): Promise<void> {
  if (!rs.length) return;
  const { error } = await sb().from("reservas").insert(rs.map(reservaHacia));
  if (error) throw error;
}

// ---- Artículos ----
export async function upsertArticulo(a: Articulo): Promise<void> {
  const { error } = await sb().from("articulos").upsert(articuloHacia(a));
  if (error) throw error;
}

export async function borrarArticulo(id: string): Promise<void> {
  const { error } = await sb().from("articulos").delete().eq("id", id);
  if (error) throw error;
}

// ---- Config ----
export async function guardarConfig(nombre: string): Promise<void> {
  const { error } = await sb().from("config").upsert({ id: 1, nombre });
  if (error) throw error;
}

// ---- Operaciones masivas (borrar todo / importar) ----
export async function reemplazarTodo(articulos: Articulo[], reservas: Reserva[]): Promise<void> {
  // Borra todo (filtro que matchea cualquier fila) y reinserta.
  const delRes = await sb().from("reservas").delete().not("id", "is", null);
  if (delRes.error) throw delRes.error;
  const delArt = await sb().from("articulos").delete().not("id", "is", null);
  if (delArt.error) throw delArt.error;
  if (articulos.length) {
    const { error } = await sb().from("articulos").insert(articulos.map(articuloHacia));
    if (error) throw error;
  }
  if (reservas.length) {
    const { error } = await sb().from("reservas").insert(reservas.map(reservaHacia));
    if (error) throw error;
  }
}
