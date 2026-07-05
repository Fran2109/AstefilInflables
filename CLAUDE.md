# CLAUDE.md — Astefil Inflables

## Qué es este proyecto

Sitio y panel de gestión para **Astefil Inflables**, negocio real de alquiler de inflables
(castillos, rampas, obstáculos, acuáticos y juegos de salón) en zona norte/noroeste del
Gran Buenos Aires. Dueño: Francisco (Fran2109 en GitHub).

Una sola app React con dos partes + material de marketing:

1. **Landing pública** (`/`) — captación: catálogo con fotos reales, visor de detalle por
   producto, cotizador que arma el mensaje de WhatsApp, zonas, FAQ.
2. **Panel admin** (`/admin`) — gestión: reservas con detección de conflictos, calendario,
   inventario, exportes JSON/CSV. PIN de acceso (disuasión casual, no seguridad real).
3. **Marketing** (`/marketing/`) — flyer imprimible A5 con QR + filosofía de diseño.

## Stack (respetar)

**React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Lucide.** Ruteo con React
Router. Hosting: Vercel. Backend futuro (todavía **no** conectado): Supabase.

Historia: el proyecto empezó como prototipo HTML/CSS/JS vanilla de un solo archivo.
Francisco decidió migrarlo a este stack; la migración de landing y admin está hecha. El
sitio vanilla original quedó archivado en `legacy-vanilla/` (solo referencia).

Estado de datos: la app anda con **datos locales**. La landing usa datos dummy tipados en
`src/data/`; el admin persiste en `localStorage` a través del adaptador `store`. Cuando se
conecte Supabase, se reemplaza la implementación de `src/admin/lib/store.ts` y los imports
de `src/data/` por queries, **manteniendo los tipos**.

## Estructura del repo

```
/                      ← raíz = app React (deploy en Vercel)
├── index.html         ← entry de Vite
├── vite.config.ts · tsconfig*.json · tailwind.config.ts · postcss.config.js
├── components.json    ← config de shadcn/ui · vercel.json ← rewrite SPA
├── public/            ← assets estáticos: favicon.svg, apple-touch-icon.png, og-image.jpg, img/ (10 fotos ~720px q68)
├── src/
│   ├── main.tsx · App.tsx        ← entrypoint + router (/ y /admin)
│   ├── index.css                 ← tokens de diseño (CSS vars) + tokens semánticos shadcn + clases base
│   ├── lib/                      ← utils (cn), whatsapp (funnel), scroll
│   ├── types/catalogo.ts         ← tipos del catálogo
│   ├── data/                     ← datos dummy tipados: productos.ts, fotos.ts, site.ts
│   ├── context/LandingContext.tsx ← coordina cotizador (precarga) + visor entre secciones
│   ├── components/
│   │   ├── ui/button.tsx         ← Button con cva (variantes de marca + "squish")
│   │   ├── layout/               ← Header, Footer, Logo (SVG inline), WhatsAppFloat
│   │   └── landing/              ← secciones + Visor (lightbox)
│   ├── pages/                    ← LandingPage, AdminPage
│   └── admin/                    ← panel (ver sección Admin)
├── tools/             ← scripts Python: build_og_image.py, build_flyer.py (leen public/img)
├── marketing/         ← flyer-astefil.pdf/.png + flyer-filosofia.md
├── docs/BACKLOG.md    ← pendientes priorizados
└── legacy-vanilla/    ← sitio vanilla original archivado (index.html + admin/)
```

## Datos reales — fuente de verdad (no inventar otros)

- WhatsApp principal: **54 11 6226-3170** (`541162263170`) — constante `WHATSAPP` en
  `src/lib/whatsapp.ts`; lo usan cotizador, botón flotante y CTAs. Secundario:
  54 11 5591-1624 (solo footer, en `src/data/site.ts`).
- Email: astefil.inflables@gmail.com · Instagram: @astefil.inflables · Facebook: /astefilinflables
- Datos del sitio centralizados en `src/data/site.ts` (`SITIO`, zonas, FAQ, pasos, etc.).
- URL de producción: definir al deployar en Vercel. Si se usa dominio propio, actualizar
  `og:*` en `index.html`, el JSON-LD, y el QR del flyer (`tools/build_flyer.py`).

