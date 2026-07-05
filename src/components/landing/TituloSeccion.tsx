import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TituloSeccionProps {
  children: ReactNode;
  sub?: ReactNode;
  /** Clases extra para la banda (color/rotación). */
  bandaClassName?: string;
}

export function TituloSeccion({ children, sub, bandaClassName }: TituloSeccionProps) {
  return (
    <h2 className="mb-3.5 text-center text-[clamp(2rem,4.5vw,3rem)]">
      <span className={cn("banda-titulo", bandaClassName)}>{children}</span>
      {sub && (
        <span className="mt-2.5 block font-body text-[1.05rem] font-medium text-[#3c2f28]">
          {sub}
        </span>
      )}
    </h2>
  );
}
