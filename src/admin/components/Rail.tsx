import { useEffect, useState } from "react";
import { useAdmin } from "@/admin/store/AdminContext";
import { useConfirmar } from "@/admin/components/Confirm";
import { cn } from "@/lib/utils";

export type Vista =
  | "inicio"
  | "calendario"
  | "reservas"
  | "inventario"
  | "categorias"
  | "zonas"
  | "testimonios"
  | "equipo"
  | "ajustes";

const TABS: { id: Vista; ico: string; label: string; adminOnly?: boolean }[] = [
  { id: "inicio", ico: "🏠", label: "Inicio" },
  { id: "calendario", ico: "📅", label: "Calendario" },
  { id: "reservas", ico: "🎈", label: "Reservas" },
  { id: "inventario", ico: "🏰", label: "Inventario" },
  { id: "categorias", ico: "🏷️", label: "Categorías", adminOnly: true },
  { id: "zonas", ico: "📍", label: "Zonas", adminOnly: true },
  { id: "testimonios", ico: "💬", label: "Comentarios", adminOnly: true },
  { id: "equipo", ico: "👥", label: "Equipo", adminOnly: true },
  { id: "ajustes", ico: "⚙️", label: "Ajustes", adminOnly: true },
];

/**
 * Las pestañas que entran en la barra inferior del celular. El resto va en
 * "Más": las 9 juntas medían 637px y la barra no scrollea, así que a 375px
 * Zonas, Comentarios, Equipo y Ajustes quedaban fuera de la pantalla.
 */
const EN_BARRA: Vista[] = ["inicio", "calendario", "reservas", "inventario"];

const MODO_TXT: Record<string, [string, string]> = {
  supabase: ["Sincronizado en la nube ☁️", "bg-verde"],
  navegador: ["Guardado en este navegador", "bg-verde"],
  memoria: ["Solo memoria: se pierde al recargar", "bg-amarillo"],
};

interface RailProps {
  activa: Vista;
  onCambiar: (v: Vista) => void;
}

