-- ============================================================================
-- Astefil — Zonas de cobertura (ABM)
-- ============================================================================
-- Corré este archivo en Supabase → SQL Editor → New query → Run.
-- Es idempotente. Ya está incluido en init.sql; este snippet lo aplica a la
-- base viva SIN borrar datos. Requiere que roles.sql ya esté corrido (usa
-- es_admin()).
--
-- Alimenta "¿Llegamos a tu zona?" en la landing y las sugerencias del campo
-- zona/localidad al cargar una reserva en el admin.
-- ============================================================================

create table if not exists public.zonas (
  id     text primary key,
  nombre text not null unique,
  orden  integer not null default 0,
  activo boolean not null default true
);

alter table public.zonas enable row level security;

drop policy if exists "lectura publica" on public.zonas;
create policy "lectura publica" on public.zonas for select using (true);

drop policy if exists "escritura admin" on public.zonas;
create policy "escritura admin" on public.zonas
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- Seed con las zonas reales actuales (no pisa filas si ya existen).
insert into public.zonas (id, nombre, orden) values
  ('tortuguitas',          'Tortuguitas',           1),
  ('grand-bourg',          'Grand Bourg',           2),
  ('los-polvorines',       'Los Polvorines',        3),
  ('malvinas-argentinas',  'Malvinas Argentinas',   4),
  ('jose-c-paz',           'José C. Paz',           5),
  ('del-viso',             'Del Viso',              6),
  ('pilar',                'Pilar',                 7),
  ('escobar',              'Escobar',               8)
on conflict (id) do nothing;
