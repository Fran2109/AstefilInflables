import { useEffect, useState } from "react";
import { useAdmin } from "@/admin/store/AdminContext";
import { cn } from "@/lib/utils";

/**
 * Toast inferior centrado que se muestra ~2.6s ante cada acción.
 *
 * Dos arreglos sobre la versión anterior:
 *
 * - **La sombra era invisible.** Usaba `0 6px 0 rgba(0,0,0,.25)`: una sombra
 *   blanda —que rompe el sistema, donde todas son duras con `var(--tinta)`— y
 *   además casi negra sobre un toast `bg-tinta`, o sea negra sobre negro.
 * - **Un guardado exitoso y un fallo se veían exactamente igual.** Ahora el
 *   error va en rojo: el operador necesita saber de un vistazo si la escritura
 *   entró o no.
 */
export function Toast() {
  const { toast } = useAdmin();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const error = toast?.tipo === "error";

  return (
    <div
      role="status"
      aria-live={error ? "assertive" : "polite"}
      className={cn(
        "fixed bottom-6 left-1/2 z-[110] max-w-[calc(100%-40px)] -translate-x-1/2 rounded-full border-3 border-tinta px-[22px] py-3 text-center font-alt font-bold shadow-hard transition-transform duration-200",
        error ? "bg-rojo text-white" : "bg-papel text-tinta",
        visible ? "translate-y-0" : "translate-y-[150%]"
      )}
    >
      {toast?.msg}
    </div>
  );
}