## Sistema de diseño — "neo-brutalismo caramelo"

Identidad compartida por landing, admin y flyer. Tokens en `tailwind.config.ts` (colores,
sombras, fuentes) y `src/index.css` (CSS custom properties + tokens semánticos de shadcn).

| Token (Tailwind / CSS var) | Valor | Uso |
|---|---|---|
| `rojo` / `--rojo` | `#E8352B` | primario, CTAs fuertes |
| `amarillo` / `--amarillo` | `#FFC61B` | acentos, hover, stickers |
| `azul` / `--azul` | `#1F6FD0` | secundario, links de sección |
| `verde` / `--verde` | `#23B15D` | todo lo WhatsApp |
| `rosa` / `--rosa` | `#FF7AA2` | acento terciario |
| `cielo` / `--cielo` | `#C9E9FF` | fondo landing |
| `papel` / `--papel` | `#FFFDF6` | tarjetas / fondo admin |
| `tinta` / `--tinta` | `#1B1310` | contornos, texto, sombras |

Patrones no negociables:
- **Bordes de tinta de 3px** (`border-3 border-tinta`) en todo componente, radios generosos.
- **Sombras duras desplazadas** sin blur (`shadow-hard`, `shadow-hard-sm`, `shadow-hard-lg`…).
- **Botones "squish"**: en `:active` se trasladan hacia la sombra y la anulan (ver `Button`).
- Rotaciones leves (±1–4°) en polaroids, stickers y testimonios.
- Tipografías: **Bagel Fat One** (`font-display`, títulos), **Baloo 2** (`font-alt`,
  subtítulos/botones), **Fredoka** (`font-body`, cuerpo). Cargadas de Google Fonts en `index.html`.
- **Logo**: SVG inline (`components/layout/Logo.tsx`), variante footer por prop. No convertir a `<img>`.
- Respetar `prefers-reduced-motion` (regla global en `index.css`) y `:focus-visible` (outline azul).

## Arquitectura — landing

Secciones (en `src/components/landing/`, ensambladas en `pages/LandingPage.tsx`): Header →
Hero → Marquee → Catalogo (6 cards: 4 con foto + 2 SVG) → Galeria → Testimonios (⚠
PLACEHOLDER) → Cotizador → ComoFunciona → Zonas → Faq → CtaFinal → Footer + WhatsAppFloat.

- **`LandingContext`** provee `precargar(valor)` (setea el inflable del cotizador, scrollea
  y enfoca la fecha) y `abrirVisor(cfg)`; renderiza el `<Visor>` una sola vez.
- **Cotizador**: formulario controlado; `linkCotizacion()` (en `lib/whatsapp.ts`) arma el
  link de WhatsApp en vivo. No hay backend: WhatsApp ES el funnel.
- **Visor**: lightbox con flechas, teclado, swipe y miniaturas; con 1 foto oculta flechas/thumbs.
- **Datos**: `PRODUCTOS` (`data/productos.ts`) mapea cada inflable a `{id, titulo, tag,
  desc, fotos[]}`; `FOTOS` y `GALERIA_TODAS` en `data/fotos.ts`. Deportivos y Livings sin
  foto usan ilustración SVG (`ilustracionId`).

Agregar una foto: optimizar ~720px JPEG q68 → `public/img/` → sumar la clave a
`FOTOS` (`data/fotos.ts`) y al array `fotos` del producto y/o a `GALERIA_TODAS`.

## Arquitectura — admin (`src/admin/`)

- **Storage adapter** (`lib/store.ts`): `store.get/set/del` async sobre `localStorage`
  (→ memoria si falla). Es la ÚNICA capa que toca el almacenamiento y la costura para
  Supabase. Claves: `astefil:reservas`, `astefil:inflables`, `astefil:config`.
  No usar `localStorage` directo en el resto del admin: siempre a través de `store`.
