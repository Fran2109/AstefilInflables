# Astefil Inflables

Sitio y panel de gestión para **Astefil Inflables**, alquiler de inflables y juegos para
cumpleaños y eventos en zona norte/noroeste del Gran Buenos Aires.

Una sola app React con tres partes:

- **Landing** (`/`) — catálogo filtrable con fotos reales, visor de detalle por producto,
  cotizador que arma el mensaje de WhatsApp, zonas y FAQ.
- **Quinta El Esfuerzo** (`/quinta`) — la quinta que se alquila por día: fotos reales,
  comodidades y formulario de consulta propio. La ubicación no se publica: se pasa por
  WhatsApp.
- **Panel admin** (`/admin`) — reservas con detección de conflictos, calendario, inventario,
  ABM de categorías y zonas, equipo y ajustes. **Login real con Supabase Auth y roles**
  (admin / empleado).

> Estado: los datos viven en **Supabase** (Postgres + Auth + RLS + Storage). La app también
> funciona sin `.env`: en ese caso la landing usa los datos estáticos de `src/data/` y el
> admin cae a `localStorage` detrás de un PIN (disuasión casual, no seguridad real).

## Stack

- **React 18 + Vite + TypeScript**
- **Tailwind CSS** — sistema de diseño "neo-brutalismo caramelo" (`tailwind.config.ts` + `src/index.css`)
- **shadcn/ui** (`components.json`) + **Lucide** para íconos
- **React Router** — `/` (landing), `/quinta` y `/admin` (panel)
- **Supabase** (`@supabase/supabase-js`) — base, auth, RLS y Storage de fotos
- **Hosting:** Vercel (`vercel.json` incluye el rewrite de SPA)

## Requisitos

- **Node.js 20+** (probado con 24 LTS). Instalá con `winget install OpenJS.NodeJS.LTS` o desde [nodejs.org](https://nodejs.org).
- Para conectar la base: un proyecto de Supabase y un `.env` con las credenciales (ver abajo).

## Comandos

```bash
npm install      # instalar dependencias (primera vez)
npm run dev      # servidor de desarrollo → http://localhost:5173
npm run build    # tsc -b + vite build (typecheck + producción → /dist)
npm run preview  # previsualizar el build
npm run lint     # linter (no corre en el build)
```

No hay tests: se valida con `npm run build` y probando en el navegador.

## Supabase

1. Copiá `.env.example` a `.env` y completá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
   (Supabase → Project Settings → API). La clave `anon` es pública y segura: la protección
   real es la RLS.
2. En Supabase → SQL Editor, corré `supabase/init.sql`: crea todas las tablas, la RLS, el
   bucket de fotos y un seed mínimo (categorías y zonas). ⚠ Reconstruye desde cero, así que
   **borra las reservas existentes** (no toca los usuarios de `auth.users`).
3. Los usuarios del panel se crean **solo desde el dashboard** (Auth → Users). El primero
   queda como `admin`; los que se crean después arrancan como `empleado` y se les cambia el
   rol desde la vista **Equipo**.

Los demás `.sql` de `supabase/` son migraciones puntuales ya fusionadas en `init.sql`, para
aplicar sobre una base ya viva sin perder datos.

## Estructura

```
/
├── index.html                 # entry de Vite
├── public/                    # assets estáticos (favicon, og-image, img/ con hero y quinta)
├── src/
│   ├── main.tsx / App.tsx      # entrypoint + router
│   ├── index.css               # tokens de diseño (CSS vars) + base
│   ├── lib/                    # supabase, landingDb, whatsapp, placeholder, scroll, utils
│   ├── types/                  # tipos del catálogo
│   ├── data/                   # datos estáticos de la landing (productos, site, quinta)
│   ├── context/                # CatalogoContext (datos) + LandingContext (cotizador/visor)
│   ├── components/
│   │   ├── ui/                 # primitivos (button, select, date/time picker, visor-fotos)
│   │   ├── layout/             # Header, Footer, Logo, WhatsAppFloat
│   │   └── landing/            # secciones de la landing + Visor
│   ├── pages/                  # LandingPage, QuintaPage, AdminPage
│   └── admin/                  # panel: types, lib (db, store, conflictos…), store, components, views
├── supabase/                  # init.sql (molde canónico) + migraciones + reset.sql
├── tools/                     # scripts Python para regenerar og-image y flyer
├── marketing/                 # flyer imprimible + filosofía de diseño
├── docs/BACKLOG.md            # pendientes priorizados
└── legacy-vanilla/            # sitio HTML/JS original archivado (referencia; se puede borrar)
```

Para trabajar en el código conviene leer **`CLAUDE.md`**: ahí están el sistema de diseño, las
convenciones y el detalle de la arquitectura.

## Deploy en Vercel

1. Subí el repo a GitHub.
2. En Vercel, importá el repo. Detecta Vite automáticamente (build: `npm run build`,
   output: `dist`).
3. Cargá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` como **Environment Variables**
   (el `.env` no se sube al repo). Sin eso, el sitio deployado arranca en modo local.
4. `vercel.json` ya incluye el rewrite para que el ruteo de `/quinta` y `/admin` funcione.

## Notas de contenido (verdad vs. placeholder)

La regla del proyecto es **no fingir contenido real que no existe**. Donde falta un dato, la
UI lo dice o usa un placeholder visualmente obvio.

- **Testimonios** (`TESTIMONIOS` en `src/data/site.ts` y tabla `testimonios`): **vacíos a
  propósito**. La sección no se renderiza hasta que haya reseñas reales. No inventar.
- **Productos** (cards-categoría del catálogo): también vacíos; todavía no hay ABM para
  cargarlos desde el admin.
- **Precios**: no se publican a propósito (funnel a "consultá" por WhatsApp). En el admin,
  precio 0 = sin definir.
- **Fotos por modelo**: se suben de verdad desde el admin (Inventario → artículo → fotos) y
  van a Supabase Storage. Un artículo sin fotos muestra un placeholder on-brand, nunca una
  foto ajena.
- **Claims de servicio** ("llegamos, armamos, retiramos", pasos de "Cómo funciona"): están
  pendientes de confirmar con Francisco.
- Si trabajás sin Supabase, el admin guarda todo en `localStorage`: exportá un backup JSON
  desde **Ajustes** cada tanto.

## Datos del negocio

- WhatsApp principal: **11 6226-3170** · Email: astefil.inflables@gmail.com
- Instagram [@astefil.inflables](https://www.instagram.com/astefil.inflables/) · Facebook [/astefilinflables](https://www.facebook.com/astefilinflables/)
- Quinta "El Esfuerzo": alquiler por día de 10 a 20 hs. **La ubicación no se publica** — se
  pasa por WhatsApp.
