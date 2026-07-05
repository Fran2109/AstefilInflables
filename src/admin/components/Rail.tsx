import { useAdmin } from "@/admin/store/AdminContext";
import { cn } from "@/lib/utils";

export type Vista = "inicio" | "calendario" | "reservas" | "inventario" | "ajustes";

const TABS: { id: Vista; ico: string; label: string }[] = [
  { id: "inicio", ico: "🏠", label: "Inicio" },
  { id: "calendario", ico: "📅", label: "Calendario" },
  { id: "reservas", ico: "🎈", label: "Reservas" },
  { id: "inventario", ico: "🏰", label: "Inventario" },
  { id: "ajustes", ico: "⚙️", label: "Ajustes" },
];

const MODO_TXT: Record<string, [string, string]> = {
  navegador: ["Guardado en este navegador", "bg-verde"],
  memoria: ["Solo memoria: se pierde al recargar", "bg-amarillo"],
};

interface RailProps {
  activa: Vista;
  onCambiar: (v: Vista) => void;
}

/** Barra de navegación: lateral en desktop, inferior en mobile. */
export function Rail({ activa, onCambiar }: RailProps) {
  const { modo } = useAdmin();
  const [txt, punto] = MODO_TXT[modo] ?? MODO_TXT.navegador;

  return (
    <nav className="sticky top-0 flex h-screen flex-col gap-2 border-r-3 border-tinta bg-papel px-3.5 py-[18px] max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:z-50 max-md:h-auto max-md:flex-row max-md:justify-around max-md:border-r-0 max-md:border-t-3 max-md:px-2.5 max-md:py-2">
      <div className="flex items-center gap-2.5 px-1.5 pb-4 pt-1 max-md:hidden">
        <MarcaSvg />
        <div>
          <div className="font-display text-[1.15rem] text-rojo">Astefil</div>
          <span className="rounded-md bg-tinta px-2 py-0.5 font-alt text-[.7rem] font-extrabold tracking-[1px] text-amarillo">
            ADMIN
          </span>
        </div>
      </div>

      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onCambiar(t.id)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-[14px] border-3 border-transparent px-3.5 py-[11px] text-left font-alt text-base font-extrabold hover:border-tinta hover:bg-white",
            "max-md:flex-1 max-md:flex-col max-md:gap-0.5 max-md:px-2 max-md:py-[7px] max-md:text-center max-md:text-[.62rem]",
            activa === t.id && "border-tinta bg-amarillo shadow-hard-sm hover:bg-amarillo"
          )}
        >
          <span className="text-[1.15rem] max-md:text-[1.25rem]">{t.ico}</span> {t.label}
        </button>
      ))}

      <div className="flex-1 max-md:hidden" />
      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-tinta bg-white px-2.5 py-1.5 font-alt text-[.75rem] font-bold max-md:hidden">
        <span className={cn("h-[9px] w-[9px] rounded-full border-2 border-tinta", punto)} />
        {txt}
      </span>
    </nav>
  );
}

function MarcaSvg() {
  return (
    <svg viewBox="0 0 84 84" width="44" aria-hidden="true" className="h-11 w-auto">
      <path d="M23 50 A19 17 0 0 1 61 50" fill="none" stroke="#1B1310" strokeWidth="13" strokeLinecap="round" />
      <path d="M23 50 A19 17 0 0 1 61 50" fill="none" stroke="#FFC61B" strokeWidth="7" strokeLinecap="round" />
      <rect x="8" y="30" width="15" height="34" rx="7" fill="#1F6FD0" stroke="#1B1310" strokeWidth="4" />
      <rect x="61" y="30" width="15" height="34" rx="7" fill="#1F6FD0" stroke="#1B1310" strokeWidth="4" />
      <rect x="4" y="58" width="76" height="24" rx="9" fill="#E8352B" stroke="#1B1310" strokeWidth="4" />
      <path d="M34 82 v-8 a8 7 0 0 1 16 0 v8 z" fill="#1B1310" />
    </svg>
  );
}
