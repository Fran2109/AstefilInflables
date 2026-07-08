-- ============================================================================
-- Astefil — Roles ADMIN / EMPLEADO (control de acceso por rol)
-- ============================================================================
-- Corré este archivo en Supabase → SQL Editor → New query → Run.
-- Es idempotente. Ya está incluido en init.sql; este snippet lo aplica a la
-- base viva SIN borrar datos.
--
-- Qué hace:
--   1. Tabla `perfiles` (1 fila por usuario de Supabase) con su `rol`.
--   2. Trigger: cada usuario nuevo arranca como 'empleado'.
--   3. Backfill: los usuarios YA existentes quedan como 'admin' (sos vos).
--   4. Función es_admin() para usar en las políticas.
--   5. RLS por rol:
--      • Catálogo (categorias, productos, fotos, testimonios) e inventario/config:
--        escritura SOLO admin. Lectura: pública (catálogo) o autenticada (inventario/config).
--      • Reservas: cualquier usuario logueado (admin o empleado) las gestiona.
-- ============================================================================

-- 1. Tabla de perfiles ligada a auth.users
create table if not exists public.perfiles (
  id     uuid primary key references auth.users(id) on delete cascade,
  email  text,
  rol    text not null default 'empleado' check (rol in ('admin', 'empleado')),
  creado timestamptz not null default now()
);
alter table public.perfiles enable row level security;

-- 4. Función de rol (SECURITY DEFINER: no recursa contra la RLS de perfiles)
create or replace function public.es_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.perfiles where id = auth.uid() and rol = 'admin'
  );
$$;
grant execute on function public.es_admin() to anon, authenticated;

-- 2. Trigger: alta automática de perfil (rol 'empleado' por defecto)
create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, email, rol)
  values (new.id, new.email, 'empleado')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- 3. Backfill: los usuarios que YA existen quedan como admin (los fundadores).
insert into public.perfiles (id, email, rol)
select id, email, 'admin' from auth.users
on conflict (id) do nothing;

-- RLS de perfiles: cada uno ve el suyo; el admin ve y edita todos.
drop policy if exists "perfil propio o admin lee" on public.perfiles;
create policy "perfil propio o admin lee" on public.perfiles
  for select to authenticated using (id = auth.uid() or public.es_admin());

drop policy if exists "admin gestiona perfiles" on public.perfiles;
create policy "admin gestiona perfiles" on public.perfiles
  for update to authenticated using (public.es_admin()) with check (public.es_admin());

-- 5a. Catálogo público: lectura pública (queda igual), escritura SOLO admin.
do $$
declare t text;
begin
  foreach t in array array['categorias','fotos','productos','testimonios']
  loop
    execute format('drop policy if exists "escritura autenticada" on public.%I', t);
    execute format('drop policy if exists "escritura admin" on public.%I', t);
    execute format('create policy "escritura admin" on public.%I for all to authenticated using (public.es_admin()) with check (public.es_admin())', t);
  end loop;
end $$;

-- 5b. Inventario y config: lectura de cualquier logueado, escritura SOLO admin.
do $$
declare t text;
begin
  foreach t in array array['inflables','config']
  loop
    execute format('drop policy if exists "solo autenticados" on public.%I', t);
    execute format('drop policy if exists "lectura autenticada" on public.%I', t);
    execute format('drop policy if exists "escritura admin" on public.%I', t);
    execute format('create policy "lectura autenticada" on public.%I for select to authenticated using (true)', t);
    execute format('create policy "escritura admin" on public.%I for all to authenticated using (public.es_admin()) with check (public.es_admin())', t);
  end loop;
end $$;

-- 5c. Reservas: cualquier usuario logueado (admin o empleado) las gestiona.
--     (La política "solo autenticados" de init.sql ya hace esto; se deja igual.)
