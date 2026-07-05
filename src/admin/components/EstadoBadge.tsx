import type { Estado } from "@/admin/types";
import { cn } from "@/lib/utils";

/** Clases de color por estado (badge). */
const ESTADO_CLS: Record<Estado, string> = {
  Consulta: "bg-amarillo text-tinta",
  Reservado: "bg-azul text-white",
  Señado: "bg-verde text-white",
  Entregado: "bg-rosa text-tinta",
  Finalizado: "bg-[#ddd] text-tinta",
  Cancelado: "bg-white text-gris line-through",
};

/** Colores del puntito/pin del calendario por estado. */
export const PIN_CLS: Record<Estado, string> = {
  Consulta: "bg-amarillo",
  Reservado: "bg-azul",
  Señado: "bg-verde",
  Entregado: "bg-rosa",
  Finalizado: "bg-[#ddd]",
  Cancelado: "bg-white",
};

export function EstadoBadge({ estado, className }: { estado: Estado; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full border-2 border-tinta px-2.5 py-1 font-alt text-[.72rem] font-extrabold tracking-[.4px]",
        ESTADO_CLS[estado],
        className
      )}
    >
      {estado}
    </span>
  );
}
