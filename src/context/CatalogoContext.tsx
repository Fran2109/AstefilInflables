import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ModeloPublico, Producto } from "@/types/catalogo";
import { PRODUCTOS } from "@/data/productos";
import { cargarCatalogo } from "@/lib/landingDb";
import { haySupabase } from "@/lib/supabase";

interface CatalogoValue {
  productos: Producto[];
  modelos: ModeloPublico[];
  /** Categorías en orden, para el filtro del catálogo. */
  categorias: string[];
  /** Zonas de cobertura en orden, para "¿Llegamos a tu zona?". */
  zonas: string[];
  /**
   * ¿Todavía se está esperando a la base?
   *
   * Sin esto, el primer render mostraba los estados vacíos ("Estamos armando
   * el catálogo") antes de haber preguntado, y cuando Supabase respondía el
   * contenido real los reemplazaba de golpe. El sitio afirmaba que no había
   * nada y después se corregía: justo lo que la regla de "verdad vs.
   * placeholder" quiere evitar, solo que por un bug de estado en vez de por
   * contenido inventado.
   *
   * Arranca en `false` cuando no hay Supabase: ahí los datos estáticos ya son
   * la respuesta final, no hay nada que esperar.
   */
  cargando: boolean;
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
 *
 * `zonas` sigue la misma regla que productos/testimonios: si la tabla no
 * existe todavía o está vacía, la landing lo refleja tal cual (sin inventar
 * contenido) — ver `Zonas.tsx` para el estado vacío.
 */
const VACIO: CatalogoValue = {
  productos: PRODUCTOS,
  modelos: [],
  categorias: [],
  zonas: [],
  cargando: false,
};

const CatalogoContext = createContext<CatalogoValue>(VACIO);

export function CatalogoProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CatalogoValue>({ ...VACIO, cargando: haySupabase });

  useEffect(() => {
    let vivo = true;
    cargarCatalogo()
      .then((db) => {
        if (!vivo) return;
        if (db)
          setData({
            productos: db.productos,
            modelos: db.modelos,
            categorias: derivarCategorias(db.categorias, db.modelos),
            zonas: db.zonas,
            cargando: false,
          });
        else setData((d) => ({ ...d, cargando: false }));
      })
      .catch(() => {
        // Se mantiene el fallback estático, pero la espera terminó: si seguimos
        // en "cargando" el visitante se queda mirando esqueletos para siempre.
        if (vivo) setData((d) => ({ ...d, cargando: false }));
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
