import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Modal } from "@/admin/components/Modal";
import { Button } from "@/components/ui/button";

interface OpcionesConfirm {
  titulo?: string;
  mensaje: ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Estilo de acción destructiva (botón rojo). */
  peligro?: boolean;
}

type Confirmar = (opts: OpcionesConfirm) => Promise<boolean>;

const ConfirmContext = createContext<Confirmar | null>(null);

/**
 * Provee un confirm con el estilo del panel (reemplaza a window.confirm).
 * Uso: `const confirmar = useConfirmar(); if (await confirmar({ mensaje: "…" })) …`
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<OpcionesConfirm | null>(null);
  const resolver = useRef<(v: boolean) => void>();

  const confirmar = useCallback<Confirmar>((o) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const cerrar = useCallback((valor: boolean) => {
    resolver.current?.(valor);
    resolver.current = undefined;
    setOpts(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      <Modal
        open={opts !== null}
        onClose={() => cerrar(false)}
        titulo={opts?.titulo ?? "Confirmar"}
        footer={
          <div className="ml-auto flex gap-2.5">
            <Button variant="blanco" onClick={() => cerrar(false)}>
              {opts?.textoCancelar ?? "Cancelar"}
            </Button>
            <Button variant={opts?.peligro ? "peligro" : "verde"} onClick={() => cerrar(true)}>
              {opts?.textoConfirmar ?? "Confirmar"}
            </Button>
          </div>
        }
      >
        <p className="text-[.98rem] leading-[1.5]">{opts?.mensaje}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirmar(): Confirmar {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirmar debe usarse dentro de <ConfirmProvider>");
  return ctx;
}