/** Barra de navegación: lateral en desktop, inferior en mobile. */
export function Rail({ activa, onCambiar }: RailProps) {
  const { modo, esAdmin, online, cerrarSesion } = useAdmin();
  const confirmar = useConfirmar();
  const [txt, punto] = MODO_TXT[modo] ?? MODO_TXT.navegador;
  const tabs = TABS.filter((t) => esAdmin || !t.adminOnly);
  const enMas = tabs.filter((t) => !EN_BARRA.includes(t.id));
  // Online siempre hay "Más": ahí está cerrar sesión, también para un empleado.
  const hayMas = enMas.length > 0 || online;
  const [masAbierto, setMasAbierto] = useState(false);

  useEffect(() => {
    if (!masAbierto) return;
    const alEscape = (e: KeyboardEvent) => e.key === "Escape" && setMasAbierto(false);
    window.addEventListener("keydown", alEscape);
    return () => window.removeEventListener("keydown", alEscape);
  }, [masAbierto]);

  const irA = (v: Vista) => {
    setMasAbierto(false);
    onCambiar(v);
  };

  const salir = async () => {
    setMasAbierto(false);
    const ok = await confirmar({
      titulo: "Cerrar sesión",
      mensaje: "¿Querés cerrar tu sesión? Vas a tener que volver a ingresar con tu email y contraseña.",
      textoConfirmar: "Cerrar sesión",
      peligro: true,
    });
    if (ok) cerrarSesion();
  };

  return (
    <>
    {masAbierto && (
      <>
        <div className="fixed inset-0 z-40 bg-tinta/40 md:hidden" onClick={() => setMasAbierto(false)} />
        <div
          id="rail-mas"
          className="fixed inset-x-2.5 bottom-[84px] z-50 flex max-h-[calc(100dvh-110px)] flex-col gap-1 overflow-y-auto rounded-[18px] border-3 border-tinta bg-papel p-2 shadow-hard md:hidden"
        >
          {enMas.map((t) => (
            <button
              key={t.id}
              onClick={() => irA(t.id)}
              className={cn(
                "flex min-h-[48px] w-full items-center gap-3 rounded-[12px] border-3 border-transparent px-3 text-left font-alt text-base font-extrabold",
                activa === t.id && "border-tinta bg-amarillo"
              )}
            >
              <span className="text-[1.2rem]">{t.ico}</span> {t.label}
            </button>
          ))}
          {online && (
            <button
              onClick={salir}
              className="flex min-h-[48px] w-full items-center gap-3 rounded-[12px] border-t-2 border-dashed border-[#e5d9cd] px-3 text-left font-alt text-base font-extrabold text-rojo"
            >
              <span className="text-[1.2rem]">🚪</span> Cerrar sesión
            </button>
          )}
        </div>
      </>
    )}
    {/* `overflow-y-auto`: la caja es `h-screen`, pero su contenido (logo + 8
       pestañas + cerrar sesión + chip) pasa los 590px. En una ventana baja
       eso dejaba las últimas pestañas fuera de la caja; ahora el propio rail
       scrollea. En una ventana normal no se nota. */}
    <nav className="sticky top-0 flex h-screen flex-col gap-2 overflow-y-auto border-r-3 border-tinta bg-papel px-3.5 py-[18px] max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:z-50 max-md:h-auto max-md:flex-row max-md:justify-around max-md:overflow-visible max-md:border-r-0 max-md:border-t-3 max-md:px-2.5 max-md:py-2">
      <div className="flex items-center gap-2.5 px-1.5 pb-4 pt-1 max-md:hidden">
        <MarcaSvg />
        <div>
          <div className="font-display text-[1.15rem] text-rojo">Astefil</div>
          <span className="rounded-md bg-tinta px-2 py-0.5 font-alt text-[.7rem] font-extrabold tracking-[1px] text-amarillo">
            ADMIN
          </span>
        </div>
      </div>

      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => irA(t.id)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-[14px] border-3 border-transparent px-3.5 py-[11px] text-left font-alt text-base font-extrabold hover:border-tinta hover:bg-white",
            "max-md:min-w-0 max-md:flex-1 max-md:flex-col max-md:gap-0.5 max-md:px-0.5 max-md:py-[7px] max-md:text-center max-md:text-[.72rem] max-[359px]:px-0 max-[359px]:text-[.6rem]",
            !EN_BARRA.includes(t.id) && "max-md:hidden",
            activa === t.id && "border-tinta bg-amarillo shadow-hard-sm hover:bg-amarillo"
          )}
        >
          <span className="text-[1.15rem] max-md:text-[1.25rem]">{t.ico}</span> {t.label}
        </button>
      ))}

      {hayMas && (
        <button
          onClick={() => setMasAbierto((a) => !a)}
          aria-expanded={masAbierto}
          aria-controls="rail-mas"
          className={cn(
            "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[14px] border-3 border-transparent px-0.5 py-[7px] text-center font-alt text-[.72rem] font-extrabold md:hidden",
            (masAbierto || enMas.some((t) => t.id === activa)) && "border-tinta bg-amarillo shadow-hard-sm"
          )}
        >
          <span className="text-[1.25rem]">☰</span> Más
        </button>
      )}

      <div className="flex-1 max-md:hidden" />
      {online && (
        <button
          onClick={salir}
          className="rounded-[12px] border-3 border-tinta bg-white px-3 py-2 text-left font-alt text-[.85rem] font-extrabold hover:bg-amarillo max-md:hidden"
        >
          🚪 Cerrar sesión
        </button>
      )}
      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-tinta bg-white px-2.5 py-1.5 font-alt text-[.75rem] font-bold max-md:hidden">
        <span className={cn("h-[9px] w-[9px] rounded-full border-2 border-tinta", punto)} />
        {txt}
      </span>
    </nav>
    </>
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