- **Estado**: `store/AdminContext.tsx` mantiene reservas/inventario/config y persiste vía
  `useEffect` cuando cambian; expone acciones CRUD + `mostrarToast`. Vistas y diálogos lo
  consumen con `useAdmin()`.
- **Modelo** (`types.ts`):
  - `Reserva`: `{id, fecha:'YYYY-MM-DD', estado, cliente, telefono, horaEntrega, horaRetiro,
    inflableIds[], zona, direccion, precio, sena, notas, creado}`
  - `Inflable`: `{id, nombre, cat, precio, activo, color}` (seed = catálogo real, precio 0 = sin definir)
  - `Config`: `{nombre, pin}` — PIN es disuasión casual, NO seguridad real. Mantener esa honestidad en la UI.
- **Estados** (flujo): Consulta → Reservado → Señado → Entregado → Finalizado; Cancelado
  aparte. Consulta y Cancelado no bloquean inventario.
- **Conflictos** (`lib/conflictos.ts` → `conflictosDe`): misma `fecha` + intersección de
  `inflableIds` entre reservas bloqueantes ⇒ aviso en el formulario y tarjeta en rojo.
- **Vistas** (`views/`): Inicio (KPIs + próximas entregas + barras de ingresos), Calendario,
  Reservas (filtros + conflictos + avance de estado + WhatsApp), Inventario, Ajustes
  (export JSON/CSV, importar, ejemplos, borrar todo).
- WhatsApp al cliente: `lib/whatsapp.ts` → `linkWaCliente()`; `telWa()` (en `lib/formato.ts`)
  normaliza a `549…`; mensajes distintos para Consulta vs. confirmación.

## Convenciones

- **Idioma**: UI en español rioplatense con voseo ("cotizá", "escribinos"). Código
  (variables/funciones/comentarios) también en español.
- TypeScript en todo. Path alias `@/` → `src/`.
- Precios en ARS con `toLocaleString("es-AR")` (helper `plata`).
- Combinar clases con `cn()` (`lib/utils.ts`). Estilos con Tailwind + tokens; evitar CSS suelto.
- Reusar el `Button` de `components/ui/` (variantes de marca) en vez de botones ad-hoc.
- Tras cambios, validar con `npm run build` (typecheck + build). Verificar en el navegador
  con las herramientas de preview (el screenshot se cuelga en `/admin`; usar `preview_eval`).

## Verdad vs. placeholder — MUY IMPORTANTE

- **Testimonios** (`data/site.ts`, `TESTIMONIOS`): los 3 son **PLACEHOLDERS** (⚠).
  Reemplazar por reseñas reales de IG/Facebook antes de promocionar. No inventar.
- **Precios**: no hay precios publicados a propósito (funnel a "consultá"). En el admin,
  los inflables arrancan con precio 0 = sin definir. No inventar cifras.
- **Claims de servicio** ("llegamos, armamos, retiramos", pasos de "Cómo funciona",
  bullets del visor): plausibles pero **pendientes de confirmación de Francisco**.
- **Zonas**: lista basada en Tortuguitas y alrededores; confirmar cobertura real.
- Deportivos y Livings no tienen fotos todavía (cards SVG); pedirlas antes de armarles galería.

## Comandos útiles

```bash
npm install            # dependencias (primera vez)
npm run dev            # dev server → http://localhost:5173  (/ landing, /admin panel)
npm run build          # typecheck + build de producción → /dist
npm run preview        # previsualizar el build
npm run lint           # linter

# Regenerar assets de marca (una vez: pip install -r tools/requirements.txt)
python tools/build_og_image.py    # → public/og-image.jpg
python tools/build_flyer.py       # → marketing/flyer-astefil.{png,pdf}
```

## Pendientes

Ver `docs/BACKLOG.md`. Destacados: testimonios reales, precios/fichas, fotos de Deportivos
y Livings, y **conectar Supabase** (persistencia real multi-dispositivo) reemplazando el
adaptador `store` y los datos dummy de la landing, manteniendo los tipos.
