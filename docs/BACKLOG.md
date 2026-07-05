# Backlog — Astefil Inflables

Priorizado. Antes de tocar nada: leer `CLAUDE.md` (sistema de diseño, convenciones,
verdad vs. placeholder).

## P1 — Contenido real (bloquea promoción seria del sitio)
- [ ] **Testimonios reales**: reemplazar los 3 placeholders de "Familias que ya saltaron"
      por reseñas verdaderas de IG/Facebook (texto + nombre + localidad). Están marcados
      con comentario `⚠` en `index.html`. No inventar.
- [ ] **Precios**: Francisco define precios base en el admin (Inventario) y decide si se
      publica "desde $X" por categoría en la landing.
- [ ] **Fotos de Deportivos y Livings**: optimizar (~720px, JPEG q68) → `img/` →
      convertir esas 2 cards SVG en cards con foto + galería en `PRODUCTOS`.
- [ ] **Verificar claims**: pasos de "Cómo funciona", bullets del visor y zonas de
      cobertura — confirmar con Francisco que reflejan el servicio real.

## P2 — Conversión
- [ ] Quiz "¿Cuál me conviene?": 3 preguntas (edad, casa/salón, invitados) → recomienda
      categoría → botón que llama a `precargar()`.
- [ ] Cotizador v2: `min` = hoy en la fecha, hint al elegir sábado/domingo, campo de
      horas, confeti liviano al enviar (respetando reduced-motion).
- [ ] Barra CTA fija en mobile (aparece al scrollear pasado el hero): "💬 Cotizá tu fecha".
- [ ] Countdown honesto en la CTA final: "Quedan N sábados de <mes>" calculado real.

## P3 — Pulido
- [x] Lightbox / visor de detalle por producto con galería (hecho).
- [ ] Scrollspy en el nav + header compacto al scrollear.
- [ ] Botón compartir (Web Share API con fallback a copiar link).
- [ ] JSON-LD `FAQPage` con las 5 preguntas del FAQ.

## P4 — Medición
- [ ] Analytics liviano (Plausible o GA4) + evento en cada click a WhatsApp
      (cotizador, cards, visor, flotante, CTA final) para medir conversión por origen.

## P5 — Admin (evolución)
- [ ] Persistencia multi-dispositivo: evaluar Google Sheets vía Apps Script o un backend
      mínimo; mantener el adaptador `store` como interfaz.
- [ ] Recordatorio de backup (aviso si pasaron >30 días del último export).
- [ ] Vista "Caja": cobrado vs. pendiente por mes.

## P6 — Infra
- [ ] Dominio propio (.com.ar) → actualizar og:url/og:image/JSON-LD + `URL_SITIO` del
      flyer y reimprimir QR.
- [ ] Embeds de posts reales de Instagram en la sección galería (probar ya deployado).
- [ ] Google Business Profile con el link del sitio.
