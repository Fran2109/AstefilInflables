/** Una foto (real o placeholder) del catálogo/galería. */
export interface Foto {
  clave: string;
  src: string;
  alt: string;
}

/** Un modelo real del inventario, expuesto públicamente para el catálogo. */
export interface ModeloPublico {
  id: string;
  nombre: string;
  cat: string;
  descripcion?: string;
  ancho?: number;
  largo?: number;
  alto?: number;
  /** URLs públicas de las fotos del modelo (vacío = sin foto todavía). */
  fotos?: string[];
}

/**
 * Un comentario ya aprobado, como lo ve un visitante.
 *
 * No trae `estado` porque del lado público solo existe lo aprobado: la RLS
 * filtra el resto antes de que salga de la base. Se ordena por `creado`, del
 * más reciente al más antiguo.
 */
export interface TestimonioPublico {
  id: string;
  texto: string;
  quien: string;
  creado: string;
  /** Opcionales: el visitante los completa o no al dejar el comentario. */
  puntaje?: number | null;
  articulo?: string | null;
  localidad?: string | null;
  /** 'YYYY-MM-DD' — cuándo fue la fiesta. */
  fechaEvento?: string | null;
}

/**
 * Una categoría del catálogo con los modelos reales que tiene cargados.
 *
 * No hay tabla ni ABM detrás: se deriva de `categorias` + el inventario
 * público. Antes esto era la tabla `productos`, una lista de cards curada a
 * mano que duplicaba lo que el inventario ya sabía — y que, por estar vacía,
 * dejaba la vista "Todos" del catálogo en su estado vacío aunque hubiera
 * artículos cargados.
 */
export interface CategoriaConModelos {
  nombre: string;
  modelos: ModeloPublico[];
  /** Fotos reales de sus modelos (portada primero). Vacío = ninguna todavía. */
  fotos: string[];
}
