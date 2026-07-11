-- ============================================================================
-- Astefil — Notas internas por artículo
-- ============================================================================
-- Corré este archivo en Supabase → SQL Editor → New query → Run.
-- Es idempotente. Ya está incluido en init.sql; este snippet lo aplica a la
-- base viva SIN borrar datos.
--
-- Campo solo para el equipo (estado, ubicación, defectos) — nunca se expone
-- en la landing: no está en la vista pública `catalogo_articulos`.
-- ============================================================================

alter table public.articulos
  add column if not exists notas_internas text not null default '';
