-- ============================================================================
-- Astefil — Eliminar la tabla `productos` (el catálogo sale del inventario)
-- ============================================================================
-- Corré esto en Supabase → SQL Editor → New query → Run.
--
-- `productos` guardaba las cards del overview "Todos" del catálogo: una lista
-- curada a mano (título, tag, descripciones, fotos, y un `cats` que mapeaba
-- cada card a categorías del inventario). Era una segunda copia de algo que el
-- inventario ya sabe, y nunca tuvo ABM: al estar vacía, la landing mostraba
-- "Estamos armando el catálogo" aunque hubiera artículos cargados.
--
-- Ahora la landing arma ese overview en el cliente desde `categorias` + la
-- vista `catalogo_articulos`: una card por categoría con artículos, con la
-- foto de uno de sus modelos y la lista de los que hay. Cargar un artículo en
-- Inventario es lo único que hace falta para que aparezca publicado.
--
-- No afecta a ninguna otra tabla: nada tenía FK contra `productos`.
-- ============================================================================

drop table if exists public.productos cascade;
