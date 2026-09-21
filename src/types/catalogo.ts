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
