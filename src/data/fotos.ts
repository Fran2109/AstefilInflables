import type { Foto } from "@/types/catalogo";

/**
 * Fotos reales del catálogo y la galería (~720px, JPEG q68 en /public/img).
 * Workflow para agregar: optimizar → public/img → sumar la clave acá y en el
 * array `fotos` del producto y/o en GALERIA_TODAS (data/productos.ts).
 */
export const FOTOS: Record<string, Foto> = {
  arco: {
    clave: "arco",
    src: "/img/hero.jpg",
    alt: "Castillo inflable de Astefil con arco de colores armado en un jardín",
  },
  castillo: {
    clave: "castillo",
    src: "/img/castillo.jpg",
    alt: "Castillo inflable clásico de colores armado al aire libre",
  },
  rampa: {
    clave: "rampa",
    src: "/img/rampa.jpg",
    alt: "Castillo inflable con rampa y tobogán armado en un salón de fiestas",
  },
  obstaculo: {
    clave: "obstaculo",
    src: "/img/obstaculo.jpg",
    alt: "Inflable gigante de carrera de obstáculos de Astefil",
  },
  acuatico: {
    clave: "acuatico",
    src: "/img/acuatico.jpg",
    alt: "Inflable acuático con tobogán para el verano",
  },
  "rampa-salon": {
    clave: "rampa-salon",
    src: "/img/gal1.jpg",
    alt: "Inflable con rampa armado dentro de un salón",
  },
  "castillo-salon": {
    clave: "castillo-salon",
    src: "/img/gal2.jpg",
    alt: "Castillo inflable de colores en un salón de fiestas",
  },
  noche: {
    clave: "noche",
    src: "/img/gal3.jpg",
    alt: "Inflable iluminado en una fiesta de noche",
  },
  "castillo-parque": {
    clave: "castillo-parque",
    src: "/img/gal4.jpg",
    alt: "Castillo inflable en un parque al aire libre",
  },
  "castillo-pasto": {
    clave: "castillo-pasto",
    src: "/img/gal5.jpg",
    alt: "Castillo inflable armado en el pasto",
  },
};

/** Todas las fotos de la tira "Astefil en acción", en orden. */
export const GALERIA_TODAS: string[] = [
  "arco",
  "castillo",
  "castillo-parque",
  "castillo-pasto",
  "rampa",
  "rampa-salon",
  "castillo-salon",
  "obstaculo",
  "acuatico",
  "noche",
];
