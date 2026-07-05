/** Una foto real del catálogo/galería. La clave la referencian los productos. */
export interface Foto {
  clave: string;
  src: string;
  alt: string;
}

/** Un producto/categoría del catálogo con sus fotos asociadas. */
export interface Producto {
  /** Valor que usa el cotizador (debe coincidir con una opción del select). */
  id: string;
  titulo: string;
  tag: string;
  descCorta: string;
  descLarga: string;
  /** Claves de FOTOS. Vacío = card ilustrada (SVG) sin fotos todavía. */
  fotos: string[];
  /** Categorías sin foto todavía (Deportivos, Livings): id de la ilustración SVG. */
  ilustracionId?: "deportivo" | "living";
  /** Categorías del inventario que agrupa esta card (para listar modelos reales). */
  cats?: string[];
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
}
