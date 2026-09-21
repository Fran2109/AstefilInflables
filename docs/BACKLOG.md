# Backlog — Astefil Inflables

Priorizado. Antes de tocar nada: leer `CLAUDE.md` (sistema de diseño, convenciones,
verdad vs. placeholder).

## P1 — Contenido real (bloquea promoción seria del sitio)
- [ ] **Testimonios reales**: `TESTIMONIOS` (`src/data/site.ts`) y la tabla `testimonios`
      están vacíos a propósito y la sección no se renderiza. Cargar reseñas verdaderas de
      IG/Facebook (texto + nombre + localidad). No inventar.
- [ ] **ABM de Testimonios en el admin**: hoy Categorías, Zonas e Inventario tienen ABM;
      testimonios no, así que hay que cargarlos a mano por SQL. Es el bloqueo real del punto
      de arriba.
- [x] **Cards-categoría del catálogo**: resuelto sacando la tabla `productos` en vez de
      construirle un ABM. El overview "Todos" se deriva de Categorías + Inventario, así que
      cargar un artículo alcanza para publicarlo.
- [ ] **Fotos reales por modelo**: la subida ya funciona (Inventario → artículo → fotos →
      Supabase Storage); faltan las fotos. El repo viejo (`Fran2109/Astefil_Inflables`,
      `Frontend/src/assets/inflables/*`) tiene las de los 19 modelos, listas para portar.
      Mientras tanto cada card muestra un placeholder on-brand.
- [ ] **Precios**: Francisco define precios base en el admin (Inventario) y decide si se
      publica "desde $X" por categoría en la landing.
- [ ] **Verificar claims**: pasos de "Cómo funciona", bullets del visor y zonas de
      cobertura — confirmar con Francisco que reflejan el servicio real.

## P2 — Conversión
- [ ] **Opciones del cotizador vs. catálogo real**: `OPCIONES_INFLABLE` (`src/data/site.ts`)
      es una lista escrita a mano ("Castillo con rampa", "Inflable deportivo", "Living para
      chicos") que no coincide con las categorías ni con el inventario. Antes casi no se
      notaba; ahora el botón "¡Lo quiero!" del overview precarga el nombre de la categoría
      real ("Castillos") y el select muestra ese valor arriba de opciones de otro vocabulario.
      Decidir con Francisco si el select lista categorías, modelos reales o ambos — y
      derivarlo de `useCatalogo()` en vez de tenerlo hardcodeado.
- [ ] Quiz "¿Cuál me conviene?": 3 preguntas (edad, casa/salón, invitados) → recomienda
      categoría → botón que llama a `precargar()`.
- [ ] Cotizador v2: que el `DatePicker` no deje elegir fechas pasadas (hoy resalta el día
      de hoy pero no tiene mínimo), hint al elegir sábado/domingo, y confeti liviano al
      enviar (respetando reduced-motion). El campo de horario ya está (rango desde/hasta).
- [ ] Barra CTA fija en mobile (aparece al scrollear pasado el hero): "💬 Cotizá tu fecha".
      Hoy solo está el botón flotante de WhatsApp.
- [ ] Countdown honesto en la CTA final: "Quedan N sábados de <mes>" calculado real.

## P3 — Pulido
- [x] Lightbox / visor de detalle por producto con galería.
- [x] Visor de fotos genérico (`VisorFotos`) para heros y galerías de la quinta.
- [ ] Scrollspy en el nav + header compacto al scrollear (el header ya es sticky).
- [ ] Botón compartir (Web Share API con fallback a copiar link).
- [x] **JSON-LD**: `LocalBusiness` + `FAQPage`, inyectados en el build por el plugin
      `jsonLd` de `vite.config.ts` desde `src/data/site.ts` (sin duplicar el FAQ). Sin
      `url`, `address` ni `priceRange`: no hay dato real todavía. Pendiente fino: el
      mismo JSON-LD viaja a `/quinta` y `/admin` por ser una SPA con un solo
      `index.html` — si molesta, mover el `FAQPage` a la landing.
- [ ] Falta `og:url` en `index.html` (están el resto de los `og:*`) — cargarlo cuando haya
      dominio definitivo.

## P4 — Medición
- [ ] Analytics liviano (Plausible o GA4) + evento en cada click a WhatsApp
      (cotizador, cards, visor, flotante, CTA final) para medir conversión por origen.
      No hay nada instalado todavía.

## P5 — Admin (evolución)
- [x] Persistencia multi-dispositivo: resuelto con Supabase (Postgres + Auth + RLS).
- [x] Login real con roles admin/empleado.
- [x] ABM de Categorías (con atributos por categoría) y de Zonas.
- [ ] Vista "Caja": cobrado vs. pendiente por mes. Inicio ya muestra "Ingresos del mes",
      pero no el desglose de lo que falta cobrar.
- [ ] Recordatorio de backup: menos urgente ahora que los datos viven en Supabase, pero el
      export JSON de Ajustes sigue estando y conviene avisar si pasó mucho sin usarlo.

## P6 — Infra
- [ ] Dominio propio (.com.ar) → actualizar `og:*` de `index.html`, sumar el JSON-LD y
      cambiar `URL_SITIO` en `tools/build_flyer.py` (hoy apunta a `fran2109.github.io`) para
      reimprimir el QR.
- [ ] Embeds de posts reales de Instagram en la sección galería (probar ya deployado).
- [ ] Google Business Profile con el link del sitio.
