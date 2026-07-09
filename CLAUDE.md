# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este proyecto

Sitio y panel de gestión para **Astefil Inflables**, negocio real de alquiler de inflables
(castillos, gigantes, acuáticos y juegos de salón) en zona norte/noroeste del Gran Buenos
Aires. Dueño: Francisco (Fran2109 en GitHub).

Una sola app React con dos partes + material de marketing:

1. **Landing pública** (`/`) — captación: catálogo filtrable con fotos reales, visor de
   detalle por producto, cotizador que arma el mensaje de WhatsApp, zonas, FAQ.
2. **Panel admin** (`/admin`) — gestión con **login real y roles**: reservas con detección
   de conflictos, calendario, inventario, ABM de categorías, equipo, ajustes.
3. **Marketing** (`/marketing/`) — flyer imprimible A5 con QR + filosofía de diseño.

Historia: empezó como prototipo HTML/CSS/JS vanilla (archivado en `legacy-vanilla/`, solo
referencia) → se migró a este stack → se conectó Supabase (persistencia real + auth). Hay
un repo previo en GitHub (`Fran2109/Astefil_Inflables`, backend Java Spring + frontend
Angular) usado como fuente de datos reales: de ahí salieron los 19 inflables y sus fotos.

## Stack (respetar)

**React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Lucide.** Ruteo con React
Router. **Backend: Supabase** (`@supabase/supabase-js`) — Postgres + Auth + RLS. Hosting: Vercel.

## Comandos

```bash
npm install            # dependencias (primera vez; sin esto "vite" no existe y el preview no arranca)
npm run dev            # dev server → http://localhost:5173  (/ landing, /admin panel)
npm run build          # tsc -b + vite build (typecheck + build de producción → /dist). Validar SIEMPRE tras cambios.
npm run preview        # previsualizar el build
npm run lint           # eslint (no corre en build; el build solo hace typecheck)

# Assets de marca (una vez: pip install -r tools/requirements.txt)
python tools/build_og_image.py    # → public/og-image.jpg
python tools/build_flyer.py       # → marketing/flyer-astefil.{png,pdf}
```

No hay tests. Validar con `npm run build` y en el navegador con las herramientas de preview
(el screenshot a veces se cuelga en `/admin`; usar `preview_eval` para inspeccionar el DOM).

## Supabase — persistencia, auth y RLS (LEER antes de tocar datos)

