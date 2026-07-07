import type { Producto } from "@/types/catalogo";

/**
 * Catálogo real. Los `id` coinciden con las opciones del select del cotizador.
 * Deportivos y Livings todavía no tienen fotos (cards ilustradas con SVG):
 * pedir fotos a Francisco antes de armarles galería.
 */
export const PRODUCTOS: Producto[] = [
  {
    id: "Castillo",
    titulo: "Castillos",
    tag: "El clásico",
    descCorta:
      "El infaltable de todo cumple: paredes altas, base para saltar sin parar y colores que se ven desde la otra cuadra.",
    descLarga:
      "El infaltable de todo cumple: paredes altas, base para saltar sin parar y colores que se ven desde la otra cuadra. Anda igual de bien en el patio, el parque o el salón.",
    fotos: ["castillo", "arco", "castillo-parque", "castillo-pasto", "castillo-salon", "noche"],
    cats: ["Castillos"],
  },
  {
    id: "Castillo con rampa",
    titulo: "Castillos con rampa",
    tag: "Con tobogán",
    descCorta:
      "Saltás, trepás la rampa y bajás por el tobogán. Doble diversión en un solo inflable, ideal para salones y jardines.",
    descLarga:
      "Saltás, trepás la rampa y bajás por el tobogán. Doble diversión en un solo inflable: acá lo ves armado en salones reales, donde más se luce.",
    fotos: ["rampa", "rampa-salon"],
  },
  {
    id: "Carrera de obstáculos",
    titulo: "Carrera de obstáculos",
    tag: "Para valientes",
    descCorta:
      "Túneles, barreras y pura adrenalina: los chicos compiten de punta a punta y quieren volver a empezar apenas terminan.",
    descLarga:
      "Túneles, barreras y pura adrenalina de punta a punta. Es el más grande de la familia: ideal para patios amplios, clubes y jardines.",
    fotos: ["obstaculo"],
    cats: ["Gigantes"],
  },
  {
    id: "Inflable acuático",
    titulo: "Acuáticos",
    tag: "Verano",
    descCorta:
      "Agua + tobogán = el mejor plan para los días de calor. La fiesta se convierte en parque acuático en tu propio patio.",
    descLarga:
      "Agua + tobogán = el mejor plan para los días de calor. La fiesta se convierte en parque acuático en tu propio patio.",
    fotos: ["acuatico"],
    cats: ["Acuáticos"],
  },
  {
    id: "Inflable deportivo",
    titulo: "Deportivos",
    tag: "A la cancha",
    descCorta:
      "Arcos, canchas y desafíos inflables para picaditos y penales sin fin. Pedinos fotos de los modelos por WhatsApp.",
    descLarga:
      "Arcos, canchas y desafíos inflables para picaditos y penales sin fin. Todavía no tenemos fotos publicadas: pedinos las de los modelos por WhatsApp.",
    fotos: [],
    ilustracionId: "deportivo",
  },
  {
    id: "Living para chicos",
    titulo: "Livings para chicos",
    tag: "Peques",
    descCorta:
      "Puffs y muebles blanditos a su medida para que los más peques tengan su rincón cómodo y seguro en la fiesta.",
    descLarga:
      "Puffs y muebles blanditos a su medida para que los más peques tengan su rincón cómodo y seguro en la fiesta. Todavía no tenemos fotos publicadas: consultanos por WhatsApp.",
    fotos: [],
    ilustracionId: "living",
  },
];

/** Bullets fijos que muestra el visor de detalle. */
export const BULLETS_VISOR = [
  "Fotos reales de nuestros equipos, sin retoques.",
  "Incluye el soplador: solo necesitás un enchufe cerca.",
  "Te confirmamos medidas exactas y precio por WhatsApp.",
];
