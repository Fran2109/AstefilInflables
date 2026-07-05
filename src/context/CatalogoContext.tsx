import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Foto, ModeloPublico, Producto } from "@/types/catalogo";
import { PRODUCTOS } from "@/data/productos";
import { FOTOS, GALERIA_TODAS } from "@/data/fotos";
import { cargarCatalogo } from "@/lib/landingDb";

interface CatalogoValue {
  productos: Producto[];
  fotos: Record<string, Foto>;
  galeria: string[];
  modelos: ModeloPublico[];
}

/**
 * Provee el catálogo de la landing. Arranca con los datos estáticos de
 * `src/data/` (render instantáneo, sin parpadeo) y, si hay Supabase, los
 * reemplaza con los de la base al terminar de cargar. Ante cualquier error de
 * red se queda con el fallback estático.
 */
const CatalogoContext = createContext<CatalogoValue>({
  productos: PRODUCTOS,
  fotos: FOTOS,
  galeria: GALERIA_TODAS,
  modelos: [],
});

export function CatalogoProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CatalogoValue>({
    productos: PRODUCTOS,
    fotos: FOTOS,
    galeria: GALERIA_TODAS,
    modelos: [],
  });

  useEffect(() => {
    let vivo = true;
    cargarCatalogo()
      .then((db) => {
        if (vivo && db) setData(db);
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
