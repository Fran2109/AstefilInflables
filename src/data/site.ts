/**
 * Datos reales del negocio — fuente de verdad. No inventar otros.
 * (WhatsApp principal vive en lib/whatsapp.ts porque lo usan los helpers.)
 */

export const SITIO = {
  nombre: "Astefil Inflables",
  email: "astefil.inflables@gmail.com",
  instagram: { handle: "@astefil.inflables", url: "https://www.instagram.com/astefil.inflables/" },
  facebook: { handle: "/astefilinflables", url: "https://www.facebook.com/astefilinflables/" },
  telefonos: [
    { label: "11 6226-3170 (WhatsApp)", wa: "541162263170" },
    { label: "11 5591-1624 (WhatsApp)", wa: "541155911624" },
  ],
} as const;

/** Palabras del marquee (se duplican al renderizar para el loop infinito). */
export const MARQUEE = [
  "CASTILLOS",
  "CASTILLOS CON RAMPA",
  "CARRERA DE OBSTÁCULOS",
  "ACUÁTICOS",
  "DEPORTIVOS",
  "METEGOL",
  "TEJO DE AIRE",
  "LIVINGS PARA CHICOS",
];

/** Opciones del select del cotizador. "" = sin elegir. */
export const OPCIONES_INFLABLE = [
  "Castillo",
  "Castillo con rampa",
  "Carrera de obstáculos",
  "Inflable acuático",
  "Inflable deportivo",
  "Living para chicos",
  "Juegos de salón",
];

export const OPCIONES_LUGAR = [
  "Casa con patio o jardín",
  "Salón de fiestas",
  "Colegio o jardín de infantes",
  "Club / espacio al aire libre",
  "Otro",
];

/** Pasos de "Cómo funciona" (claims pendientes de confirmar con Francisco). */
export const PASOS = [
  {
    titulo: "Consultás",
    texto:
      "Nos escribís por WhatsApp con la fecha, la zona y el inflable que te gustó. Te pasamos precio y disponibilidad.",
  },
  {
    titulo: "Reservás",
    texto:
      "Confirmamos día y horario, y tu inflable queda apartado para tu fiesta. Así de simple.",
  },
  {
    titulo: "Lo armamos",
    texto:
      "Llegamos antes del evento, armamos todo y lo dejamos listo y seguro para arrancar a saltar.",
  },
  {
    titulo: "¡A disfrutar!",
    texto:
      "Los chicos saltan, vos disfrutás la fiesta. Cuando termina, pasamos a retirarlo. Cero complicaciones.",
  },
];

/** Zonas de cobertura (basadas en Tortuguitas y alrededores; confirmar cobertura real). */
export const ZONAS = [
  "Tortuguitas",
  "Grand Bourg",
  "Los Polvorines",
  "Malvinas Argentinas",
  "José C. Paz",
  "Del Viso",
  "Pilar",
  "Escobar",
];

export const FAQ = [
  {
    q: "¿Cuánto sale alquilar un inflable?",
    a: "Depende del modelo, la fecha y la zona. Escribinos por WhatsApp con esos datos y te pasamos el precio exacto al toque — el cotizador de arriba te arma el mensaje solo.",
  },
  {
    q: "¿Qué necesito tener en casa?",
    a: "Un espacio parejo (pasto, cemento o el piso del salón) del tamaño del inflable y un enchufe cerca para el motor que lo mantiene inflado. Cuando consultes te confirmamos las medidas del modelo que elijas.",
  },
  {
    q: "¿Sirven para salones techados?",
    a: "¡Sí! Tenemos modelos que entran perfecto en salones de fiestas — como ves en las fotos de la galería. Contanos las medidas de tu salón y te recomendamos el ideal.",
  },
  {
    q: "¿Y si llueve el día del evento?",
    a: "Hablanos apenas veas el pronóstico feo y lo resolvemos juntos: reprogramar la fecha o pasar a un modelo para interior si tenés salón.",
  },
  {
    q: "¿Con cuánta anticipación reservo?",
    a: "Cuanto antes, mejor — los fines de semana y las fechas de verano vuelan. Igual escribinos aunque falte poco: si hay disponibilidad, lo hacemos posible.",
  },
];

/**
 * Reseñas reales de Instagram/Facebook (texto + nombre + localidad). Vacío a
 * propósito: se cargan de verdad desde el admin (tabla `testimonios`, vía un
 * ABM a construir). No inventar contenido acá.
 */
export const TESTIMONIOS: { texto: string; quien: string; color: "azul" | "rojo" | "amarillo" }[] = [];
