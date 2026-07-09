-- ============================================================================
-- Astefil — Medidas con turbina en inflables
-- ============================================================================
-- Corré este archivo en Supabase → SQL Editor → New query → Run.
-- Es idempotente. Ya está incluido en init.sql; este snippet lo aplica a la
-- base viva SIN borrar datos.
--
-- Agrega las dimensiones del inflable CON la turbina puesta (ocupa más espacio).
-- Opcionales; la app valida que sean ≥ que las de sin turbina y no todas iguales.
-- ============================================================================

alter table public.inflables add column if not exists ancho_turbina numeric;
alter table public.inflables add column if not exists largo_turbina numeric;
alter table public.inflables add column if not exists alto_turbina  numeric;
