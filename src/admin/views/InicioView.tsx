import { useMemo } from "react";
import type { Reserva } from "@/admin/types";
import { addDias, fmtFechaLarga, hoyStr, MESES } from "@/admin/lib/fechas";
import { plata } from "@/admin/lib/formato";
import { conflictosDe, nombresInf } from "@/admin/lib/conflictos";
import { useAdmin } from "@/admin/store/AdminContext";
import { EstadoBadge } from "@/admin/components/EstadoBadge";
import { Button } from "@/components/ui/button";
import { CabeceraVista, Panel, Vacio } from "@/admin/views/comunes";

export function InicioView({ onAbrirReserva }: { onAbrirReserva: (r: Reserva | null) => void }) {
  const { reservas, articulos, config, mostrarToast } = useAdmin();
  const hoy = hoyStr();
  const mes = hoy.slice(0, 7);

  const activas = reservas.filter((r) => r.estado !== "Cancelado");
  const kpiMes = activas.filter((r) => r.fecha.startsWith(mes) && r.estado !== "Consulta").length;
  const kpiProx = activas.filter(
    (r) => r.fecha >= hoy && r.fecha <= addDias(hoy, 7) && r.estado !== "Consulta"
  ).length;
  const ingresos = activas
    .filter((r) => r.fecha.startsWith(mes) && ["Señado", "Entregado", "Finalizado"].includes(r.estado))
    .reduce((a, r) => a + (Number(r.precio) || 0), 0);
  const kpiPend = reservas.filter((r) => r.estado === "Consulta").length;

  const proximas = activas
    .filter((r) => r.fecha >= hoy && r.estado !== "Consulta")
    .sort(
      (a, b) =>
        a.fecha.localeCompare(b.fecha) ||
        String(a.horaEntrega).localeCompare(String(b.horaEntrega))
    )
    .slice(0, 6);

  // Barras: ingresos de los últimos 6 meses.
  const barras = useMemo(() => {
    const [Y, M] = mes.split("-").map(Number);
    const meses: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(Y, M - 1 - i, 1);
      meses.push(dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0"));
    }
    const vals = meses.map((m) =>
      reservas
        .filter((r) => r.fecha.startsWith(m) && ["Señado", "Entregado", "Finalizado"].includes(r.estado))
        .reduce((a, r) => a + (Number(r.precio) || 0), 0)
    );
    const max = Math.max(...vals, 1);
    return meses.map((m, i) => ({
      mes: MESES[Number(m.slice(5)) - 1].slice(0, 3),
      val: vals[i],
      pct: Math.max(4, Math.round((vals[i] / max) * 100)),
      ultimo: i === meses.length - 1,
    }));
  }, [mes, reservas]);

  const copiarManiana = async () => {
    const man = addDias(hoy, 1);
    const del = reservas.filter((r) => r.fecha === man && !["Consulta", "Cancelado"].includes(r.estado));
    if (!del.length) return mostrarToast("Mañana no hay entregas 🎉");
    const txt =
      "🎈 ASTEFIL — Entregas de mañana " + fmtFechaLarga(man) + "\n\n" +
      del
        .map(
          (r) =>
            "• " + (r.horaEntrega || "s/hora") + " — " + (r.cliente || "?") +
            " (" + nombresInf(r.articuloIds, articulos).join(", ") + ")\n  " +
            [r.direccion, r.zona].filter(Boolean).join(", ") +
            (r.telefono ? " · 📱 " + r.telefono : "") +
            (r.precio ? " · Resta " + plata((Number(r.precio) || 0) - (Number(r.sena) || 0)) : "")
        )
        .join("\n\n");
    try {
      await navigator.clipboard.writeText(txt);
      mostrarToast("Resumen copiado ✓ pegalo en WhatsApp");
    } catch {
      window.prompt("Copiá el resumen:", txt);
    }
  };

  return (
    <div>
      <CabeceraVista
        titulo={"Hola" + (config.nombre ? " " + config.nombre : "") + " 👋"}
        sub={fmtFechaLarga(hoy)}
        accion={
          <Button variant="rojo" size="chico" onClick={() => onAbrirReserva(null)}>
            + Nueva reserva
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi valor={String(kpiMes)} etq="Reservas este mes" color="text-rojo" />
        <Kpi valor={String(kpiProx)} etq="Próximos 7 días" color="text-azul" />
        <Kpi valor={plata(ingresos)} etq="Ingresos del mes" color="text-verde" />
        <Kpi valor={String(kpiPend)} etq="Consultas sin cerrar" color="text-rosa" />
      </div>

      <Panel titulo="🚚 Próximas entregas">
        <div className="flex flex-col gap-2.5">
          {proximas.length === 0 ? (
            <Vacio>Sin entregas próximas. Cuando cargues reservas van a aparecer acá. 🎈</Vacio>
          ) : (
            proximas.map((r) => {
              const conf = conflictosDe(r, reservas, articulos).length > 0;
              return (
                <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-tinta bg-papel px-3 py-2.5">
                  <span className="min-w-[86px] font-alt font-extrabold">
                    {r.fecha.slice(8, 10)}/{r.fecha.slice(5, 7)}
                    {r.horaEntrega ? " · " + r.horaEntrega : ""}
                  </span>
                  <span className="min-w-[140px] flex-1">
                    <strong>{r.cliente || "Sin nombre"}</strong>
                    {conf && <span className="ml-1 font-alt text-[.78rem] text-rojo">⚠ conflicto</span>}
                    <small className="block text-[#5a4a41]">
                      {nombresInf(r.articuloIds, articulos).join(", ")}
                      {r.zona ? " · " + r.zona : ""}
                    </small>
                  </span>
                  <EstadoBadge estado={r.estado} />
                  <Button variant="blanco" size="mini" onClick={() => onAbrirReserva(r)}>
                    Abrir
                  </Button>
                </div>
              );
            })
          )}
        </div>
        <div className="mt-3 text-right">
          <Button variant="blanco" size="mini" onClick={copiarManiana}>
            📋 Copiar resumen de mañana
          </Button>
        </div>
      </Panel>

      <Panel titulo="📈 Ingresos últimos 6 meses">
        <div className="flex h-[120px] items-end gap-2.5 pt-2">
          {barras.map((b) => (
            <div key={b.mes} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                title={plata(b.val)}
                className={`w-full max-w-[46px] rounded-t-lg border-3 border-tinta shadow-hard-sm ${b.ultimo ? "bg-rojo" : "bg-azul"}`}
                style={{ height: b.pct + "%" }}
              />
              <span className="font-alt text-[.72rem] font-bold text-[#5a4a41]">{b.mes}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Kpi({ valor, etq, color }: { valor: string; etq: string; color: string }) {
  return (
    <div className="rounded-2xl border-3 border-tinta bg-white px-[18px] py-4 shadow-hard-sm">
      <div className={`font-display text-[2rem] leading-none ${color}`}>{valor}</div>
      <div className="mt-1.5 font-alt text-[.82rem] font-bold text-[#5a4a41]">{etq}</div>
    </div>
  );
}

