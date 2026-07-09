import type { Producto } from "@/types/catalogo";

/**
 * Fallback estático de las cards-categoría del catálogo (solo se usa sin
 * Supabase o mientras carga). Vacío a propósito: se cargan de verdad desde el
 * admin (tabla `productos`, vía un ABM a construir) — no inventar acá.
 */
export const PRODUCTOS: Producto[] = [];

/** Bullets fijos que muestra el visor de detalle. */
export const BULLETS_VISOR = [
  "Incluye el soplador: solo necesitás un enchufe cerca.",
  "Te confirmamos medidas exactas y precio por WhatsApp.",
];
