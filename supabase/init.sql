-- ============================================================================
-- Astefil Inflables — Inicialización COMPLETA de la base (Supabase / Postgres)
-- ============================================================================
-- Este archivo reconstruye la base desde cero. Úsalo cuando quieras "resetear"
-- todo a estado de fábrica.
--
-- Cómo usarlo:
--   Supabase → tu proyecto → SQL Editor → New query → pegá TODO → Run.
--
-- ⚠️  ADVERTENCIA: la sección DROP borra TODAS las tablas de la app y sus datos,
--     incluidas las RESERVAS reales. Tu usuario/login de Supabase (Authentication)
--     NO se toca: seguís entrando con el mismo email y contraseña.
--
-- Modelo de seguridad (RLS):
--   • Público (lectura): categorias, productos, fotos, testimonios + vista
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
drop table if exists public.fotos       cascade;
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

-- Fotos reales del catálogo y la galería (archivos en /public/img).
create table public.fotos (
  clave       text primary key,
  src         text not null,
  alt         text not null default '',
  en_galeria  boolean not null default true,
  orden       integer not null default 0
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
  alto        numeric
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
alter table public.fotos       enable row level security;
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
  foreach t in array array['categorias','fotos','productos','testimonios']
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
-- 3. SEED — datos de fábrica
-- ----------------------------------------------------------------------------

-- Categorías (el `orden` define cómo se listan; editable).
insert into public.categorias (id, nombre, orden) values
  ('castillos', 'Castillos', 1),
  ('gigantes',  'Gigantes',  2),
  ('acuaticos', 'Acuáticos', 3),
  ('juegos',    'Juegos',    4),
  ('eventos',   'Eventos',   5);

-- Fotos (orden = tira "Astefil en acción").
insert into public.fotos (clave, src, alt, en_galeria, orden) values
  ('arco',            '/img/hero.jpg',   'Castillo inflable de Astefil con arco de colores armado en un jardín', true, 0),
  ('castillo',        '/img/castillo.jpg','Castillo inflable clásico de colores armado al aire libre',            true, 1),
  ('castillo-parque', '/img/gal4.jpg',    'Castillo inflable en un parque al aire libre',                         true, 2),
  ('castillo-pasto',  '/img/gal5.jpg',    'Castillo inflable armado en el pasto',                                 true, 3),
  ('rampa',           '/img/rampa.jpg',   'Castillo inflable con rampa y tobogán armado en un salón de fiestas',  true, 4),
  ('rampa-salon',     '/img/gal1.jpg',    'Inflable con rampa armado dentro de un salón',                         true, 5),
  ('castillo-salon',  '/img/gal2.jpg',    'Castillo inflable de colores en un salón de fiestas',                  true, 6),
  ('obstaculo',       '/img/obstaculo.jpg','Inflable gigante de carrera de obstáculos de Astefil',                true, 7),
  ('acuatico',        '/img/acuatico.jpg','Inflable acuático con tobogán para el verano',                         true, 8),
  ('noche',           '/img/gal3.jpg',    'Inflable iluminado en una fiesta de noche',                            true, 9);

-- Productos (cards de la landing). `cats` mapea a categorías del inventario.
-- Castillo con rampa, Deportivo y Living quedan sin modelos por ahora ('{}').
insert into public.productos (id, titulo, tag, desc_corta, desc_larga, fotos, ilustracion_id, cats, orden, activo) values
  ('Castillo', 'Castillos', 'El clásico',
   'El infaltable de todo cumple: paredes altas, base para saltar sin parar y colores que se ven desde la otra cuadra.',
   'El infaltable de todo cumple: paredes altas, base para saltar sin parar y colores que se ven desde la otra cuadra. Anda igual de bien en el patio, el parque o el salón.',
   array['castillo','arco','castillo-parque','castillo-pasto','castillo-salon','noche'], null, array['Castillos'], 0, true),
  ('Castillo con rampa', 'Castillos con rampa', 'Con tobogán',
   'Saltás, trepás la rampa y bajás por el tobogán. Doble diversión en un solo inflable, ideal para salones y jardines.',
   'Saltás, trepás la rampa y bajás por el tobogán. Doble diversión en un solo inflable: acá lo ves armado en salones reales, donde más se luce.',
   array['rampa','rampa-salon'], null, array[]::text[], 1, true),
  ('Carrera de obstáculos', 'Carrera de obstáculos', 'Para valientes',
   'Túneles, barreras y pura adrenalina: los chicos compiten de punta a punta y quieren volver a empezar apenas terminan.',
   'Túneles, barreras y pura adrenalina de punta a punta. Es el más grande de la familia: ideal para patios amplios, clubes y jardines.',
   array['obstaculo'], null, array['Gigantes'], 2, true),
  ('Inflable acuático', 'Acuáticos', 'Verano',
   'Agua + tobogán = el mejor plan para los días de calor. La fiesta se convierte en parque acuático en tu propio patio.',
   'Agua + tobogán = el mejor plan para los días de calor. La fiesta se convierte en parque acuático en tu propio patio.',
   array['acuatico'], null, array['Acuáticos'], 3, true),
  ('Inflable deportivo', 'Deportivos', 'A la cancha',
   'Arcos, canchas y desafíos inflables para picaditos y penales sin fin. Pedinos fotos de los modelos por WhatsApp.',
   'Arcos, canchas y desafíos inflables para picaditos y penales sin fin. Todavía no tenemos fotos publicadas: pedinos las de los modelos por WhatsApp.',
   array[]::text[], 'deportivo', array[]::text[], 4, true),
  ('Living para chicos', 'Livings para chicos', 'Peques',
   'Puffs y muebles blanditos a su medida para que los más peques tengan su rincón cómodo y seguro en la fiesta.',
   'Puffs y muebles blanditos a su medida para que los más peques tengan su rincón cómodo y seguro en la fiesta. Todavía no tenemos fotos publicadas: consultanos por WhatsApp.',
   array[]::text[], 'living', array[]::text[], 5, true);

-- Testimonios PLACEHOLDER (activo=false: no se muestran hasta cargar los reales).
insert into public.testimonios (texto, quien, color, orden, activo) values
  ('Los chicos no se bajaron del castillo en toda la tarde. Llegaron puntuales a armar y lo retiraron sin que nos diéramos cuenta. ¡Súper recomendables!', 'Caro · Grand Bourg', 'azul', 0, false),
  ('Alquilamos el de la rampa para un cumple en salón y fue un éxito total. Muy buena onda para coordinar todo por WhatsApp.', 'Damián · Tortuguitas', 'rojo', 1, false),
  ('El acuático salvó el cumple en pleno enero. Impecable el estado del inflable y la atención. Ya reservamos de nuevo para diciembre.', 'Vane · Del Viso', 'amarillo', 2, false);

-- Inventario real (19 inflables, precio 0 = sin definir, medidas en metros).
insert into public.inflables (nombre, cat, precio, activo, color, ancho, largo, alto, descripcion) values
  -- Castillos
  ('Hombre Araña',          'Castillos', 0, true, '#E8352B', 4.0, 5.0, 2.5,
   '¡Viví la emoción y trepá junto al Hombre Araña! Este castillo de 4x5 metros te hace sentir un auténtico superhéroe, con un diseño increíble para los fanáticos de Spidey. Ideal para fiestas llenas de aventuras.'),
  ('Princesas',             'Castillos', 0, true, '#1F6FD0', 3.0, 4.0, 2.5,
   'Un castillo mágico de 3x4 metros para las reinas y princesas de la casa. Dejate llevar por la fantasía y la diversión en un mundo de ensueño, lleno de colores y detalles. Perfecto para fiestas de cuentos de hadas.'),
  ('Castillo 3x6',          'Castillos', 0, true, '#23B15D', 3.0, 6.0, 2.8,
   'Un castillo amplio y divertido de 3x6 metros para la mejor experiencia de rebote y juegos. Perfecto para grupos grandes y eventos donde la diversión no puede faltar.'),
  ('Castillo 4x5',          'Castillos', 0, true, '#FF7AA2', 4.0, 5.0, 2.5,
   'Diversión compacta y segura en un castillo de 4x5 metros. Espacio suficiente para saltar, reír y disfrutar durante horas. Ideal para celebraciones en familia o con amigos.'),
  ('Castillo 2x2',          'Castillos', 0, true, '#FFC61B', 2.0, 2.0, 2.0,
   'El castillo más compacto de 2x2 metros para espacios reducidos, pero igual de divertido. Perfecto para fiestas chicas o interiores donde los más peques disfrutan sin parar.'),
  -- Gigantes (incluye la carrera de obstáculos, que es la más grande)
  ('Demoledor',             'Gigantes', 0, true, '#8D7F76', 6.0, 8.0, 3.5,
   '¡El gigante Demoledor de 6x8 metros llega para desafiar a los más valientes! Sus dimensiones colosales hacen de tu evento una experiencia inolvidable. ¡Atrevete a saltar en esta máquina de emociones!'),
  ('Arcoíris',              'Gigantes', 0, true, '#E8352B', 5.0, 7.0, 3.2,
   'Sumergite en un arcoíris de alegría y diversión con este gigante inflable de 5x7 metros. Perfecto para añadir color y energía a cualquier evento, ¡los chicos lo adoran!'),
  ('Barco Pirata',          'Gigantes', 0, true, '#1F6FD0', 4.0, 6.0, 3.0,
   '¡A la aventura, marineros! Con este barco pirata inflable de 4x6 metros, los chicos surcan mares imaginarios y viven historias de tesoros escondidos. Perfecto para los pequeños exploradores.'),
  ('Carrera de obstáculos', 'Gigantes', 0, true, '#23B15D', 6.0, 10.0, 3.5,
   '¡Preparate para una competencia de 6x10 metros llena de adrenalina! Este inflable tipo carrera de obstáculos garantiza emoción y diversión en cada salto y curva. Ideal para eventos deportivos y desafíos grupales.'),
  -- Acuáticos
  ('Deslizador',            'Acuáticos', 0, true, '#FF7AA2', 3.0, 8.0, 2.5,
   'Deslizate hacia la diversión con este inflable acuático de 3x8 metros que refresca cualquier día caluroso. Ideal para fiestas de verano y momentos de aventura acuática.'),
  ('Rampa acuática arco',   'Acuáticos', 0, true, '#FFC61B', 4.0, 10.0, 3.0,
   'La rampa acuática en forma de arco de 4x10 metros es una atracción espectacular para chicos y grandes. ¡Deslizate con velocidad y frescura en este tobogán que hace inolvidable el verano!'),
  ('Rampa acuática',        'Acuáticos', 0, true, '#8D7F76', 3.0, 8.0, 2.5,
   'Una clásica rampa acuática de 3x8 metros que brinda pura diversión. Perfecta para días soleados y eventos al aire libre, donde todos disfrutan de una refrescante aventura.'),
  ('Tobogán acuático',      'Acuáticos', 0, true, '#E8352B', 4.0, 9.0, 3.2,
   'El tobogán acuático es el rey de las atracciones veraniegas. Con sus 4x9 metros, asegura una experiencia de emoción, velocidad y frescura que todos recuerdan.'),
  -- Juegos
  ('Metegol',               'Juegos', 0, true, '#1F6FD0', 1.2, 2.0, 0.9,
   'El clásico metegol llega para divertir a chicos y grandes. Con amigos o en familia, ¡armá tu mejor equipo y demostrá tus habilidades en este juego lleno de emoción y destreza!'),
  ('Tejo',                  'Juegos', 0, true, '#23B15D', 1.5, 1.5, 0.8,
   'Un juego clásico que nunca pasa de moda. El tejo es ideal para desafíos entre amigos y familia, con entretenimiento y competencia en cada lanzamiento.'),
  ('Sapo',                  'Juegos', 0, true, '#FF7AA2', 1.0, 1.5, 1.0,
   'Probá tu suerte y precisión en el legendario juego del sapo. Diversión asegurada para todas las edades mientras intentás encestar y sumar puntos.'),
  ('Pool',                  'Juegos', 0, true, '#FFC61B', 2.0, 1.0, 0.8,
   'La elegancia y el desafío del pool ahora en tu evento. Perfecto para compartir un momento competitivo y relajado con amigos y familia.'),
  ('Ping pong',             'Juegos', 0, true, '#8D7F76', 2.7, 1.5, 0.8,
   'La velocidad y la agilidad del ping pong llevan la diversión al máximo. Un deporte clásico y atrapante para jugadores de todas las edades. ¡Desafiá a tus amigos en una partida inolvidable!'),
  ('Yenga',                 'Juegos', 0, true, '#E8352B', 0.5, 0.5, 1.5,
   'Pura emoción y tensión en el juego de destreza más famoso. Con Yenga, la diversión crece a medida que la torre se tambalea. Perfecto para los que aman los desafíos y la estrategia.');

-- Config inicial (fila única).
insert into public.config (id, nombre, pin) values (1, 'Astefil Inflables', null);

-- Perfiles: los usuarios que YA existen en Auth quedan como admin (los fundadores);
-- los que se creen después arrancan como 'empleado' vía el trigger.
insert into public.perfiles (id, email, rol)
select id, email, 'admin' from auth.users
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 4. VISTA PÚBLICA del inventario (solo columnas seguras, sin precio)
-- ----------------------------------------------------------------------------
create view public.catalogo_inflables as
  select id, nombre, cat, descripcion, ancho, largo, alto
  from public.inflables
  where activo = true;

grant select on public.catalogo_inflables to anon, authenticated;