- **Credenciales**: en `.env` (gitignoreado), `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
  (ver `.env.example`). El cliente único vive en `src/lib/supabase.ts` y exporta `supabase`
  y `haySupabase`. La `anon key` es pública y segura: **la RLS es la protección real**.
- **La app funciona con y sin Supabase**: si falta el `.env`, `haySupabase` es `false` y el
  admin cae a `localStorage` (adaptador `src/admin/lib/store.ts`) y la landing usa los datos
  estáticos de `src/data/`. Mantener ese fallback al tocar la capa de datos.
- **Esquema de la base**: `supabase/init.sql` reconstruye TODO desde cero (drop + create + RLS
  + Storage + seed mínimo) y es el "molde" canónico — para resetear una base sucia, correrlo
  (⚠ borra reservas; NO toca `auth.users`). El resto de los `.sql` en `supabase/` son
  migraciones puntuales/aditivas ya fusionadas en `init.sql` (roles, storage de fotos, medidas
  con turbina) para aplicar a una base ya viva sin perder datos, más `reset.sql` (borra todo,
  sin reconstruir — usar antes de un `init.sql` limpio). Se corren a mano en Supabase → SQL
  Editor. Al cambiar el esquema, actualizar `init.sql` para que la reconstrucción siga fiel.
- **Nombres**: la DB usa **snake_case**; la app usa **camelCase**. El mapeo vive en
  `src/admin/lib/db.ts` (admin) y `src/lib/landingDb.ts` (landing). Mantenerlos en sync.
- **Tablas**: `reservas`, `inflables`, `config`, `categorias`, `perfiles` (privadas/mixtas);
  `productos`, `testimonios` (catálogo público, **vacías por defecto** — sin ABM propio
  todavía, se cargan a mano vía SQL o `db.ts`); vista `catalogo_inflables` (columnas seguras
  de `inflables` activos — **NO expone precio** — para que la landing liste modelos).
- **Storage**: bucket público `inflables` (fotos por modelo, subidas desde `InflableDialog` vía
  `admin/lib/db.ts` → `subirFoto`/`borrarFoto`, comprimidas a JPEG en el cliente antes de subir).
  Lectura pública por URL; escritura solo admin (RLS de `storage.objects`).
- **RLS por rol** (ver "Roles"): catálogo → lectura pública, escritura solo admin; inventario
  y config → lectura de cualquier logueado, escritura solo admin; reservas → cualquier
  logueado; perfiles → cada uno el suyo, admin todos.

## Arquitectura — admin (`src/admin/`)

- **Data layer** (`lib/db.ts`): capa relacional contra Supabase (mappers + CRUD por entidad).
  Reemplaza al adaptador `store` cuando `haySupabase`. Asume sesión iniciada (RLS).
- **Estado** (`store/AdminContext.tsx`): mantiene reservas/inventario/config/categorías/rol.
  **Ramifica por `haySupabase`**: online persiste por acción vía `db.ts`; offline mantiene el
  modelo viejo (estado + `useEffect` que guarda arrays enteros en `store`). Expone acciones CRUD
  + `mostrarToast` + `rol`/`esAdmin` + `cerrarSesion`. Todo se consume con `useAdmin()`.
- **Auth**: login real Supabase (email/clave) en `components/Login.tsx`. `AdminContext` escucha
  `onAuthStateChange`, carga el rol y los datos al iniciar sesión. Sin sesión → `AdminPage`
  muestra `<Login>`. En modo offline, cae al `<Gate>` de PIN viejo (disuasión casual).
- **Confirmación de acciones** (`components/Confirm.tsx`): `ConfirmProvider` + `useConfirmar()`
  proveen un modal de confirmación con el estilo del panel (basado en `<Modal>`, promesa
  `await confirmar({titulo, mensaje, textoConfirmar, peligro})`).
- **Modelo** (`types.ts`):
  - `Reserva`: `{id, fecha:'YYYY-MM-DD', estado, cliente, telefono, horaEntrega, horaRetiro,
    inflableIds[], zona, direccion, precio, sena, notas, creado}`
  - `Inflable`: `{id, nombre, cat, precio, activo, color, descripcion?, ancho?, largo?, alto?,
    anchoTurbina?, largoTurbina?, altoTurbina?, fotos?}` (precio 0 = sin definir; `cat` → FK a
    `categorias.nombre`; medidas "sin turbina" opcionales, "con turbina" también opcionales
    pero si están cargadas deben ser ≥ que sin turbina y no las tres iguales — se validan en
    `InflableDialog`, que además autocompleta con-turbina al tipear sin-turbina hasta que el
    usuario las edite a mano; `fotos` = paths en el bucket `inflables` de Storage)
  - `Categoria`: `{id (slug), nombre (único), orden, activo}` — 5 seed: Castillos, Gigantes,
    Acuáticos, Juegos, Eventos.
  - `Perfil`: `{id (=auth uid), email, rol}` · `Config`: `{nombre, pin}`
- **Estados** (flujo): Consulta → Reservado → Señado → Entregado → Finalizado; Cancelado
  aparte. Consulta y Cancelado no bloquean inventario. Avanzar estado es un solo paso.
- **Conflictos** (`lib/conflictos.ts` → `conflictosDe`): misma `fecha` + intersección de
  `inflableIds` entre reservas bloqueantes ⇒ aviso en el formulario y tarjeta en rojo.
- **Vistas** (`views/`): Inicio (KPIs), Calendario, Reservas, Inventario, **Categorías** (ABM
  con reordenar/activar/borrar-bloqueado-si-en-uso), **Equipo** (roles, solo admin), Ajustes.

### Roles ADMIN / EMPLEADO

- Tabla `perfiles` + función `es_admin()` (SECURITY DEFINER) + trigger (usuario nuevo =
  `empleado`) + backfill (usuarios existentes = `admin`). Los usuarios se crean **solo desde
  el dashboard de Supabase** (Auth → Users); la app no crea cuentas.
- **Admin** = todo. **Empleado** = operativo: gestiona reservas y ve el resto en lectura; NO
  toca catálogo/inventario, categorías, equipo ni ajustes.
- Doble capa: RLS lo hace cumplir en la base; la UI lo refleja (`esAdmin` en `useAdmin()`):
  `Rail` filtra los tabs `adminOnly`, `InventarioView` es read-only para empleado, hay botón
  "Cerrar sesión" en el Rail. `EquipoView` deja al admin cambiar roles (no el propio).

## Arquitectura — landing (`src/components/landing/`, ensamblada en `pages/LandingPage.tsx`)

- **`CatalogoProvider`** (`context/CatalogoContext.tsx`): arranca con los datos estáticos de
  `src/data/` (render instantáneo) y, si hay Supabase, los reemplaza por los de la base
  (`lib/landingDb.ts` → `cargarCatalogo`: productos, fotos, categorías, modelos). Fallback
  estático ante error. Se consume con `useCatalogo()`.
- **`LandingContext`**: `precargar(valor)` (setea el inflable del cotizador, scrollea y enfoca
  la fecha) + `abrirVisor(cfg)`; renderiza el `<Visor>` una sola vez.
- **Catálogo con filtro** (`Catalogo.tsx`): chips (Todos + categorías). "Todos" muestra las
  cards-categoría (`ProductoCard`, vacío por defecto — ver "Verdad vs. placeholder"); al elegir
  una categoría se listan sus **modelos reales** del inventario (`ModeloCard`) leídos de
  `catalogo_inflables`, con foto real si el admin la subió o un placeholder on-brand si no.
- **Cotizador**: formulario controlado (`DatosCotizacion` en `lib/whatsapp.ts` → `linkCotizacion`
  arma el mensaje/link en vivo); incluye horario tentativo como rango (`horarioDesde`/
  `horarioHasta`, opcionales) y dirección. No hay backend de envío: **WhatsApp ES el funnel**.
- **Galería "Astefil en acción"** (`Galeria.tsx`): hasta 10 inflables al azar (mezcla
  Fisher–Yates recalculada solo cuando cambian los modelos) que ya tengan foto real subida;
  si ninguno tiene foto todavía, muestra un estado vacío honesto en vez de la tira.
- **Visor**: lightbox con flechas/teclado/swipe/miniaturas + lista de modelos por categoría.
- **Placeholders de foto** (`lib/placeholder.ts` → `fotoPlaceholder`): SVG on-brand generado en
  el cliente (sin red), determinístico por clave, para cualquier card sin foto real todavía.
  El `Visor` distingue URLs/paths reales (`http`, `blob:`, `/`) de claves de placeholder.

## Sistema de diseño — "neo-brutalismo caramelo"

Identidad compartida por landing, admin y flyer. Tokens en `tailwind.config.ts` y
`src/index.css` (CSS custom properties + tokens semánticos de shadcn).

| Token (Tailwind / CSS var) | Valor | Uso |
|---|---|---|
| `rojo` | `#E8352B` | primario, CTAs fuertes |
| `amarillo` | `#FFC61B` | acentos, hover, chip activo |
| `azul` | `#1F6FD0` | secundario, links de sección |
| `verde` | `#23B15D` | todo lo WhatsApp / confirmar |
| `rosa` | `#FF7AA2` | acento terciario |
| `cielo` | `#C9E9FF` | fondo landing / login |
| `papel` | `#FFFDF6` | tarjetas / fondo admin |
| `tinta` | `#1B1310` | contornos, texto, sombras |

