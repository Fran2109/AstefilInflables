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
  /** Claves de FOTOS. */
  fotos: string[];
  /** Si viene, el visor muestra el botón "¡Lo quiero!" que precarga el cotizador. */
  inflableId?: string;
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
    // Enfoca la fecha una vez que terminó el scroll suave.
    window.setTimeout(() => {
      document.getElementById("f-fecha")?.focus({ preventScroll: true });
    }, 600);
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
