import type { Inflable, Reserva } from "@/admin/types";
import { uid } from "@/admin/lib/formato";
import { addDias, hoyStr } from "@/admin/lib/fechas";

export const ZONAS = [
  "Tortuguitas", "Grand Bourg", "Los Polvorines", "Malvinas Argentinas",
  "José C. Paz", "Del Viso", "Pilar", "Escobar",
];

export const COLORES = ["#E8352B", "#1F6FD0", "#23B15D", "#FF7AA2", "#FFC61B", "#8D7F76"];

export const CATEGORIAS = [
  "Castillo", "Castillo con rampa", "Carrera de obstáculos", "Acuático",
  "Deportivo", "Juego de salón", "Living", "Otro",
];

/** Inventario semilla = catálogo real. Precio 0 = sin definir. */
export function seedInflables(): Inflable[] {
  const base: [string, string][] = [
    ["Castillo clásico", "Castillo"],
    ["Castillo con rampa", "Castillo con rampa"],
    ["Carrera de obstáculos", "Carrera de obstáculos"],
    ["Inflable acuático", "Acuático"],
    ["Metegol", "Juego de salón"],
    ["Tejo de aire", "Juego de salón"],
    ["Pool", "Juego de salón"],
    ["Ping pong", "Juego de salón"],
    ["Sapo", "Juego de salón"],
    ["Living para chicos", "Living"],
  ];
  return base.map((b, i) => ({
    id: uid(),
    nombre: b[0],
    cat: b[1],
    precio: 0,
    activo: true,
    color: COLORES[i % COLORES.length],
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
