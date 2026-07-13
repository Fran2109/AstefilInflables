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
  con turbina, zonas, `articulos-rename.sql`, `notas-internas.sql`) para aplicar a una base ya
  viva sin perder datos, más `reset.sql` (borra todo, sin reconstruir — usar antes de un
  `init.sql` limpio). Se corren a mano en Supabase → SQL Editor. Al cambiar el esquema,
  actualizar `init.sql` para que la reconstrucción siga fiel.
- **Nombres**: la DB usa **snake_case**; la app usa **camelCase**. El mapeo vive en
  `src/admin/lib/db.ts` (admin) y `src/lib/landingDb.ts` (landing). Mantenerlos en sync.
- **Tablas**: `reservas`, `articulos`, `config`, `categorias`, `zonas`, `perfiles`
  (privadas/mixtas); `productos`, `testimonios` (catálogo público, **vacías por defecto** —
  sin ABM propio todavía, se cargan a mano vía SQL o `db.ts`); vista `catalogo_articulos`
  (columnas seguras de `articulos` activos — **NO expone precio** — para que la landing liste
  modelos). `categorias` y `zonas` sí traen seed real (5 categorías, 8 zonas) porque son
  estructurales, no contenido de marketing. `articulos` reemplazó a la vieja `inflables`: el
  negocio también alquila gazebos, candy bar, estufas, etc., no solo inflables (ver bullet de
  `Categoria` más abajo, esquema de atributos configurables).
- **Storage**: bucket público `inflables` (fotos por modelo, subidas desde `ArticuloDialog` vía
  `admin/lib/db.ts` → `subirFoto`/`borrarFoto`, comprimidas a JPEG en el cliente antes de subir).
  El bucket conserva ese nombre por compatibilidad (detalle interno, no visible) aunque la
  entidad se llame `Articulo`.
  Lectura pública por URL; escritura solo admin (RLS de `storage.objects`).
- **RLS por rol** (ver "Roles"): catálogo → lectura pública, escritura solo admin; inventario
  y config → lectura de cualquier logueado, escritura solo admin; reservas → cualquier
  logueado; perfiles → cada uno el suyo, admin todos.

## Arquitectura — admin (`src/admin/`)

- **Data layer** (`lib/db.ts`): capa relacional contra Supabase (mappers + CRUD por entidad).
  Reemplaza al adaptador `store` cuando `haySupabase`. Asume sesión iniciada (RLS).
- **Estado** (`store/AdminContext.tsx`): mantiene reservas/inventario/config/categorías/zonas/rol.
  **Ramifica por `haySupabase`**: online persiste por acción vía `db.ts`; offline mantiene el
  modelo viejo (estado + `useEffect` que guarda arrays enteros en `store`). Expone acciones CRUD
  + `mostrarToast` + `rol`/`esAdmin` + `cerrarSesion`. Todo se consume con `useAdmin()`.
  **Categorías/zonas online arrancan vacías** (no con el seed local `CATEGORIAS_INICIALES`/
  `ZONAS_INICIALES`) — ese seed es la semilla real solo en modo offline (localStorage, sin
  Supabase). Mostrar una lista local "fantasma" mientras la tabla no existe/está vacía en modo
  online mentiría sobre qué hay guardado de verdad; cada vista maneja su propio estado vacío
  (`Vacio` de `views/comunes.tsx`, también usado en `InventarioView` para `articulos`).
- **Auth**: login real Supabase (email/clave) en `components/Login.tsx`. `AdminContext` escucha
  `onAuthStateChange`, carga el rol y los datos al iniciar sesión. Sin sesión → `AdminPage`
  muestra `<Login>`. En modo offline, cae al `<Gate>` de PIN viejo (disuasión casual).
- **Confirmación de acciones** (`components/Confirm.tsx`): `ConfirmProvider` + `useConfirmar()`
  proveen un modal de confirmación con el estilo del panel (basado en `<Modal>`, promesa
  `await confirmar({titulo, mensaje, textoConfirmar, peligro})`).
