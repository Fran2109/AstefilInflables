import { createClient } from "@supabase/supabase-js";

/**
 * Cliente único de Supabase. Las credenciales vienen de variables de entorno
 * (ver `.env.example`). La clave "anon" es segura en el frontend: el control de
 * acceso lo hace Row Level Security en la base, no el secreto de la clave.
 *
 * `haySupabase` permite que la app funcione aún sin `.env` configurado (cae al
 * modo local de siempre) — útil en desarrollo antes de conectar la base.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const haySupabase = Boolean(url && anonKey);

export const supabase = haySupabase
  ? createClient(url as string, anonKey as string)
  : null;
