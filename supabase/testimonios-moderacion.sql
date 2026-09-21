-- ============================================================================
-- Astefil — Moderación de testimonios (alta pública + aprobar/rechazar)
-- ============================================================================
-- Corré esto en Supabase → SQL Editor → New query → Run.
--
-- QUÉ CAMBIA
-- `testimonios` existía desde el init original pero nunca se conectó: la
-- landing leía un array estático vacío. Esto la pone en uso con un circuito de
-- moderación real:
--
--   1. Cualquiera (sin sesión) deja un comentario → entra como 'pendiente'.
--   2. Un admin lo aprueba o lo rechaza desde el panel.
--   3. Aprobado → se publica, ordenado del más reciente al más antiguo.
--      Rechazado → no lo ve nunca nadie que no sea admin.
--
-- El estado es reversible: un aprobado se puede volver a pendiente o rechazar
-- sin borrarlo.
--
-- Columnas que se van: `orden` y `activo` (los reemplazan `creado` y `estado`)
-- y `color` (el color y la rotación de cada tarjeta se derivan de la posición
-- al renderizar, así no hay que elegirlos a mano en cada moderación).
--
-- ⚠️ La tabla está vacía, así que esto no pierde datos. Si en tu base tuviera
--    filas, los tres `drop column` se las llevarían puestas.
--
-- SEGURIDAD — esto abre una escritura anónima A PROPÓSITO, así que está acotada
-- en tres frentes:
--   • El INSERT público tiene `with check (estado = 'pendiente')`. Eso CLAVA el
--     estado: aunque alguien arme el request a mano con la anon key (que es
--     pública), no puede darse de alta ya aprobado.
--   • El SELECT público solo ve `estado = 'aprobado'`. Un pendiente o un
--     rechazado son invisibles para cualquiera sin sesión de admin.
--   • Los CHECK de longitud acotan el abuso (y de paso evitan el comentario
--     vacío o el de 50 KB).
--
-- Lo que NO resuelve: spam automatizado. El endpoint es público por diseño. El
-- formulario suma un honeypot, que frena bots tontos; si algún día llega spam
-- en serio, el paso siguiente es un captcha (Turnstile/hCaptcha) — no hay forma
-- razonable de limitar por IP desde la RLS.
-- ============================================================================

-- 1. Estructura
alter table public.testimonios drop column if exists orden;
alter table public.testimonios drop column if exists activo;
alter table public.testimonios drop column if exists color;

alter table public.testimonios
  add column if not exists estado text not null default 'pendiente',
  add column if not exists creado timestamptz not null default now();

alter table public.testimonios drop constraint if exists testimonios_estado_check;
alter table public.testimonios add constraint testimonios_estado_check
  check (estado in ('pendiente', 'aprobado', 'rechazado'));

-- Cotas de tamaño: sin esto el endpoint público acepta un comentario vacío o
-- uno de megabytes.
alter table public.testimonios drop constraint if exists testimonios_texto_check;
alter table public.testimonios add constraint testimonios_texto_check
  check (char_length(btrim(texto)) between 3 and 600);

alter table public.testimonios drop constraint if exists testimonios_quien_check;
alter table public.testimonios add constraint testimonios_quien_check
  check (char_length(btrim(quien)) between 2 and 60);

-- La consulta pública es siempre "aprobados, del más nuevo al más viejo".
drop index if exists public.testimonios_publicos_idx;
create index testimonios_publicos_idx
  on public.testimonios (creado desc) where estado = 'aprobado';

-- 2. RLS — se reemplazan las políticas viejas (eran del catálogo curado a mano)
drop policy if exists "lectura publica"   on public.testimonios;
drop policy if exists "escritura admin"   on public.testimonios;
drop policy if exists "lectura publica aprobados" on public.testimonios;
drop policy if exists "alta publica"      on public.testimonios;
drop policy if exists "moderacion admin"  on public.testimonios;

-- Solo lo aprobado sale a la luz.
create policy "lectura publica aprobados" on public.testimonios
  for select using (estado = 'aprobado');

-- Cualquiera puede dejar un comentario, pero SIEMPRE como pendiente.
create policy "alta publica" on public.testimonios
  for insert to anon, authenticated
  with check (estado = 'pendiente');

-- Moderar (ver todo, aprobar, rechazar, borrar) es solo del admin.
create policy "moderacion admin" on public.testimonios
  for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
