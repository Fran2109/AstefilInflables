import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ModeloPublico, Producto } from "@/types/catalogo";
import { PRODUCTOS } from "@/data/productos";
import { cargarCatalogo } from "@/lib/landingDb";

interface CatalogoValue {
  productos: Producto[];
  modelos: ModeloPublico[];
  /** Categorías en orden, para el filtro del catálogo. */
  categorias: string[];
}

/** Deriva las categorías: usa la tabla si vino; si no, las deduce de los modelos. */
function derivarCategorias(dbCats: string[], modelos: ModeloPublico[]): string[] {
  if (dbCats.length) return dbCats;
  return [...new Set(modelos.map((m) => m.cat))];
}

/**
 * Provee el catálogo de la landing. Arranca con los datos estáticos de
 * `src/data/` (render instantáneo, sin parpadeo) y, si hay Supabase, los
 * reemplaza con los de la base al terminar de cargar. Ante cualquier error de
 * red se queda con el fallback estático. Las fotos son siempre placeholders
 * on-brand (ver `lib/placeholder.ts`) hasta que se carguen fotos reales.
 */
const CatalogoContext = createContext<CatalogoValue>({
  productos: PRODUCTOS,
  modelos: [],
  categorias: [],
});

export function CatalogoProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CatalogoValue>({
    productos: PRODUCTOS,
    modelos: [],
    categorias: [],
  });

  useEffect(() => {
    let vivo = true;
    cargarCatalogo()
      .then((db) => {
        if (vivo && db)
          setData({
            productos: db.productos,
            modelos: db.modelos,
            categorias: derivarCategorias(db.categorias, db.modelos),
          });
      })
      .catch(() => {
        /* Se mantiene el fallback estático. */
      });
    return () => {
      vivo = false;
    };
  }, []);

  return <CatalogoContext.Provider value={data}>{children}</CatalogoContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCatalogo(): CatalogoValue {
  return useContext(CatalogoContext);
}
