import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { scrollAId } from "@/lib/scroll";
import { Visor } from "@/components/landing/Visor";
import type { ModeloPublico } from "@/types/catalogo";

/** Config con la que se abre el visor (producto o galería completa). */
export interface VisorConfig {
  titulo: string;
  tag: string;
  desc: string;
  /** Claves de placeholder, o URLs/paths reales (fotos subidas de un inflable). */
  fotos: string[];
  /**
   * Si viene, el visor muestra el botón "¡Lo quiero!" que precarga el cotizador.
   * Es el **texto** que va a aparecer en el select y en el mensaje de WhatsApp —
   * no un id. Se llamaba `inflableId` y ese nombre invitaba a pasarle
   * `producto.id`, con lo que el mensaje terminaba diciendo "Me interesa:
   * castillos" (el slug). El nombre nuevo hace obvio qué se espera.
   */
  valorCotizador?: string;
  /** Foto por la que arranca (índice dentro de `fotos`). */
  indiceInicial?: number;
  /** Modelos reales de esta categoría (nombre + medidas), para listar en el detalle. */
  modelos?: ModeloPublico[];
}

interface LandingContextValue {
  /** Inflable elegido en el cotizador (controlado, para que las cards lo precarguen). */
  inflableSeleccionado: string;
  setInflableSeleccionado: (v: string) => void;
  /** Setea el inflable, scrollea al cotizador y enfoca la fecha. */
  precargar: (valor: string) => void;
  /** Abre el visor de fotos con la config dada. */
  abrirVisor: (cfg: VisorConfig) => void;
}

const LandingContext = createContext<LandingContextValue | null>(null);

export function LandingProvider({ children }: { children: ReactNode }) {
  const [inflableSeleccionado, setInflableSeleccionado] = useState("");
  const [visorCfg, setVisorCfg] = useState<VisorConfig | null>(null);

  const precargar = useCallback((valor: string) => {
    setInflableSeleccionado(valor);
    scrollAId("cotizar");

    // Enfocar la fecha recién cuando el scroll terminó de verdad. Antes esto
    // era un setTimeout(600) fijo: con reduced-motion el scroll es instantáneo
    // y se esperaban 600ms al pedo, y en un scroll largo el foco llegaba antes
    // de tiempo. `scrollend` avisa el momento exacto; el timeout queda solo de
    // red de seguridad por si el evento no llega (o el scroll nunca arranca,
    // que pasa cuando el cotizador ya estaba en pantalla).
    const enfocar = () => document.getElementById("f-fecha")?.focus({ preventScroll: true });
    // El `in` sobre `window` directo lo estrecha a `never` (TS no conoce
    // `onscrollend`); el cast a object deja hacer la detección sin romper.
    const soportaScrollend = "onscrollend" in (window as object);
    if (soportaScrollend) {
      const red = window.setTimeout(enfocar, 800);
      window.addEventListener(
        "scrollend",
        () => {
          window.clearTimeout(red);
          enfocar();
        },
        { once: true }
      );
    } else {
      window.setTimeout(enfocar, 600);
    }
  }, []);

  const abrirVisor = useCallback((cfg: VisorConfig) => {
    if (!cfg.fotos.length) return;
    setVisorCfg(cfg);
  }, []);

  const cerrarVisor = useCallback(() => setVisorCfg(null), []);

  const value = useMemo<LandingContextValue>(
    () => ({ inflableSeleccionado, setInflableSeleccionado, precargar, abrirVisor }),
    [inflableSeleccionado, precargar, abrirVisor]
  );

  return (
    <LandingContext.Provider value={value}>
      {children}
      <Visor cfg={visorCfg} onCerrar={cerrarVisor} onPrecargar={precargar} />
    </LandingContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanding(): LandingContextValue {
  const ctx = useContext(LandingContext);
  if (!ctx) throw new Error("useLanding debe usarse dentro de <LandingProvider>");
  return ctx;
}
