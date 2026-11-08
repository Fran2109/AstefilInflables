-- ============================================================================
-- Astefil — Clicks a WhatsApp por origen
-- ============================================================================
-- Corré esto en Supabase → SQL Editor → New query → Run. No toca datos.
--
-- WhatsApp es el funnel y no hay backend de envío: esto cuenta qué botón tocó
-- la gente. No guarda quién fue (ni IP, ni cookie, ni el texto del mensaje).
--
-- SEGURIDAD — es una escritura anónima A PROPÓSITO, acotada así:
--   • `origen` y `pagina` son listas cerradas: no hay dónde meter texto libre.
--   • El `with check` clava `creado` a "ahora": no se pueden cargar fechas viejas.
--   • Leer es solo admin, y va por `resumen_clics` (security invoker).
--   • El alta es solo para `anon`: quien tiene la sesión abierta es del equipo, y
--     sus clicks no son consultas.
--
-- Lo que NO resuelve: alguien puede inflar el conteo armando requests a mano.
-- Son estadísticas, no plata; si pasa, se borran las filas.
-- ============================================================================

create table if not exists public.clics_whatsapp (
  id     uuid primary key default gen_random_uuid(),
  origen text not null check (origen in (
    'hero', 'cotizador', 'catalogo', 'modelo', 'visor', 'zonas', 'cta-final',
    'header', 'flotante', 'footer', 'formulario-quinta', 'otro'
  )),
  pagina text not null check (pagina in ('landing', 'quinta')),
  creado timestamptz not null default now()
);

create index if not exists clics_whatsapp_creado_idx on public.clics_whatsapp (creado desc);

alter table public.clics_whatsapp enable row level security;

drop policy if exists "alta anonima" on public.clics_whatsapp;
create policy "alta anonima" on public.clics_whatsapp
  for insert to anon
  with check (creado between now() - interval '1 minute' and now() + interval '1 minute');

drop policy if exists "lectura admin" on public.clics_whatsapp;
create policy "lectura admin" on public.clics_whatsapp
  for select to authenticated
  using (public.es_admin());

-- Agrupa en la base: traer las filas al cliente se corta en las 1000 de PostgREST.
create or replace function public.resumen_clics(desde timestamptz)
returns table (origen text, pagina text, total integer)
language sql
stable
security invoker
set search_path = ''
as $$
  select c.origen, c.pagina, count(*)::integer
  from public.clics_whatsapp c
  where c.creado >= desde
  group by c.origen, c.pagina
  order by 3 desc;
$$;

revoke execute on function public.resumen_clics(timestamptz) from public, anon;
grant execute on function public.resumen_clics(timestamptz) to authenticated;
