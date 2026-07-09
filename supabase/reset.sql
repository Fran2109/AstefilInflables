-- ============================================================================
-- Astefil — Reset total de la base (borra TODO lo de la app)
-- ============================================================================
-- Corré esto en Supabase → SQL Editor → New query → Run, y DESPUÉS corré
-- supabase/init.sql completo para reconstruir todo desde cero, ya limpio.
--
-- ⚠️  DESTRUCTIVO: borra las 8 tablas (categorías, fotos, productos, testimonios,
--     inflables, reservas, config, perfiles), la vista catalogo_inflables, las
--     funciones/trigger de roles, y los ARCHIVOS del bucket "inflables" (Storage).
--     NO toca auth.users (tu login de Supabase sigue intacto).
-- ============================================================================

-- Vista primero (depende de inflables)
drop view if exists public.catalogo_inflables cascade;

-- Tablas (cascade por si quedó alguna FK apuntando)
drop table if exists public.reservas    cascade;
drop table if exists public.inflables   cascade;
drop table if exists public.testimonios cascade;
drop table if exists public.productos   cascade;
drop table if exists public.fotos       cascade;
drop table if exists public.categorias  cascade;
drop table if exists public.config      cascade;
drop table if exists public.perfiles    cascade;

-- Función/trigger de roles (el trigger se cae solo al dropear la función con cascade,
-- pero lo dropeamos explícito por prolijidad)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.crear_perfil() cascade;
drop function if exists public.es_admin() cascade;

-- Archivos subidos al bucket de fotos (el bucket en sí se recrea en init.sql)
delete from storage.objects where bucket_id = 'inflables';
delete from storage.buckets where id = 'inflables';