- **Modelo** (`types.ts`):
  - `Reserva`: `{id, fecha:'YYYY-MM-DD', estado, cliente, telefono, horaEntrega, horaRetiro,
    articuloIds[], zona, direccion, precio, sena, notas, creado}`
  - `Articulo`: `{id, nombre, cat, precio, activo, color, descripcion?, ancho?, largo?, alto?,
    anchoTurbina?, largoTurbina?, altoTurbina?, fotos?}` (precio 0 = sin definir; `cat` → FK a
    `categorias.nombre`). No es solo inflables: el negocio también alquila gazebos, candy bar,
    pool, metegol, estufas, plaza blanda, etc. — qué atributos de este shape son obligatorios,
    opcionales o no aplican para una categoría dada lo define esa `Categoria` (ver abajo), no el
    tipo `Articulo` en sí (todos los campos quedan opcionales acá; la exigencia es dinámica).
    Medidas "sin turbina" y "con turbina" son grupos independientes; si con-turbina está
    cargado debe ser ≥ que sin-turbina y no las tres iguales — se valida en `ArticuloDialog`,
    que además autocompleta con-turbina al tipear sin-turbina hasta que el usuario las edite a
    mano, y oculta por completo el bloque de turbina si la categoría tiene
    `medidasTurbinaReq: "no_aplica"`; `fotos` = paths en el bucket `inflables` de Storage.
    `notasInternas` es un campo aparte (siempre opcional, no depende de la categoría): notas
    solo para el equipo (estado, ubicación, defectos) — nunca se expone en `catalogo_articulos`
    ni en ningún componente de la landing.
  - `Categoria`: `{id (slug), nombre (único), orden, activo, descripcionReq, medidasReq,
    medidasTurbinaReq, fotosReq}`, cada `*Req` es un `Requisito` (`"obligatorio" | "opcional" |
    "no_aplica"`) que `ArticuloDialog` usa para mostrar/ocultar y exigir/no exigir ese bloque del
    formulario según la categoría elegida — "obligatorio" bloquea "Guardar" si falta (mismo
    criterio que el nombre); "no_aplica" oculta el campo y lo limpia al guardar aunque tuviera
    datos de una categoría anterior. `medidasTurbinaReq` es un único interruptor para el grupo
    completo ancho/largo/alto con turbina (no campo por campo). Editable desde `CategoriaDialog`
    (ABM de Categorías). 5 categorías seed (Castillos, Gigantes, Acuáticos, Juegos, Eventos),
    todas con los 4 `*Req` en `"opcional"` (comportamiento de siempre) — ajustar por categoría
    desde el ABM (ej: una futura categoría "Gazebos" con `medidasTurbinaReq: "no_aplica"`).
  - `Zona`: `{id (slug), nombre (único), orden, activo}` — 8 zonas seed (Tortuguitas, Grand
    Bourg, Los Polvorines, Malvinas Argentinas, José C. Paz, Del Viso, Pilar, Escobar). Alimenta
    "¿Llegamos a tu zona?" de la landing y el `<datalist>` del campo zona/localidad en
    `ReservaDialog` (ahí `zona` sigue siendo texto libre, no FK — borrar una zona no toca
    reservas existentes).
  - `Perfil`: `{id (=auth uid), email, rol}` · `Config`: `{nombre, pin}`
- **Estados** (flujo): Consulta → Reservado → Señado → Entregado → Finalizado; Cancelado
  aparte. Consulta y Cancelado no bloquean inventario. Avanzar estado es un solo paso.
- **Conflictos** (`lib/conflictos.ts` → `conflictosDe`): misma `fecha` + intersección de
  `articuloIds` entre reservas bloqueantes ⇒ aviso en el formulario y tarjeta en rojo.
- **Vistas** (`views/`): Inicio (KPIs), Calendario, Reservas, Inventario, **Categorías** (ABM
  con reordenar/activar/borrar-bloqueado-si-en-uso), **Zonas** (mismo ABM pattern, sin bloqueo
  al borrar porque `Reserva.zona` es texto libre, no FK), **Equipo** (roles, solo admin), Ajustes.

### Roles ADMIN / EMPLEADO

- Tabla `perfiles` + función `es_admin()` (SECURITY DEFINER) + trigger (usuario nuevo =
  `empleado`) + backfill (usuarios existentes = `admin`). Los usuarios se crean **solo desde
  el dashboard de Supabase** (Auth → Users); la app no crea cuentas.
- **Admin** = todo. **Empleado** = operativo: gestiona reservas y ve el resto en lectura; NO
  toca catálogo/inventario, categorías, zonas, equipo ni ajustes.
- Doble capa: RLS lo hace cumplir en la base; la UI lo refleja (`esAdmin` en `useAdmin()`):
  `Rail` filtra los tabs `adminOnly`, `InventarioView` es read-only para empleado, hay botón
  "Cerrar sesión" en el Rail. `EquipoView` deja al admin cambiar roles (no el propio).

## Arquitectura — landing (`src/components/landing/`, ensamblada en `pages/LandingPage.tsx`)

- **`CatalogoProvider`** (`context/CatalogoContext.tsx`): arranca con los datos estáticos de
  `src/data/` (render instantáneo) y, si hay Supabase, los reemplaza por los de la base
  (`lib/landingDb.ts` → `cargarCatalogo`: productos, categorías, zonas, modelos). Fallback
  estático ante error de red. Se consume con `useCatalogo()`. `zonas` sigue la misma regla que
  productos/testimonios (ver "Verdad vs. placeholder"): si la tabla no existe o está vacía, la
  landing lo refleja tal cual — nada de listas estáticas hardcodeadas como red de seguridad.
