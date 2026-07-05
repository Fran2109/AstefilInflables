import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Clases compartidas de inputs/selects/textarea del panel. */
export const campoInputCls =
  "w-full rounded-xl border-3 border-tinta bg-white px-3 py-2.5 font-body text-[.95rem] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-azul";

interface CampoProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  /** Ocupa todo el ancho de la grilla. */
  ancho?: boolean;
}

export function Campo({ label, htmlFor, children, ancho }: CampoProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", ancho && "col-span-full")}>
      <label htmlFor={htmlFor} className="font-alt text-[.82rem] font-extrabold">
        {label}
      </label>
      {children}
    </div>
  );
}
