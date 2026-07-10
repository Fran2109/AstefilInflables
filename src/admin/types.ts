/** Estados del flujo de una reserva. Consulta y Cancelado no bloquean inventario. */
export const ESTADOS = [
  "Consulta",
  "Reservado",
  "Señado",
  "Entregado",
  "Finalizado",
  "Cancelado",
] as const;

export type Estado = (typeof ESTADOS)[number];

/** Una reserva. `fecha` en formato 'YYYY-MM-DD'. */
export interface Reserva {
  id: string;
  fecha: string;
  estado: Estado;
  cliente: string;
  telefono: string;
  horaEntrega: string;
  horaRetiro: string;
  inflableIds: string[];
  zona: string;
  direccion: string;
  precio: number;
  sena: number;
  notas: string;
  creado: string;
}

/** Un inflable/juego del inventario. precio 0 = "sin definir". */
export interface Inflable {
  id: string;
  nombre: string;
  cat: string;
  precio: number;
  activo: boolean;
  color: string;
  /** Descripción para ficha/catálogo (opcional). */
  descripcion?: string;
  /** Dimensiones sin turbina, en metros (opcionales): ancho × largo × alto. */
  ancho?: number;
  largo?: number;
  alto?: number;
  /** Dimensiones CON turbina, en metros (opcionales): ≥ que sin turbina, no todas iguales. */
  anchoTurbina?: number;
  largoTurbina?: number;
  altoTurbina?: number;
  /** Fotos del modelo: paths dentro del bucket `inflables` de Supabase Storage. */
  fotos?: string[];
}

/** Rol de un usuario del panel. `admin` = todo; `empleado` = solo operativo (reservas). */
export type Rol = "admin" | "empleado";

/** Perfil de un usuario de Supabase (para la vista Equipo). */
export interface Perfil {
  id: string;
  email: string;
  rol: Rol;
}

/** Una categoría del catálogo. `id` es un slug; `orden` define el orden en las listas. */
export interface Categoria {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
}

/**
 * Una zona de cobertura: alimenta la sección "¿Llegamos a tu zona?" de la
 * landing y las sugerencias del campo zona/localidad al cargar una reserva.
 * `id` es un slug; `orden` define el orden en las listas.
 */
export interface Zona {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
}

/** Config del panel. PIN es disuasión casual, NO seguridad real (todo client-side). */
export interface Config {
  nombre: string;
  /** null = todavía no se definió (primera vez). "" = sin PIN. */
  pin: string | null;
  /** Marca interna: primera vez que se abre el panel. */
  _nuevo?: boolean;
}

/** Modo de persistencia activo (para el chip informativo). */
export type ModoStorage = "navegador" | "memoria";