- **`LandingContext`**: `precargar(valor)` (setea el inflable del cotizador, scrollea y enfoca
  la fecha) + `abrirVisor(cfg)`; renderiza el `<Visor>` una sola vez.
- **Catálogo con filtro** (`Catalogo.tsx`): chips (Todos + categorías). "Todos" muestra las
  cards-categoría (`ProductoCard`, vacío por defecto — ver "Verdad vs. placeholder"); al elegir
  una categoría se listan sus **modelos reales** del inventario (`ModeloCard`) leídos de
  `catalogo_articulos`, con foto real si el admin la subió o un placeholder on-brand si no.
- **Cotizador**: formulario controlado (`DatosCotizacion` en `lib/whatsapp.ts` → `linkCotizacion`
  arma el mensaje/link en vivo); incluye horario tentativo como rango (`horarioDesde`/
  `horarioHasta`, opcionales) y dirección. No hay backend de envío: **WhatsApp ES el funnel**.
- **Galería "Astefil en acción"** (`Galeria.tsx`): hasta 10 inflables al azar (mezcla
  Fisher–Yates recalculada solo cuando cambian los modelos) que ya tengan foto real subida;
  si ninguno tiene foto todavía, muestra un estado vacío honesto en vez de la tira.
- **"¿Llegamos a tu zona?"** (`Zonas.tsx`): chips con `useCatalogo().zonas` (DB o fallback
  estático, ver arriba) — mismo ABM que gestiona el admin.
