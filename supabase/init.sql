-- ============================================================================
-- Astefil Inflables — Inicialización de la base (Supabase / Postgres)
-- ============================================================================
-- Este archivo reconstruye TODO el esquema desde cero (tablas, RLS, vista,
-- Storage), pero solo carga datos de fábrica en **categorías** y **roles**
-- (perfiles). El resto de las tablas (productos, testimonios, inflables,
-- config) quedan creadas pero VACÍAS — se cargan a mano desde el admin
-- (Inventario, Categorías, Ajustes) o con un script de carga aparte.
--
-- No hay tabla de fotos: la landing muestra placeholders on-brand generados
-- en el cliente (`src/lib/placeholder.ts`) hasta que se carguen fotos reales
-- por inflable (columna `inflables.fotos`, vía Supabase Storage).
--
-- Cómo usarlo:
--   Supabase → tu proyecto → SQL Editor → New query → pegá TODO → Run.
--
-- ⚠️  ADVERTENCIA: la sección DROP borra TODAS las tablas de la app y sus datos,
--     incluidas las RESERVAS reales. Tu usuario/login de Supabase (Authentication)
--     NO se toca: seguís entrando con el mismo email y contraseña.
--
-- Modelo de seguridad (RLS):
--   • Público (lectura): categorias, productos, testimonios + vista
--     catalogo_inflables. Escritura solo con sesión iniciada.
--   • Privado (solo con sesión): inflables, reservas, config.
--
-- Nombres: columnas en snake_case (convención Postgres); la app mapea a camelCase.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 0. RESET (borra todo lo de la app; NO toca auth.users)
-- ----------------------------------------------------------------------------
drop view  if exists public.catalogo_inflables cascade;
drop table if exists public.reservas    cascade;
drop table if exists public.inflables   cascade;
drop table if exists public.testimonios cascade;
drop table if exists public.productos   cascade;
drop table if exists public.fotos       cascade;  -- por si quedó de una versión vieja
drop table if exists public.categorias  cascade;
drop table if exists public.config      cascade;
drop table if exists public.perfiles    cascade;
-- (auth.users NO se toca; el trigger y la función se recrean abajo)
drop function if exists public.es_admin() cascade;

-- ----------------------------------------------------------------------------
-- 1. TABLAS
-- ----------------------------------------------------------------------------

-- Categorías del catálogo (primer nivel). `id` = slug; `nombre` visible.
create table public.categorias (
  id     text primary key,
  nombre text not null unique,
  orden  integer not null default 0,
  activo boolean not null default true
);

-- Productos/categorías-card del catálogo público (landing). El id coincide con
-- el select del cotizador. `cats` mapea la card a categorías del inventario.
create table public.productos (
  id             text primary key,
  titulo         text not null,
  tag            text not null default '',
  desc_corta     text not null default '',
  desc_larga     text not null default '',
  fotos          text[] not null default '{}',
  ilustracion_id text,
  cats           text[] not null default '{}',
  orden          integer not null default 0,
  activo         boolean not null default true
);

-- Testimonios de la landing (seed = placeholders con activo=false).
create table public.testimonios (
  id     uuid primary key default gen_random_uuid(),
  texto  text not null,
  quien  text not null,
  color  text not null default 'azul',
  orden  integer not null default 0,
  activo boolean not null default true
);

-- Inventario. precio 0 = sin definir. Dimensiones en metros (ancho × largo × alto).
-- `cat` referencia categorias.nombre (se actualiza en cascada si se renombra).
create table public.inflables (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  cat         text not null references public.categorias(nombre) on update cascade,
  precio      numeric not null default 0,
  activo      boolean not null default true,
  color       text not null default '#8D7F76',
  descripcion text not null default '',
  ancho       numeric,
  largo       numeric,
  alto        numeric,
  ancho_turbina numeric,  -- medidas con la turbina puesta (ocupa más); opcionales
  largo_turbina numeric,
  alto_turbina  numeric,
  fotos       text[] not null default '{}'  -- paths en el bucket `inflables` de Storage
);

