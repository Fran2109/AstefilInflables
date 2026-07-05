import { useState } from "react";
import { DOWS, MESES, hoyStr, dowDe, mueveMes } from "@/admin/lib/fechas";
import { useAdmin } from "@/admin/store/AdminContext";
import { CabeceraVista, Panel } from "@/admin/views/comunes";
import { PIN_CLS } from "@/admin/components/EstadoBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LEYENDA = [
  ["Consulta", "bg-amarillo"],
  ["Reservado", "bg-azul"],
  ["Señado", "bg-verde"],
  ["Entregado", "bg-rosa"],
  ["Finalizado", "bg-[#ddd]"],
] as const;

export function CalendarioView({ onAbrirDia }: { onAbrirDia: (iso: string) => void }) {
  const { reservas } = useAdmin();
  const [mesCal, setMesCal] = useState(() => hoyStr().slice(0, 7));

  const [y, m] = mesCal.split("-").map(Number);
  const hoy = hoyStr();
  const primerDow = new Date(y, m - 1, 1).getDay();
  const diasEnMes = new Date(y, m, 0).getDate();

  return (
    <div>
      <CabeceraVista
        titulo="Calendario"
        accion={
          <div className="flex items-center gap-3">
            <Button variant="blanco" size="mini" onClick={() => setMesCal(mueveMes(mesCal, -1))} aria-label="Mes anterior">
              ◀
            </Button>
            <span className="min-w-[210px] text-center font-display text-[1.5rem]">
              {MESES[m - 1]} {y}
            </span>
            <Button variant="blanco" size="mini" onClick={() => setMesCal(mueveMes(mesCal, 1))} aria-label="Mes siguiente">
              ▶
            </Button>
          </div>
        }
      />

      <Panel>
        <div className="grid grid-cols-7 gap-2">
          {DOWS.map((d) => (
            <div key={d} className="py-1 text-center font-alt text-[.78rem] font-extrabold text-[#5a4a41]">
              {d}
            </div>
          ))}
        </div>

        <div className="mt-1.5 grid grid-cols-7 gap-2">
          {Array.from({ length: primerDow }).map((_, i) => (
            <div key={"b" + i} className="min-h-[58px] rounded-xl border-2 border-tinta opacity-35 md:min-h-[84px]" />
          ))}
          {Array.from({ length: diasEnMes }).map((_, i) => {
            const d = i + 1;
            const iso = mesCal + "-" + String(d).padStart(2, "0");
            const dw = dowDe(iso);
            const esHoy = iso === hoy;
            const finde = dw === 0 || dw === 6;
            const delDia = reservas.filter((r) => r.fecha === iso && r.estado !== "Cancelado");
            return (
              <button
                key={iso}
                onClick={() => onAbrirDia(iso)}
                className={cn(
                  "flex min-h-[58px] flex-col gap-1 rounded-xl border-2 border-tinta bg-white p-1.5 text-left transition hover:-translate-y-0.5 hover:shadow-hard-sm md:min-h-[84px]",
                  finde && "bg-[#FFF7E0]",
                  esHoy && "bg-cielo"
                )}
              >
                <span className={cn("font-alt text-[.85rem] font-extrabold", esHoy && "text-rojo")}>{d}</span>
                <span className="flex flex-wrap gap-[3px]">
                  {delDia.slice(0, 6).map((r) => (
                    <span
                      key={r.id}
                      title={r.cliente || ""}
                      className={cn("h-3.5 w-3.5 rounded-full border-2 border-tinta", PIN_CLS[r.estado])}
                    />
                  ))}
                  {delDia.length > 6 && "+"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3.5 flex flex-wrap gap-3.5 font-alt text-[.8rem] font-bold">
          {LEYENDA.map(([txt, cls]) => (
            <span key={txt} className="inline-flex items-center gap-1.5">
              <span className={cn("h-3.5 w-3.5 rounded-full border-2 border-tinta", cls)} /> {txt}
            </span>
          ))}
        </div>
      </Panel>
    </div>
  );
}
