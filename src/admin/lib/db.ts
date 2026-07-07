import { supabase } from "@/lib/supabase";
import type { Config, Inflable, Reserva } from "@/admin/types";

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
  inflable_ids: string[];
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
    inflableIds: r.inflable_ids ?? [],
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
    inflable_ids: r.inflableIds ?? [],
    zona: r.zona ?? "",
    direccion: r.direccion ?? "",
    precio: Number(r.precio) || 0,
    sena: Number(r.sena) || 0,
    notas: r.notas ?? "",
    creado: r.creado,
  };
}

// ---- Mapeos Inflable (nombres casi idénticos) ----
type InflableRow = {
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
};

function inflableDesde(i: InflableRow): Inflable {
  return {
    id: i.id,
    nombre: i.nombre,
    cat: i.cat,
    precio: Number(i.precio) || 0,
    activo: i.activo,
    color: i.color,
    descripcion: i.descripcion ?? "",
    ancho: i.ancho ?? undefined,
    largo: i.largo ?? undefined,
    alto: i.alto ?? undefined,
  };
}

function inflableHacia(i: Inflable): InflableRow {
  return {
    id: i.id,
    nombre: i.nombre,
    cat: i.cat,
    precio: Number(i.precio) || 0,
    activo: i.activo,
    color: i.color,
    descripcion: i.descripcion ?? "",
    ancho: i.ancho ?? null,
    largo: i.largo ?? null,
    alto: i.alto ?? null,
  };
}

// ---- Carga inicial ----
export async function cargarTodo(): Promise<{
  inflables: Inflable[];
  reservas: Reserva[];
  config: Config;
  categorias: string[];
}> {
  const [inf, res, cfg, cats] = await Promise.all([
    sb().from("inflables").select("*").order("nombre"),
    sb().from("reservas").select("*").order("fecha"),
    sb().from("config").select("*").eq("id", 1).maybeSingle(),
    // Puede no existir todavía (base sin la tabla `categorias`) → se ignora el error.
    sb().from("categorias").select("nombre").eq("activo", true).order("orden"),
  ]);
  if (inf.error) throw inf.error;
  if (res.error) throw res.error;
  if (cfg.error) throw cfg.error;
  return {
    inflables: (inf.data as InflableRow[]).map(inflableDesde),
    reservas: (res.data as ReservaRow[]).map(reservaDesde),
    config: cfg.data
      ? { nombre: (cfg.data as { nombre: string }).nombre ?? "", pin: null }
      : { nombre: "", pin: null },
    categorias: cats.error ? [] : (cats.data as { nombre: string }[]).map((c) => c.nombre),
  };
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

// ---- Inflables ----
export async function upsertInflable(i: Inflable): Promise<void> {
  const { error } = await sb().from("inflables").upsert(inflableHacia(i));
  if (error) throw error;
}

export async function borrarInflable(id: string): Promise<void> {
  const { error } = await sb().from("inflables").delete().eq("id", id);
  if (error) throw error;
}

// ---- Config ----
export async function guardarConfig(nombre: string): Promise<void> {
  const { error } = await sb().from("config").upsert({ id: 1, nombre });
  if (error) throw error;
}

// ---- Operaciones masivas (borrar todo / importar) ----
export async function reemplazarTodo(inflables: Inflable[], reservas: Reserva[]): Promise<void> {
  // Borra todo (filtro que matchea cualquier fila) y reinserta.
  const delRes = await sb().from("reservas").delete().not("id", "is", null);
  if (delRes.error) throw delRes.error;
  const delInf = await sb().from("inflables").delete().not("id", "is", null);
  if (delInf.error) throw delInf.error;
  if (inflables.length) {
    const { error } = await sb().from("inflables").insert(inflables.map(inflableHacia));
    if (error) throw error;
  }
  if (reservas.length) {
    const { error } = await sb().from("reservas").insert(reservas.map(reservaHacia));
    if (error) throw error;
  }
}