-- Reservas. fecha 'YYYY-MM-DD'. inflable_ids referencia inflables.id.
create table public.reservas (
  id            uuid primary key default gen_random_uuid(),
  fecha         date not null,
  estado        text not null default 'Consulta',
  cliente       text not null default '',
  telefono      text not null default '',
  hora_entrega  text not null default '',
  hora_retiro   text not null default '',
  inflable_ids  uuid[] not null default '{}',
  zona          text not null default '',
  direccion     text not null default '',
  precio        numeric not null default 0,
  sena          numeric not null default 0,
  notas         text not null default '',
  creado        timestamptz not null default now()
);

-- Config del panel (fila única id=1).
create table public.config (
  id     integer primary key default 1 check (id = 1),
  nombre text not null default '',
  pin    text
);

-- Perfiles: 1 fila por usuario de Supabase, con su rol (admin/empleado).
create table public.perfiles (
  id     uuid primary key references auth.users(id) on delete cascade,
  email  text,
  rol    text not null default 'empleado' check (rol in ('admin', 'empleado')),
  creado timestamptz not null default now()
);

-- Función de rol (SECURITY DEFINER: no recursa contra la RLS de perfiles).
create or replace function public.es_admin()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin');
$$;
grant execute on function public.es_admin() to anon, authenticated;

-- Trigger: cada usuario nuevo arranca como 'empleado'.
create or replace function public.crear_perfil()
returns trigger language plpgsql security definer
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

-- ----------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (por rol)
-- ----------------------------------------------------------------------------
alter table public.categorias  enable row level security;
alter table public.productos   enable row level security;
alter table public.testimonios enable row level security;
alter table public.inflables   enable row level security;
alter table public.reservas    enable row level security;
alter table public.config      enable row level security;
alter table public.perfiles    enable row level security;

-- Catálogo público: lectura para todos, escritura SOLO admin.
do $$
declare t text;
begin
  foreach t in array array['categorias','productos','testimonios']
  loop
    execute format('create policy "lectura publica" on public.%I for select using (true)', t);
    execute format('create policy "escritura admin" on public.%I for all to authenticated using (public.es_admin()) with check (public.es_admin())', t);
  end loop;
end $$;

-- Inventario y config: lectura de cualquier logueado, escritura SOLO admin.
do $$
declare t text;
begin
  foreach t in array array['inflables','config']
  loop
    execute format('create policy "lectura autenticada" on public.%I for select to authenticated using (true)', t);
    execute format('create policy "escritura admin" on public.%I for all to authenticated using (public.es_admin()) with check (public.es_admin())', t);
  end loop;
end $$;

-- Reservas: cualquier usuario logueado (admin o empleado) las gestiona.
create policy "solo autenticados" on public.reservas
  for all to authenticated using (true) with check (true);

-- Perfiles: cada uno ve el suyo; el admin ve y edita todos.
create policy "perfil propio o admin lee" on public.perfiles
  for select to authenticated using (id = auth.uid() or public.es_admin());
create policy "admin gestiona perfiles" on public.perfiles
  for update to authenticated using (public.es_admin()) with check (public.es_admin());

-- ----------------------------------------------------------------------------
-- 3. SEED — solo categorías y roles. El resto de las tablas (fotos, productos,
--    testimonios, inflables, config) quedan creadas pero VACÍAS: se cargan a
--    mano desde el admin o con un script de carga aparte.
-- ----------------------------------------------------------------------------

-- Categorías (el `orden` define cómo se listan; editable).
insert into public.categorias (id, nombre, orden) values
  ('castillos', 'Castillos', 1),
  ('gigantes',  'Gigantes',  2),
  ('acuaticos', 'Acuáticos', 3),
  ('juegos',    'Juegos',    4),
  ('eventos',   'Eventos',   5);

-- Perfiles: los usuarios que YA existen en Auth quedan como admin (los fundadores);
-- los que se creen después arrancan como 'empleado' vía el trigger.
insert into public.perfiles (id, email, rol)
select id, email, 'admin' from auth.users
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 4. VISTA PÚBLICA del inventario (solo columnas seguras, sin precio)
-- ----------------------------------------------------------------------------
create view public.catalogo_inflables as
  select id, nombre, cat, descripcion, ancho, largo, alto, fotos
  from public.inflables
  where activo = true;

grant select on public.catalogo_inflables to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. STORAGE — fotos por modelo (bucket público `inflables`)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('inflables', 'inflables', true)
on conflict (id) do update set public = true;

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