- **Visor**: lightbox con flechas/teclado/swipe/miniaturas + lista de modelos por categoría.
- **Página `/quinta`** (`pages/QuintaPage.tsx` + `data/quinta.ts`): la quinta "El Esfuerzo",
  que se alquila por día. Contenido **estático a propósito** (sin ABM ni tabla en Supabase:
  es una sola quinta que no cambia seguido — se edita en `data/quinta.ts`). La **ubicación NO
  se publica**: la pasa la respuesta de WhatsApp. Tiene su propio formulario de consulta
  (`FormularioConsulta`, mismo patrón que el Cotizador): nombre, fecha puntual o rango,
  cantidad de personas (mínimo 30, salta de a 5) y motivo (`MOTIVOS_QUINTA`); arma el
  mensaje con `linkConsultaQuinta` (`lib/whatsapp.ts`, que también acepta `extras` del
  catálogo — hoy el formulario no los pide, se sacaron a pedido de Francisco).
  **Fotos reales** en `public/img/quinta/` (portada + galería de 12 exteriores + 6 de eventos
  con inflables), optimizadas con Pillow (luz/color + upscale + afilado, ~1800px JPEG q86)
  desde la carpeta fuente `Quinta/` del repo (gitignoreada por peso; ahí también está el video
  del que se sacó algún cuadro). Toda foto es ampliable con `VisorFotos` (ver "Imágenes
  ampliables"): la portada del hero se maximiza, las dos galerías son carrousel. La sección
  "¿Le sumamos inflables?" (`SeccionInflables`) es cross-sell real —hubo cumpleaños con
  inflables de Astefil en la quinta— y linkea al catálogo de la landing; su layout reordena a
  título→texto→fotos→botón en móvil. El `Header` es route-aware:
  muestra un nav distinto por ruta (landing: sus secciones + "Quinta 🌳" al final como chip
  destacado en amarillo; `/quinta`: Catálogo/Fotos/Consultá). Un link de sección scrollea
  en la página actual si el id existe; si no, vuelve a `/` y scrollea al montarse. El logo
  scrollea al tope de la página actual (ambas tienen `id="inicio"` en su `<main>`).
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
- **Imágenes ampliables**: toda imagen de contenido es clickeable — las individuales (heros,
  portadas) se **maximizan** en un lightbox, y los grupos de imágenes se ven como **carrousel**.
  Para fotos "sueltas" o galerías simples usar `VisorFotos` (`components/ui/visor-fotos.tsx`):
  con una sola foto oculta flechas/contador/miniaturas, con varias es carrousel completo
  (flechas, teclado, swipe, miniaturas). El catálogo usa su `Visor` propio (trae info de
  producto y CTA). El disparador lleva `cursor-zoom-in`. Al agregar una imagen o galería
  nueva, conectarla a uno de estos visores — nada de imágenes "muertas" sin click.
- **Confirmación de acciones que modifican datos**: toda acción del admin que escribe en la
  base (crear, editar, borrar, cambiar estado o rol, activar/desactivar, importar, borrar todo)
  **debe pedir confirmación** con `useConfirmar()` (`const ok = await confirmar({...})`).
  **Nunca** `window.confirm`/`alert`. Usar `peligro: true` si es destructiva o sensible. Tras
  confirmar, avisar con `mostrarToast`. Excepción práctica: reordenar con flechas ↑↓ (bajo
  riesgo, reversible) puede ir sin confirmación.
- Tras cambios, validar con `npm run build` y verificar en el navegador con las herramientas
  de preview.

## Datos reales — fuente de verdad (no inventar otros)

- WhatsApp: **54 11 6226-3170** (`541162263170`) — constante `WHATSAPP` en `src/lib/whatsapp.ts`,
  también en `SITIO.telefonos` (`src/data/site.ts`) para el footer. Único número; no agregar otro.
  Los botones/íconos globales (Header + `WhatsAppFloat`) usan `mensajeConsulta(pathname)`: en
  `/quinta` mandan el prearmado de la quinta (`MSG_QUINTA`), en el resto el de inflables
  (`MSG_INFLABLES`). Si agregás una página con su propio mensaje, se cambia solo ahí.
- Email: astefil.inflables@gmail.com · Instagram: @astefil.inflables · Facebook: /astefilinflables
- Quinta "El Esfuerzo" (página `/quinta`, datos en `data/quinta.ts`): alquiler por día de 10 a
  20 hs; pileta de 3,30 × 8 m con profundidad de 1 a 2,20 m; comodidades reales listadas ahí
  (parrilla, horno, heladeras, etc.); música a volumen moderado; los artículos del catálogo se
  alquilan aparte con costo extra. **Ubicación solo por WhatsApp** — no publicarla.
- URL de producción: definir al deployar en Vercel. Con dominio propio, actualizar `og:*` en
  `index.html`, el JSON-LD, y el QR del flyer (`tools/build_flyer.py`). En Vercel hay que
  cargar `VITE_SUPABASE_*` como Environment Variables (el `.env` no se sube).

## Verdad vs. placeholder — MUY IMPORTANTE

Filosofía: **nunca fingir contenido real que no existe todavía**. Donde falta un dato real, la
UI lo dice explícitamente (texto honesto + CTA a WhatsApp) o usa un placeholder *visualmente*
obvio (`fotoPlaceholder`) — nunca texto o fotos inventadas presentadas como reales.

- **Productos** (`data/productos.ts` `PRODUCTOS` y tabla `productos`) y **testimonios**
  (`data/site.ts` `TESTIMONIOS` y tabla `testimonios`): **vacíos por defecto**, a propósito —
  no hay ABM para cargarlos desde el admin todavía (solo Categorías, Zonas e Inventario lo
  tienen). `Catalogo.tsx` muestra un estado vacío con CTA cuando no hay productos;
  `Testimonios.tsx` directamente no renderiza nada si `TESTIMONIOS` está vacío (no hay link de
  nav a `#testimonios`, así que ocultar la sección entera es seguro). Cargar contenido real a
  mano (SQL o `db.ts`), no inventarlo.
- **Zonas** (tabla `zonas`, ABM completo): misma regla — **sin fallback estático**. Si la tabla
  no existe o está vacía, `Zonas.tsx` muestra un estado honesto ("estamos actualizando
  cobertura" + CTA WhatsApp) en vez de ocultar la sección (sí hay link de nav a `#zonas`, a
  diferencia de testimonios). No reintroducir una lista hardcodeada de localidades como fallback.
- **Precios**: no hay precios publicados a propósito (funnel a "consultá"). En el admin, los
  artículos arrancan con precio 0 = sin definir. No inventar cifras.
- **Claims de servicio** ("llegamos, armamos, retiramos", pasos de "Cómo funciona", bullets del
  visor): plausibles pero **pendientes de confirmación de Francisco**.
- **Fotos por modelo**: el admin ya permite subirlas de verdad (`ArticuloDialog` → Storage). Un
  artículo sin fotos cargadas muestra un `fotoPlaceholder` (banda de color + "FOTO de muestra"),
  nunca una imagen real inventada. El repo viejo (`Fran2109/Astefil_Inflables`,
  `Frontend/src/assets/inflables/*`) tiene fotos reales de los 19 modelos, listas para portar.

## Pendientes

Ver `docs/BACKLOG.md`. Destacados actuales: ABM de Productos y Testimonios en el admin (hoy
Categorías, Zonas e Inventario lo tienen; Productos/Testimonios no), cargar fotos reales por
modelo (la feature de subida ya existe, faltan las fotos), testimonios reales, precios/fichas,
y afinar los claims de servicio con Francisco.
