import type { Inflable, Reserva } from "@/admin/types";
import { uid } from "@/admin/lib/formato";
import { addDias, hoyStr } from "@/admin/lib/fechas";

export const ZONAS = [
  "Tortuguitas", "Grand Bourg", "Los Polvorines", "Malvinas Argentinas",
  "José C. Paz", "Del Viso", "Pilar", "Escobar",
];

export const COLORES = ["#E8352B", "#1F6FD0", "#23B15D", "#FF7AA2", "#FFC61B", "#8D7F76"];

/** Categorías del catálogo. Fallback local; online se leen de la tabla `categorias`. */
export const CATEGORIAS = ["Castillos", "Gigantes", "Acuáticos", "Juegos", "Eventos"];

/** Un ítem del inventario semilla, antes de asignarle id/color. */
type SeedInf = {
  nombre: string;
  cat: string;
  descripcion: string;
  ancho: number;
  largo: number;
  alto: number;
};

/**
 * Inventario semilla = catálogo real de Astefil (19 inflables, dimensiones en
 * metros ancho × largo × alto). Precio 0 = sin definir. Textos tomados del
 * catálogo original del negocio.
 */
const SEED_INFLABLES: SeedInf[] = [
  // Castillos
  { nombre: "Hombre Araña", cat: "Castillos", ancho: 4, largo: 5, alto: 2.5,
    descripcion: "¡Viví la emoción y trepá junto al Hombre Araña! Este castillo de 4x5 metros te hace sentir un auténtico superhéroe, con un diseño increíble para los fanáticos de Spidey. Ideal para fiestas llenas de aventuras." },
  { nombre: "Princesas", cat: "Castillos", ancho: 3, largo: 4, alto: 2.5,
    descripcion: "Un castillo mágico de 3x4 metros para las reinas y princesas de la casa. Dejate llevar por la fantasía y la diversión en un mundo de ensueño, lleno de colores y detalles. Perfecto para fiestas de cuentos de hadas." },
  { nombre: "Castillo 3x6", cat: "Castillos", ancho: 3, largo: 6, alto: 2.8,
    descripcion: "Un castillo amplio y divertido de 3x6 metros para la mejor experiencia de rebote y juegos. Perfecto para grupos grandes y eventos donde la diversión no puede faltar." },
  { nombre: "Castillo 4x5", cat: "Castillos", ancho: 4, largo: 5, alto: 2.5,
    descripcion: "Diversión compacta y segura en un castillo de 4x5 metros. Espacio suficiente para saltar, reír y disfrutar durante horas. Ideal para celebraciones en familia o con amigos." },
  { nombre: "Castillo 2x2", cat: "Castillos", ancho: 2, largo: 2, alto: 2,
    descripcion: "El castillo más compacto de 2x2 metros para espacios reducidos, pero igual de divertido. Perfecto para fiestas chicas o interiores donde los más peques disfrutan sin parar." },
  // Gigantes
  { nombre: "Demoledor", cat: "Gigantes", ancho: 6, largo: 8, alto: 3.5,
    descripcion: "¡El gigante Demoledor de 6x8 metros llega para desafiar a los más valientes! Sus dimensiones colosales hacen de tu evento una experiencia inolvidable. ¡Atrevete a saltar en esta máquina de emociones!" },
  { nombre: "Arcoíris", cat: "Gigantes", ancho: 5, largo: 7, alto: 3.2,
    descripcion: "Sumergite en un arcoíris de alegría y diversión con este gigante inflable de 5x7 metros. Perfecto para añadir color y energía a cualquier evento, ¡los chicos lo adoran!" },
  { nombre: "Barco Pirata", cat: "Gigantes", ancho: 4, largo: 6, alto: 3,
    descripcion: "¡A la aventura, marineros! Con este barco pirata inflable de 4x6 metros, los chicos surcan mares imaginarios y viven historias de tesoros escondidos. Perfecto para los pequeños exploradores." },
  { nombre: "Carrera de obstáculos", cat: "Gigantes", ancho: 6, largo: 10, alto: 3.5,
    descripcion: "¡Preparate para una competencia de 6x10 metros llena de adrenalina! Este inflable tipo carrera de obstáculos garantiza emoción y diversión en cada salto y curva. Ideal para eventos deportivos y desafíos grupales." },
  // Acuáticos
  { nombre: "Deslizador", cat: "Acuáticos", ancho: 3, largo: 8, alto: 2.5,
    descripcion: "Deslizate hacia la diversión con este inflable acuático de 3x8 metros que refresca cualquier día caluroso. Ideal para fiestas de verano y momentos de aventura acuática." },
  { nombre: "Rampa acuática arco", cat: "Acuáticos", ancho: 4, largo: 10, alto: 3,
    descripcion: "La rampa acuática en forma de arco de 4x10 metros es una atracción espectacular para chicos y grandes. ¡Deslizate con velocidad y frescura en este tobogán que hace inolvidable el verano!" },
  { nombre: "Rampa acuática", cat: "Acuáticos", ancho: 3, largo: 8, alto: 2.5,
    descripcion: "Una clásica rampa acuática de 3x8 metros que brinda pura diversión. Perfecta para días soleados y eventos al aire libre, donde todos disfrutan de una refrescante aventura." },
  { nombre: "Tobogán acuático", cat: "Acuáticos", ancho: 4, largo: 9, alto: 3.2,
    descripcion: "El tobogán acuático es el rey de las atracciones veraniegas. Con sus 4x9 metros, asegura una experiencia de emoción, velocidad y frescura que todos recuerdan." },
  // Juegos de salón
  { nombre: "Metegol", cat: "Juegos", ancho: 1.2, largo: 2, alto: 0.9,
    descripcion: "El clásico metegol llega para divertir a chicos y grandes. Con amigos o en familia, ¡armá tu mejor equipo y demostrá tus habilidades en este juego lleno de emoción y destreza!" },
  { nombre: "Tejo", cat: "Juegos", ancho: 1.5, largo: 1.5, alto: 0.8,
    descripcion: "Un juego clásico que nunca pasa de moda. El tejo es ideal para desafíos entre amigos y familia, con entretenimiento y competencia en cada lanzamiento." },
  { nombre: "Sapo", cat: "Juegos", ancho: 1, largo: 1.5, alto: 1,
    descripcion: "Probá tu suerte y precisión en el legendario juego del sapo. Diversión asegurada para todas las edades mientras intentás encestar y sumar puntos." },
  { nombre: "Pool", cat: "Juegos", ancho: 2, largo: 1, alto: 0.8,
    descripcion: "La elegancia y el desafío del pool ahora en tu evento. Perfecto para compartir un momento competitivo y relajado con amigos y familia." },
  { nombre: "Ping pong", cat: "Juegos", ancho: 2.7, largo: 1.5, alto: 0.8,
    descripcion: "La velocidad y la agilidad del ping pong llevan la diversión al máximo. Un deporte clásico y atrapante para jugadores de todas las edades. ¡Desafiá a tus amigos en una partida inolvidable!" },
  { nombre: "Yenga", cat: "Juegos", ancho: 0.5, largo: 0.5, alto: 1.5,
    descripcion: "Pura emoción y tensión en el juego de destreza más famoso. Con Yenga, la diversión crece a medida que la torre se tambalea. Perfecto para los que aman los desafíos y la estrategia." },
];

