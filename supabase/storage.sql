-- ============================================================================
-- Astefil — Fotos por modelo (Supabase Storage)
-- ============================================================================
-- Corré este archivo en Supabase → SQL Editor → New query → Run.
-- Es idempotente. Ya está incluido en init.sql; este snippet lo aplica a la
-- base viva SIN borrar datos. Requiere que roles.sql ya esté corrido (usa es_admin()).
--
-- Qué hace:
--   1. Columna `fotos text[]` en inflables (paths dentro del bucket).
--   2. Expone `fotos` en la vista pública catalogo_inflables (para la landing).
--   3. Bucket de Storage `inflables` PÚBLICO (lectura por URL para cualquiera).
--   4. Políticas: subir/editar/borrar archivos SOLO admin; leer público.
-- ============================================================================

-- 1. Columna de fotos (paths de Storage)
alter table public.inflables add column if not exists fotos text[] not null default '{}';

-- 2. Vista pública con las fotos incluidas (NO expone precio)
create or replace view public.catalogo_inflables as
  select id, nombre, cat, descripcion, ancho, largo, alto, fotos
  from public.inflables
  where activo = true;
grant select on public.catalogo_inflables to anon, authenticated;

-- 3. Bucket público
insert into storage.buckets (id, name, public)
values ('inflables', 'inflables', true)
on conflict (id) do update set public = true;

-- 4. Políticas del bucket (sobre storage.objects)
drop policy if exists "inflables leer publico" on storage.objects;
create policy "inflables leer publico" on storage.objects
  for select using (bucket_id = 'inflables');

drop policy if exists "inflables subir admin" on storage.objects;
create policy "inflables subir admin" on storage.objects
  for insert to authenticated with check (bucket_id = 'inflables' and public.es_admin());

drop policy if exists "inflables actualizar admin" on storage.objects;
create policy "inflables actualizar admin" on storage.objects
  for update to authenticated using (bucket_id = 'inflables' and public.es_admin());

drop policy if exists "inflables borrar admin" on storage.objects;
create policy "inflables borrar admin" on storage.objects
  for delete to authenticated using (bucket_id = 'inflables' and public.es_admin());
