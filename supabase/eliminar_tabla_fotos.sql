-- ============================================================================
-- Astefil — Eliminar la tabla `fotos` (reemplazada por placeholders on-brand)
-- ============================================================================
-- Corré esto en Supabase → SQL Editor → New query → Run.
-- Ya no se usa: la landing genera placeholders en el cliente (sin red) hasta
-- que se carguen fotos reales por inflable (Supabase Storage). No afecta a
-- ninguna otra tabla.
-- ============================================================================

drop table if exists public.fotos cascade;
