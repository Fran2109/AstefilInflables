-- ============================================================================
-- Astefil — "¿Qué alquilaste?" pasa a ser una lista
-- ============================================================================
-- Corré esto en Supabase → SQL Editor → New query → Run.
--
-- `articulo text` (uno solo) → `articulos text[]` (los que haya): una fiesta
-- puede llevar el castillo Y el metegol, y el campo anterior obligaba a elegir
-- uno. Sigue siendo opcional: un comentario sin ningún artículo es válido y se
-- guarda como array vacío.
--
-- Los valores que ya estuvieran cargados se conservan (el único artículo pasa
-- a ser el primer elemento de la lista).
--
-- Igual que antes, es TEXTO LIBRE y no FK aunque el formulario lo ofrezca como
-- lista del inventario: un comentario es un testimonio histórico y tiene que
-- seguir diciendo lo que esa persona alquiló, aunque después se renombre o se
-- borre el artículo.
--
-- ⚠️ SEGURIDAD: el INSERT es PÚBLICO. Un array necesita más cotas que un
-- texto, porque hay dos maneras de abusarlo: mandar miles de elementos, o
-- mandar pocos pero gigantes. El CHECK cubre las dos, más el elemento vacío.
-- No se puede acotar elemento por elemento con una subconsulta (Postgres no
-- las admite en un CHECK), así que se acota el largo total del array ya
-- serializado, que es la cota que importa.
-- ============================================================================

alter table public.testimonios
  add column if not exists articulos text[] not null default '{}';

-- Conserva lo ya cargado, si hubiera.
update public.testimonios
   set articulos = array[articulo]
 where articulo is not null and cardinality(articulos) = 0;

alter table public.testimonios drop constraint if exists testimonios_articulo_check;
alter table public.testimonios drop column if exists articulo;

alter table public.testimonios drop constraint if exists testimonios_articulos_check;
alter table public.testimonios add constraint testimonios_articulos_check
  check (
    cardinality(articulos) <= 10
    and '' <> all(articulos)
    and char_length(array_to_string(articulos, ',')) <= 800
  );
