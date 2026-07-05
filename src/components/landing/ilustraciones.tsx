import type { ReactNode } from "react";

/** Ilustraciones SVG para las categorías que todavía no tienen foto real. */
export const ILUSTRACIONES: Record<"deportivo" | "living", { fondo: string; svg: ReactNode }> = {
  deportivo: {
    fondo: "#DFF3E6",
    svg: (
      <svg viewBox="0 0 200 160" width="78%" role="img" aria-label="Ilustración de arco de fútbol inflable">
        <rect x="30" y="40" width="140" height="14" rx="7" fill="#23B15D" stroke="#1B1310" strokeWidth="4" />
        <rect x="30" y="40" width="14" height="90" rx="7" fill="#23B15D" stroke="#1B1310" strokeWidth="4" />
        <rect x="156" y="40" width="14" height="90" rx="7" fill="#23B15D" stroke="#1B1310" strokeWidth="4" />
        <path
          d="M44 54 L156 54 M44 74 L156 74 M44 94 L156 94 M44 114 L156 114 M64 54 L64 130 M94 54 L94 130 M124 54 L124 130"
          stroke="#1B1310"
          strokeWidth="2.5"
          opacity=".5"
        />
        <circle cx="100" cy="118" r="20" fill="#fff" stroke="#1B1310" strokeWidth="4" />
        <path d="M100 104 l6 8 -3 9 h-6 l-3 -9 z" fill="#1B1310" />
      </svg>
    ),
  },
  living: {
    fondo: "#FFE7EF",
    svg: (
      <svg viewBox="0 0 200 160" width="78%" role="img" aria-label="Ilustración de living blandito para chicos">
        <rect x="26" y="84" width="148" height="40" rx="12" fill="#FF7AA2" stroke="#1B1310" strokeWidth="4" />
        <rect x="26" y="56" width="34" height="52" rx="10" fill="#1F6FD0" stroke="#1B1310" strokeWidth="4" />
        <rect x="140" y="56" width="34" height="52" rx="10" fill="#FFC61B" stroke="#1B1310" strokeWidth="4" />
        <circle cx="86" cy="66" r="16" fill="#E8352B" stroke="#1B1310" strokeWidth="4" />
        <rect
          x="106"
          y="52"
          width="28"
          height="28"
          rx="6"
          fill="#23B15D"
          stroke="#1B1310"
          strokeWidth="4"
          transform="rotate(12 120 66)"
        />
      </svg>
    ),
  },
};