/** Inventario semilla = catálogo real. Precio 0 = sin definir. */
export function seedInflables(): Inflable[] {
  return SEED_INFLABLES.map((b, i) => ({
    id: uid(),
    nombre: b.nombre,
    cat: b.cat,
    precio: 0,
    activo: true,
    color: COLORES[i % COLORES.length],
    descripcion: b.descripcion,
    ancho: b.ancho,
    largo: b.largo,
    alto: b.alto,
  }));
}

/** Reservas de ejemplo (marcadas "Ejemplo"). Incluye un conflicto a propósito el día +2. */
export function reservasEjemplo(inflables: Inflable[]): Reserva[] {
  const ids = inflables.map((i) => i.id);
  const hoy = hoyStr();
  const base = [
    { fecha: addDias(hoy, 2), estado: "Señado", cliente: "Ejemplo — Caro", telefono: "11 5555-0001", zona: "Grand Bourg", direccion: "Av. Siempreviva 742", horaEntrega: "10:00", horaRetiro: "19:00", inflableIds: [ids[0]], precio: 45000, sena: 15000, notas: "Dato de ejemplo" },
    { fecha: addDias(hoy, 2), estado: "Reservado", cliente: "Ejemplo — Damián", telefono: "11 5555-0002", zona: "Tortuguitas", direccion: "Los Ceibos 120", horaEntrega: "11:00", horaRetiro: "18:00", inflableIds: [ids[1], ids[4]], precio: 78000, sena: 20000, notas: "Dato de ejemplo · salón techado" },
    { fecha: addDias(hoy, 5), estado: "Consulta", cliente: "Ejemplo — Vane", telefono: "11 5555-0003", zona: "Del Viso", inflableIds: [ids[3]], precio: 0, sena: 0, notas: "Dato de ejemplo · pregunta por acuático" },
    { fecha: addDias(hoy, 9), estado: "Reservado", cliente: "Ejemplo — Marcos", telefono: "11 5555-0004", zona: "Pilar", direccion: "B° Los Álamos", horaEntrega: "12:00", horaRetiro: "20:00", inflableIds: [ids[0]], precio: 52000, sena: 0, notas: "Dato de ejemplo" },
    { fecha: addDias(hoy, -6), estado: "Finalizado", cliente: "Ejemplo — Sole", telefono: "11 5555-0005", zona: "Escobar", inflableIds: [ids[2]], precio: 60000, sena: 60000, horaEntrega: "10:30", horaRetiro: "19:30", notas: "Dato de ejemplo" },
  ];
  return base.map((r) => ({
    horaEntrega: "",
    horaRetiro: "",
    direccion: "",
    ...r,
    id: uid(),
    creado: new Date().toISOString(),
  })) as Reserva[];
}
