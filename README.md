# Astefil Inflables

Sitio y panel de gestión para **Astefil Inflables**, alquiler de inflables y juegos para
cumpleaños y eventos en zona norte/noroeste del Gran Buenos Aires.

Una sola app React con dos partes:

- **Landing** (`/`) — catálogo con fotos reales, visor de detalle, cotizador que arma el
  mensaje de WhatsApp, zonas y FAQ.
- **Panel admin** (`/admin`) — reservas con detección de conflictos, calendario,
  inventario y exportes JSON/CSV. Protegido por un PIN (disuasión casual, no seguridad real).

> Estado: la app funciona con **datos locales** (dummy en la landing; `localStorage` en el
> admin a través de un adaptador `store`). La persistencia en la nube (Supabase) es una
> etapa futura y todavía **no** está conectada.

## Stack

- **React 18 + Vite + TypeScript**
- **Tailwind CSS** — sistema de diseño "neo-brutalismo caramelo" (`tailwind.config.ts` + `src/index.css`)
- **shadcn/ui** (`components.json`) + **Lucide** para íconos
- **React Router** — `/` (landing) y `/admin` (panel)
- **Hosting:** Vercel (`vercel.json` incluye el rewrite de SPA)

## Requisitos

- **Node.js 20+** (probado con 24 LTS). Instalá con `winget install OpenJS.NodeJS.LTS` o desde [nodejs.org](https://nodejs.org).

## Comandos

```bash
npm install     # instalar dependencias (primera vez)
npm run dev      # servidor de desarrollo → http://localhost:5173
npm run build    # build de producción a /dist
npm run preview  # previsualizar el build
npm run lint     # linter
```

## Estructura

```
/
├── index.html                 # entry de Vite
├── public/                    # assets estáticos (favicon, og-image, img/ con las fotos)
├── src/
│   ├── main.tsx / App.tsx      # entrypoint + router
│   ├── index.css               # tokens de diseño (CSS vars) + base
│   ├── lib/                    # utils (cn), whatsapp, scroll
│   ├── types/                  # tipos del catálogo
│   ├── data/                   # datos dummy tipados de la landing (productos, fotos, site)
│   ├── context/                # LandingContext (cotizador + visor)
│   ├── components/
│   │   ├── ui/                 # primitivos shadcn/ui (button…)
│   │   ├── layout/             # Header, Footer, Logo, WhatsAppFloat
│   │   └── landing/            # secciones de la landing + Visor
│   ├── pages/                  # LandingPage, AdminPage
│   └── admin/                  # panel: types, lib (store, fechas, conflictos…), store (context), components, views
├── tools/                     # scripts Python para regenerar og-image y flyer
├── marketing/                 # flyer imprimible
├── docs/BACKLOG.md            # pendientes priorizados
└── legacy-vanilla/            # sitio HTML/JS original archivado (referencia; se puede borrar)
```

## Deploy en Vercel

1. Subí el repo a GitHub.
2. En Vercel, importá el repo. Vercel detecta Vite automáticamente
   (build: `npm run build`, output: `dist`).
3. `vercel.json` ya incluye el rewrite para que el ruteo de `/admin` funcione.

## Notas de contenido (verdad vs. placeholder)

- **Testimonios** en `src/data/site.ts` son **PLACEHOLDERS** (⚠) — reemplazar por reseñas reales antes de promocionar.
- **Precios**: no se publican a propósito (funnel a "consultá" por WhatsApp).
- **Deportivos** y **Livings** todavía no tienen fotos (cards ilustradas con SVG).
- El panel admin guarda todo en el navegador (`localStorage`); exportá un backup JSON desde **Ajustes** cada tanto.

## Datos del negocio

- WhatsApp principal: **11 6226-3170** · Email: astefil.inflables@gmail.com
- Instagram [@astefil.inflables](https://www.instagram.com/astefil.inflables/) · Facebook [/astefilinflables](https://www.facebook.com/astefilinflables/)
