-- ============================================================================
-- Astefil — Renombrar "Inflable" → "Artículo" + atributos configurables por categoría
-- ============================================================================
-- Corré este archivo en Supabase → SQL Editor → New query → Run.
-- Es idempotente y NO borra datos (rename de tabla/columna/vista conserva todo:
-- filas, índices, FKs, políticas de RLS). Aplica a la base viva.
--
-- Por qué: el negocio alquila más que inflables (gazebos, candy bar, estufas,
-- plaza blanda), así que la entidad "Inflable" pasa a llamarse "Artículo" y
-- cada categoría puede marcar qué atributos (descripción, medidas, medidas
-- con turbina, fotos) son obligatorios / opcionales / no aplican para sus
-- artículos — así un gazebo no pide "medida con turbina".
-- ============================================================================

-- 1. Renombrar tabla, columna y vista (Postgres actualiza FKs/RLS/dependencias solo).
alter table if exists public.inflables rename to articulos;
alter table if exists public.reservas rename column inflable_ids to articulo_ids;
alter view if exists public.catalogo_inflables rename to catalogo_articulos;

-- 2. Atributos configurables por categoría (default 'opcional' = comportamiento actual).
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='categorias' and column_name='descripcion_req') then
    alter table public.categorias add column descripcion_req text not null default 'opcional'
      check (descripcion_req in ('obligatorio','opcional','no_aplica'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='categorias' and column_name='medidas_req') then
    alter table public.categorias add column medidas_req text not null default 'opcional'
      check (medidas_req in ('obligatorio','opcional','no_aplica'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='categorias' and column_name='medidas_turbina_req') then
    alter table public.categorias add column medidas_turbina_req text not null default 'opcional'
      check (medidas_turbina_req in ('obligatorio','opcional','no_aplica'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='categorias' and column_name='fotos_req') then
    alter table public.categorias add column fotos_req text not null default 'opcional'
      check (fotos_req in ('obligatorio','opcional','no_aplica'));
  end if;
end $$;
