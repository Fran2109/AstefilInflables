import type { ReactNode } from "react";

/** Cabecera de vista: título + subtítulo opcional + acción a la derecha. */
export function CabeceraVista({
  titulo,
  sub,
  accion,
}: {
  titulo: string;
  sub?: string;
  accion?: ReactNode;
}) {
  return (
    <div className="mb-[22px] flex flex-wrap items-center justify-between gap-3.5">
      <div>
        <h2 className="text-[1.9rem]">{titulo}</h2>
        {sub && <div className="mt-0.5 text-[.95rem] text-[#5a4a41]">{sub}</div>}
      </div>
      {accion}
    </div>
  );
}

/** Panel blanco con borde y sombra dura. */
export function Panel({ titulo, children }: { titulo?: string; children: ReactNode }) {
  return (
    <div className="mb-[22px] rounded-2xl border-3 border-tinta bg-white p-5 shadow-hard">
      {titulo && <h3 className="mb-3 flex items-center gap-2 text-[1.15rem] font-extrabold">{titulo}</h3>}
      {children}
    </div>
  );
}

/** Estado vacío punteado. */
export function Vacio({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gris p-6 text-center text-[.95rem] text-gris">
      {children}
    </div>
  );
}