Patrones no negociables:
- **Bordes de tinta de 3px** (`border-3 border-tinta`), radios generosos.
- **Sombras duras desplazadas** sin blur (`shadow-hard`, `shadow-hard-sm`…).
- **Botones "squish"**: en `:active` se trasladan hacia la sombra y la anulan (ver `Button`).
- Rotaciones leves (±1–4°) en polaroids, stickers y testimonios.
- Tipografías: **Bagel Fat One** (`font-display`), **Baloo 2** (`font-alt`), **Fredoka**
  (`font-body`). De Google Fonts en `index.html`.
- **Logo**: SVG inline (`components/layout/Logo.tsx`). No convertir a `<img>`.
- Respetar `prefers-reduced-motion` y `:focus-visible` (outline azul).

## Convenciones

- **Idioma**: UI en español rioplatense con voseo ("cotizá", "escribinos"). Código
  (variables/funciones/comentarios) también en español.
- TypeScript en todo. Path alias `@/` → `src/`. Precios en ARS con `plata` (`toLocaleString`).
- Combinar clases con `cn()` (`lib/utils.ts`). Estilos con Tailwind + tokens; evitar CSS suelto.
- Reusar el `Button` de `components/ui/` (variantes de marca) en vez de botones ad-hoc.
- **Selectores custom, nunca nativos**: no usar `<select>`, `<input type="date">` ni
  `<input type="time">` — sus popups nativos usan el estilo del sistema operativo y no se
  pueden restylear. Usar `Select`, `DatePicker` y `TimePicker` de `components/ui/` (se usan
  tanto en el admin como en la landing). Mismo patrón los tres: portal a `document.body`,
  panel `position: fixed` calculado desde el trigger (`getBoundingClientRect`), cierre con
  Escape / click afuera / al scrollear la página. Reciben `triggerClassName` para adoptar el
  estilo del formulario que los usa (`campoInputCls` en el admin, `inputCls` en la landing).
  **Ojo al tocarlos**: el listener de "cerrar al scrollear" debe ignorar los scrolls que
  ocurren *dentro* del propio panel (`panelRef.current?.contains(e.target)` antes de cerrar) —
  si no, scrollear una lista larga de opciones (p. ej. las horas del `TimePicker`) cierra el
  panel antes de poder elegir algo.
