import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Variante footer: trazo claro y subtítulo amarillo sobre fondo oscuro. */
  footer?: boolean;
}

/**
 * Lockup castillito + wordmark "Astefil / INFLABLES". Es SVG inline a propósito
 * (no existe como archivo de imagen; no convertir a <img>).
 */
export function Logo({ className, footer = false }: LogoProps) {
  return (
    <svg
      viewBox="0 0 292 92"
      role="img"
      aria-label="Astefil Inflables"
      className={cn("h-[54px] w-auto", className)}
    >
      <line x1="15.5" y1="26" x2="15.5" y2="10" stroke="var(--tinta)" strokeWidth="2.5" />
      <path
        d="M15.5 11 L29 15 L15.5 19 Z"
        fill="var(--rojo)"
        stroke="var(--tinta)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="68.5" y1="26" x2="68.5" y2="10" stroke="var(--tinta)" strokeWidth="2.5" />
      <path
        d="M68.5 11 L55 15 L68.5 19 Z"
        fill="var(--amarillo)"
        stroke="var(--tinta)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M23 46 A19 17 0 0 1 61 46"
        fill="none"
        stroke="var(--tinta)"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <path
        d="M23 46 A19 17 0 0 1 61 46"
        fill="none"
        stroke="var(--amarillo)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <rect x="8" y="26" width="15" height="34" rx="7" fill="var(--azul)" stroke="var(--tinta)" strokeWidth="4" />
      <rect x="61" y="26" width="15" height="34" rx="7" fill="var(--azul)" stroke="var(--tinta)" strokeWidth="4" />
      <rect x="4" y="54" width="76" height="24" rx="9" fill="var(--rojo)" stroke="var(--tinta)" strokeWidth="4" />
      <path d="M34 78 v-8 a8 7 0 0 1 16 0 v8 z" fill="var(--tinta)" />
      <g fontFamily="'Bagel Fat One',cursive" fontSize="58" paintOrder="stroke" strokeLinejoin="round">
        <text x="100" y="70" fill="var(--amarillo)" stroke="var(--tinta)" strokeWidth="5">
          Astefil
        </text>
        <text
          x="96"
          y="66"
          fill={footer ? "var(--papel)" : "var(--rojo)"}
          stroke="var(--tinta)"
          strokeWidth="5"
        >
          Astefil
        </text>
      </g>
      <text
        x="98"
        y="88"
        fontFamily="'Baloo 2',sans-serif"
        fontWeight="800"
        fontSize="17"
        letterSpacing="5"
        fill="var(--azul)"
      >
        INFLABLES
      </text>
    </svg>
  );
}
