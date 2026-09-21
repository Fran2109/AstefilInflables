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
  articuloIds: string[];
  zona: string;
  direccion: string;
  precio: number;
  sena: number;
  notas: string;
  creado: string;
}

/** Un artículo del inventario (inflable u otro rubro: gazebo, candy bar, etc.). precio 0 = "sin definir". */
export interface Articulo {
  id: string;
  nombre: string;
  cat: string;
  precio: number;
  activo: boolean;
  color: string;
  /** Descripción para ficha/catálogo (obligatoria/opcional/no aplica según Categoria.descripcionReq). */
  descripcion?: string;
  /** Dimensiones sin turbina, en metros (obligatorias/opcionales/no aplica según Categoria.medidasReq). */
  ancho?: number;
  largo?: number;
  alto?: number;
  /** Dimensiones CON turbina, en metros (≥ que sin turbina, no todas iguales); según Categoria.medidasTurbinaReq. */
  anchoTurbina?: number;
  largoTurbina?: number;
  altoTurbina?: number;
  /** Fotos del artículo: paths dentro del bucket `inflables` de Supabase Storage (según Categoria.fotosReq). */
  fotos?: string[];
  /** Notas solo para el equipo (estado, ubicación, defectos) — nunca se muestran en la landing. Siempre opcional. */
  notasInternas?: string;
}

/** Estados de moderación de un testimonio. Solo `aprobado` se publica. */
export const ESTADOS_TESTIMONIO = ["pendiente", "aprobado", "rechazado"] as const;

export type EstadoTestimonio = (typeof ESTADOS_TESTIMONIO)[number];

/**
 * Un comentario dejado por un visitante desde la landing.
 *
 * Nace siempre `pendiente` (lo fuerza la RLS, no la app) y no se ve en la web
 * hasta que un admin lo aprueba. El estado es reversible: un aprobado se puede
 * volver a pendiente o rechazar sin borrarlo.
 *
 * No tiene color ni orden manual: se ordena por `creado` (más reciente
 * primero) y la paleta de cada tarjeta se deriva de su posición al renderizar.
 */
export interface Testimonio {
  id: string;
  texto: string;
  quien: string;
  estado: EstadoTestimonio;
  /** ISO. Ordena la lista pública, del más nuevo al más viejo. */
  creado: string;

  /**
   * Datos opcionales que el visitante completa o no.
   *
   * `articulos` y `localidad` son texto libre, no FK, aunque el formulario los
   * ofrezca como lista armada con el inventario y las zonas reales: un
   * comentario es un testimonio histórico y tiene que seguir diciendo lo que
   * esa persona alquiló, aunque después se renombre o se borre el artículo.
   */
  puntaje?: number | null;
  /** Puede haber alquilado varias cosas. Vacío = no lo dijo. */
  articulos?: string[];
  localidad?: string | null;
  /** 'YYYY-MM-DD' — cuándo fue la fiesta (siempre pasada). */
  fechaEvento?: string | null;
}

/** Rol de un usuario del panel. `admin` = todo; `empleado` = solo operativo (reservas). */
export type Rol = "admin" | "empleado";

/** Perfil de un usuario de Supabase (para la vista Equipo). */
export interface Perfil {
  id: string;
  email: string;
  rol: Rol;
}

/**
 * Requisito de un atributo de artículo para una categoría dada:
 * `obligatorio` (bloquea guardar si falta), `opcional` o `no_aplica` (el
 * campo ni se muestra en el formulario). Ej: Gazebos → medidasTurbinaReq
 * "no_aplica" porque no usan turbina.
 */
export type Requisito = "obligatorio" | "opcional" | "no_aplica";

/** Una categoría del catálogo. `id` es un slug; `orden` define el orden en las listas. */
export interface Categoria {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
  descripcionReq: Requisito;
  /** Medidas sin turbina (ancho+largo obligatorios si "obligatorio"; alto siempre opcional). */
  medidasReq: Requisito;
  /** Medidas con turbina, como grupo completo (ancho+largo+alto juntos). */
  medidasTurbinaReq: Requisito;
  fotosReq: Requisito;
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