- **Confirmación de acciones que modifican datos**: toda acción del admin que escribe en la
  base (crear, editar, borrar, cambiar estado o rol, activar/desactivar, importar, borrar todo)
  **debe pedir confirmación** con `useConfirmar()` (`const ok = await confirmar({...})`).
  **Nunca** `window.confirm`/`alert`. Usar `peligro: true` si es destructiva o sensible. Tras
  confirmar, avisar con `mostrarToast`. Excepción práctica: reordenar con flechas ↑↓ (bajo
  riesgo, reversible) puede ir sin confirmación.
- Tras cambios, validar con `npm run build` y verificar en el navegador con las herramientas
  de preview.

## Datos reales — fuente de verdad (no inventar otros)

- WhatsApp principal: **54 11 6226-3170** (`541162263170`) — constante `WHATSAPP` en
  `src/lib/whatsapp.ts`. Secundario: 54 11 5591-1624 (footer, `src/data/site.ts`).
- Email: astefil.inflables@gmail.com · Instagram: @astefil.inflables · Facebook: /astefilinflables
- URL de producción: definir al deployar en Vercel. Con dominio propio, actualizar `og:*` en
  `index.html`, el JSON-LD, y el QR del flyer (`tools/build_flyer.py`). En Vercel hay que
  cargar `VITE_SUPABASE_*` como Environment Variables (el `.env` no se sube).

## Verdad vs. placeholder — MUY IMPORTANTE

Filosofía: **nunca fingir contenido real que no existe todavía**. Donde falta un dato real, la
UI lo dice explícitamente (texto honesto + CTA a WhatsApp) o usa un placeholder *visualmente*
obvio (`fotoPlaceholder`) — nunca texto o fotos inventadas presentadas como reales.

- **Productos** (`data/productos.ts` `PRODUCTOS` y tabla `productos`) y **testimonios**
  (`data/site.ts` `TESTIMONIOS` y tabla `testimonios`): **vacíos por defecto**, a propósito —
  no hay ABM para cargarlos desde el admin todavía (solo Categorías e Inventario lo tienen).
  `Catalogo.tsx` muestra un estado vacío con CTA cuando no hay productos; `Testimonios.tsx`
  directamente no renderiza nada si `TESTIMONIOS` está vacío (no hay link de nav a `#testimonios`,
  así que ocultar la sección entera es seguro). Cargar contenido real a mano (SQL o `db.ts`), no
  inventarlo.
- **Precios**: no hay precios publicados a propósito (funnel a "consultá"). En el admin, los
  inflables arrancan con precio 0 = sin definir. No inventar cifras.
- **Claims de servicio** ("llegamos, armamos, retiramos", pasos de "Cómo funciona", bullets del
  visor): plausibles pero **pendientes de confirmación de Francisco**.
- **Fotos por modelo**: el admin ya permite subirlas de verdad (`InflableDialog` → Storage). Un
  inflable sin fotos cargadas muestra un `fotoPlaceholder` (banda de color + "FOTO de muestra"),
  nunca una imagen real inventada. El repo viejo (`Fran2109/Astefil_Inflables`,
  `Frontend/src/assets/inflables/*`) tiene fotos reales de los 19 modelos, listas para portar.

## Pendientes

Ver `docs/BACKLOG.md`. Destacados actuales: ABM de Productos y Testimonios en el admin (hoy
solo Categorías e Inventario lo tienen), cargar fotos reales por modelo (la feature de subida
ya existe, faltan las fotos), testimonios reales, precios/fichas, y afinar los claims de
servicio con Francisco.
