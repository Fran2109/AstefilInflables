-- ============================================================================
-- Astefil — Campos opcionales en los comentarios
-- ============================================================================
-- Corré esto en Supabase → SQL Editor → New query → Run.
--
-- Suma cuatro datos que el visitante puede completar o no al dejar su
-- comentario: puntaje, qué alquiló, de qué localidad es y cuándo fue la
-- fiesta. Los cuatro son NULLABLE: un comentario sin ninguno sigue siendo
-- válido, y los que ya estaban cargados no se tocan.
--
-- `articulo` y `localidad` son TEXTO LIBRE, no FK, aunque el formulario los
-- ofrezca como lista desplegable armada con el inventario y las zonas reales.
-- Es a propósito y por el mismo motivo que `reservas.zona`: si mañana se
-- renombra o se borra un artículo, el comentario tiene que seguir diciendo lo
-- que esa persona alquiló de verdad. Un comentario es un testimonio histórico,
-- no una fila que deba seguir al catálogo.
--
-- ⚠️ SEGURIDAD: el INSERT de esta tabla es PÚBLICO (ver
-- `testimonios-moderacion.sql`), así que cada columna nueva necesita su CHECK.
-- Sin eso, el endpoint acepta un `articulo` de megabytes o un puntaje de 10000
-- — la lista desplegable del formulario no protege nada, porque cualquiera
-- puede armar el request a mano con la anon key, que es pública.
-- ============================================================================

alter table public.testimonios
  add column if not exists puntaje      smallint,
  add column if not exists articulo     text,
  add column if not exists localidad    text,
  add column if not exists fecha_evento date;

alter table public.testimonios drop constraint if exists testimonios_puntaje_check;
alter table public.testimonios add constraint testimonios_puntaje_check
  check (puntaje is null or puntaje between 1 and 5);

alter table public.testimonios drop constraint if exists testimonios_articulo_check;
alter table public.testimonios add constraint testimonios_articulo_check
  check (articulo is null or char_length(btrim(articulo)) between 1 and 80);

alter table public.testimonios drop constraint if exists testimonios_localidad_check;
alter table public.testimonios add constraint testimonios_localidad_check
  check (localidad is null or char_length(btrim(localidad)) between 2 and 60);

-- Cota de cordura nada más. El formulario no deja elegir una fecha futura
-- (una opinión habla de una fiesta que ya pasó), pero eso no se puede expresar
-- en un CHECK: `now()` no es inmutable y Postgres no la acepta acá.
alter table public.testimonios drop constraint if exists testimonios_fecha_evento_check;
alter table public.testimonios add constraint testimonios_fecha_evento_check
  check (fecha_evento is null or fecha_evento between date '2015-01-01' and date '2100-01-01');
