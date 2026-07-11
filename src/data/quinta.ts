/**
 * Datos reales de la quinta "El Esfuerzo" (alquiler por día). Contenido
 * estático A PROPÓSITO: es una sola quinta que no cambia en el corto/mediano
 * plazo, así que no tiene ABM ni tabla en Supabase — se edita acá.
 *
 * La UBICACIÓN no se publica: se pasa por WhatsApp al consultar (decisión de
 * Francisco). No agregar dirección/localidad acá ni en la página.
 */
export const QUINTA = {
  nombre: "El Esfuerzo",
  horario: "de 10 a 20 hs",
  /** Qué incluye el alquiler (lista real, no inventar ítems). */
  comodidades: [
    "Pileta",
    "Baño",
    "Parrilla",
    "Sillas",
    "Mesas",
    "Puff",
    "Horno",
    "Heladeras",
    "Freezer",
    "Panchera",
  ],
  /** Medidas reales de la pileta (texto ya formateado para mostrar). */
  pileta: {
    medidas: "3,30 m de ancho × 8 m de largo",
    profundidad: "de 1 m a 2,20 m",
  },
  /** Condiciones/aclaraciones reales del alquiler. */
  condiciones: [
    "El horario de alquiler es de 10 a 20 hs.",
    "Se puede poner música, a volumen moderado.",
    "Los artículos del catálogo (tobogán acuático, juegos, candy bar, etc.) se alquilan aparte, con costo extra.",
  ],
  /**
   * Fotos REALES de la quinta (optimizadas en `public/img/quinta/` desde la
   * carpeta fuente `Quinta/` del repo, que no se versiona). La portada abre
   * el hero; la galería va en "La quinta en fotos".
   */
  portada: {
    src: "/img/quinta/portada.jpg",
    alt: "Pileta de la quinta El Esfuerzo con la pérgola de troncos y las mesitas de colores al fondo",
  },
  fotos: [
    { src: "/img/quinta/pileta-parque.jpg", alt: "La pileta llena y el parque de la quinta un día de sol" },
    { src: "/img/quinta/casa.jpg", alt: "La casa de la quinta vista desde el parque, con la pileta y la pérgola" },
    { src: "/img/quinta/pergola-mesas.jpg", alt: "Mesas y sillas plegables bajo la pérgola de troncos" },
    { src: "/img/quinta/parque.jpg", alt: "El parque de la quinta con la pérgola, las mesitas de colores y el tanque de agua" },
    { src: "/img/quinta/living.jpg", alt: "Living de banquetas bajo la pérgola, con mesitas de colores y reposeras" },
    { src: "/img/quinta/vista-asador.jpg", alt: "Vista desde el asador: la pérgola con luces, el parque y la pileta al fondo" },
    { src: "/img/quinta/parrilla.jpg", alt: "La parrilla de la quinta encendida, con un asado en la rejilla" },
    { src: "/img/quinta/pileta-cerca.jpg", alt: "La pileta de la quinta de cerca, llena y lista para usar" },
    { src: "/img/quinta/sombrillas.jpg", alt: "Sombrillas, mesas y puffs blancos en el parque, entre las palmeras" },
    { src: "/img/quinta/evento-mesa-larga.jpg", alt: "Mesa larga con manteles armada bajo la pérgola, junto a la pileta" },
    { src: "/img/quinta/parque-luces.jpg", alt: "Rincón del parque con la guirnalda de luces colgantes entre los árboles" },
    { src: "/img/quinta/horno-mesas.jpg", alt: "Sector de mesas blancas del parque, con el horno de barro y la leña al fondo" },
  ],
  /** Eventos reales en la quinta con inflables/artículos de Astefil armados. */
  fotosInflables: [
    {
      src: "/img/quinta/eventos-inflables.jpg",
      alt: "Cumpleaños en la quinta: inflables de Astefil armados junto a la pileta y mesa larga bajo la pérgola",
    },
    {
      src: "/img/quinta/inflables-parque.jpg",
      alt: "Castillo con tobogán y tobogán gigante de Astefil armados en el parque de la quinta",
    },
    {
      src: "/img/quinta/inflables-pileta.jpg",
      alt: "Inflable con tobogán junto a la pileta de la quinta, con los puffs y las sombrillas",
    },
    {
      src: "/img/quinta/tobogan-pileta.jpg",
      alt: "Tobogán acuático de Astefil armado en la cabecera de la pileta de la quinta",
    },
    {
      src: "/img/quinta/tobogan-gigante.jpg",
      alt: "El tobogán gigante de Astefil visto desde el parque de la quinta",
    },
    {
      src: "/img/quinta/cumple-globos.jpg",
      alt: "Cumpleaños bajo la pérgola con globos y la mesa de pool del catálogo en el parque",
    },
  ],
} as const;

/** Opciones del desplegable "Motivo del evento" del formulario de consulta. */
export const MOTIVOS_QUINTA = [
  "Cumpleaños",
  "Egresados",
  "Reunión familiar",
  "Juntada con amigos",
  "Evento empresarial",
  "Otro",
];
