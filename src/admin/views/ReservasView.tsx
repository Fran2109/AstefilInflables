import { useMemo, useState } from "react";
import type { Reserva } from "@/admin/types";
import { ESTADOS } from "@/admin/types";
import { DOWS, MESES, dowDe, hoyStr } from "@/admin/lib/fechas";
import { plata } from "@/admin/lib/formato";
import { conflictosDe, nombresInf } from "@/admin/lib/conflictos";
import { linkWaCliente } from "@/admin/lib/whatsapp";
import { useAdmin } from "@/admin/store/AdminContext";
import { useConfirmar } from "@/admin/components/Confirm";
import { CabeceraVista, Vacio } from "@/admin/views/comunes";
import { EstadoBadge } from "@/admin/components/EstadoBadge";
import { campoInputCls } from "@/admin/components/Campo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReservasView({ onAbrirReserva }: { onAbrirReserva: (r: Reserva | null) => void }) {
  const { reservas, inflables, avanzarEstado, mostrarToast } = useAdmin();
  const confirmar = useConfirmar();
  const [busca, setBusca] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fMes, setFMes] = useState("");

  const meses = useMemo(() => {
    const set = new Set(reservas.map((r) => r.fecha.slice(0, 7)));
    set.add(hoyStr().slice(0, 7));
    return [...set].sort().reverse();
  }, [reservas]);

  const lista = useMemo(() => {
    const q = busca.toLowerCase().trim();
    let l = [...reservas];
    if (q) l = l.filter((r) => (r.cliente || "").toLowerCase().includes(q) || (r.zona || "").toLowerCase().includes(q));
    if (fEstado) l = l.filter((r) => r.estado === fEstado);
    if (fMes) l = l.filter((r) => r.fecha.startsWith(fMes));
    return l.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [reservas, busca, fEstado, fMes]);

  const avanzar = async (r: Reserva) => {
    const idx = ESTADOS.indexOf(r.estado);
    const sig = idx >= 0 && idx < 4 ? ESTADOS[idx + 1] : null;
    if (!sig) return;
    const ok = await confirmar({
      titulo: "Avanzar estado",
      mensaje: (
        <>
          ¿Pasar la reserva de <strong>{r.cliente || "este cliente"}</strong> de{" "}
          <strong>{r.estado}</strong> a <strong>{sig}</strong>?
        </>
      ),
      textoConfirmar: "Avanzar a " + sig,
    });
    if (!ok) return;
    await avanzarEstado(r);
    mostrarToast("→ " + sig);
  };

  return (
    <div>
      <CabeceraVista
        titulo="Reservas"
        accion={
          <Button variant="rojo" size="chico" onClick={() => onAbrirReserva(null)}>
            + Nueva reserva
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2.5">
        <input
          type="search"
          placeholder="Buscar cliente o zona…"
          className={cn(campoInputCls, "max-w-[240px]")}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select className={cn(campoInputCls, "max-w-[200px]")} value={fEstado} onChange={(e) => setFEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select className={cn(campoInputCls, "max-w-[200px]")} value={fMes} onChange={(e) => setFMes(e.target.value)}>
          <option value="">Todos los meses</option>
          {meses.map((m) => (
            <option key={m} value={m}>
              {MESES[Number(m.slice(5)) - 1]} {m.slice(0, 4)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {lista.length === 0 ? (
          <Vacio>No hay reservas con esos filtros. Creá la primera con "+ Nueva reserva". 🎪</Vacio>
        ) : (
          lista.map((r) => {
            const confs = conflictosDe(r, reservas, inflables);
            const resto = (Number(r.precio) || 0) - (Number(r.sena) || 0);
            const idx = ESTADOS.indexOf(r.estado);
            const sig = idx >= 0 && idx < 4 ? ESTADOS[idx + 1] : null;
            const wa = linkWaCliente(r, inflables);
            return (
              <div
                key={r.id}
                className={cn(
                  "grid grid-cols-[74px_1fr] items-center gap-3 rounded-2xl border-3 border-tinta bg-white px-4 py-3.5 shadow-hard-sm md:grid-cols-[100px_1.4fr_1fr_auto]",
                  confs.length && "border-rojo shadow-[4px_4px_0_var(--rojo)]"
                )}
              >
                <div className="text-center">
                  <div className="font-display text-[1.6rem] leading-none">{Number(r.fecha.slice(8, 10))}</div>
                  <div className="font-alt text-[.72rem] font-extrabold uppercase text-[#5a4a41]">
                    {MESES[Number(r.fecha.slice(5, 7)) - 1].slice(0, 3)}
                  </div>
                  <div className="text-[.72rem] text-gris">{DOWS[dowDe(r.fecha)]}</div>
                </div>

                <div className="min-w-0">
                  <h4 className="flex flex-wrap items-center gap-2 text-[1.05rem]">
                    {r.cliente || "Sin nombre"} <EstadoBadge estado={r.estado} />
                  </h4>
                  <div className="text-[.86rem] text-[#5a4a41]">
                    {nombresInf(r.inflableIds, inflables).join(", ") || "—"}
                  </div>
                  <div className="text-[.86rem] text-[#5a4a41]">
                    {[r.zona, r.direccion].filter(Boolean).join(" · ")}
                    {(r.horaEntrega || r.horaRetiro) && " · " + (r.horaEntrega || "?") + "–" + (r.horaRetiro || "?")}
                  </div>
                  {confs.length > 0 && (
                    <div className="font-alt text-[.78rem] font-semibold text-rojo">
                      ⚠ Mismo inflable ya reservado ese día ({confs.map((c) => c.res.cliente || "otra reserva").join(", ")})
                    </div>
                  )}
                </div>

                <div className="font-alt text-[.95rem] font-extrabold max-md:col-span-2">
                  {plata(r.precio)}
                  <small className="block font-semibold text-[#5a4a41]">
                    Seña {plata(r.sena)} · Resta {plata(resto)}
                  </small>
                </div>

                <div className="flex flex-col items-stretch gap-1.5 max-md:col-span-2 max-md:flex-row max-md:flex-wrap">
                  {wa && (
                    <Button asChild variant="verde" size="mini">
                      <a href={wa} target="_blank" rel="noopener">WhatsApp</a>
                    </Button>
                  )}
                  {sig && (
                    <Button variant="azul" size="mini" onClick={() => avanzar(r)}>
                      → {sig}
                    </Button>
                  )}
                  <Button variant="blanco" size="mini" onClick={() => onAbrirReserva(r)}>
                    Editar
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
