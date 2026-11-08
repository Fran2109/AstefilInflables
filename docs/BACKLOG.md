# Backlog — Astefil Inflables

Priorizado. Antes de tocar nada: leer `CLAUDE.md` (sistema de diseño, convenciones,
verdad vs. placeholder).

## P1 — Contenido real (bloquea promoción seria del sitio)
- [x] **Comentarios con moderación**: la gente los deja desde la landing y se publican al
      aprobarlos en el panel (Comentarios). Reemplazó al `TESTIMONIOS` estático.
- [x] **Cargar el inventario**: los 19 modelos del repo viejo con
      `tools/importar_inventario.py`. Falta confirmar medidas: cada artículo lo avisa en sus
      notas internas, y las medidas se ven en la landing.
- [ ] **Anti-spam de comentarios**: hoy hay honeypot + CHECK de longitud. Si empieza a
      llegar spam, sumar un captcha (Turnstile/hCaptcha): no se puede limitar por IP desde
      la RLS.
- [x] **Cards-categoría del catálogo**: resuelto sacando la tabla `productos` en vez de
      construirle un ABM. El overview "Todos" se deriva de Categorías + Inventario, así que
      cargar un artículo alcanza para publicarlo.
- [ ] **Fotos de Rampa acuática**: es el único modelo sin fotos. Las 4 del repo viejo
      parecen capturas de pantalla y no se cargaron hasta confirmar que son del inflable
      real. Mientras tanto muestra un placeholder on-brand.
- [ ] **Precios**: Francisco define precios base en el admin (Inventario) y decide si se
      publica "desde $X" por categoría en la landing.
- [ ] **Verificar claims**: pasos de "Cómo funciona", bullets del visor y zonas de
      cobertura — confirmar con Francisco que reflejan el servicio real.

## P2 — Conversión
- [x] **Opciones del cotizador**: eran `OPCIONES_INFLABLE`, una lista escrita a mano que no
      coincidía con el inventario. Ahora el select lista los modelos reales, ordenados por
      categoría (Francisco eligió modelos, no categorías).
- [ ] Quiz "¿Cuál me conviene?": 3 preguntas (edad, casa/salón, invitados) → recomienda
      categoría → botón que llama a `precargar()`.
- [ ] Cotizador v2: hint al elegir sábado/domingo y confeti liviano al enviar (respetando
      reduced-motion). Ya no deja elegir fechas pasadas y avisa si el horario termina antes
      de empezar.
- [ ] Barra CTA fija en mobile (aparece al scrollear pasado el hero): "💬 Cotizá tu fecha".
      Hoy solo está el botón flotante de WhatsApp.
- [ ] Countdown honesto en la CTA final: "Quedan N sábados de <mes>" calculado real.

## P3 — Pulido
- [x] **Selectores nativos en reservas**: `ReservaDialog` y los filtros de `ReservasView`
      ya usan `DatePicker`, `TimePicker` y `Select`.
- [ ] **Lo que queda de la auditoría UX/UI (nov 2026)**: cotizador de un solo artículo; la
      franja ofrece Deportivos y Livings que no están en el catálogo; blanco sobre `rojo` da
      4,22:1 en texto chico.

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
- [x] Clicks a WhatsApp por origen: tabla `clics_whatsapp` y vista Métricas del panel.
- [ ] Visitas y de dónde llega la gente (Plausible o GA4): hoy solo se cuentan los clicks,
      así que no hay tasa de conversión.

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
