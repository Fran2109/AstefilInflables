import { useEffect, useState } from "react";
import { resumenClics, type ResumenClic } from "@/admin/lib/db";
import { useAdmin } from "@/admin/store/AdminContext";
import { CabeceraVista, Panel, Vacio } from "@/admin/views/comunes";
import { campoInputCls } from "@/admin/components/Campo";
import { Select } from "@/components/ui/select";

const PERIODOS: Record<string, number> = {
  "Últimos 7 días": 7,
  "Últimos 30 días": 30,
  "Últimos 90 días": 90,
};

const ETIQUETAS: Record<string, string> = {
  hero: "Portada",
  cotizador: "Cotizador",
  catalogo: "Catálogo",
  modelo: "Tarjeta de un modelo",
  visor: "Detalle del producto",
  zonas: "Zonas",
  "cta-final": "Llamado final",
  header: "Menú de arriba",
  flotante: "Botón flotante",
  footer: "Pie de página",
  "formulario-quinta": "Formulario",
  otro: "Otro",
};

export function MetricasView() {
  const { online } = useAdmin();
  const [periodo, setPeriodo] = useState("Últimos 30 días");
  const [filas, setFilas] = useState<ResumenClic[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!online) return;
    let vigente = true;
    setFilas(null);
    setError(false);
    const desde = new Date(Date.now() - PERIODOS[periodo] * 86400000).toISOString();
    resumenClics(desde).then(
      (r) => vigente && setFilas(r),
      () => vigente && setError(true)
    );
    return () => {
      vigente = false;
    };
  }, [online, periodo]);

  const total = (filas ?? []).reduce((suma, f) => suma + f.total, 0);

  return (
    <div>
      <CabeceraVista
        titulo="Métricas"
        sub="Qué botón de WhatsApp toca la gente. Un click no siempre termina en un mensaje enviado."
        accion={
          online && (
            <div className="w-[200px]">
              <Select value={periodo} onChange={setPeriodo} options={Object.keys(PERIODOS)} triggerClassName={campoInputCls} />
            </div>
          )
        }
      />

      {!online ? (
        <Vacio>Las métricas se guardan en la nube: en modo local no hay datos.</Vacio>
      ) : error ? (
        <Vacio>No pudimos cargar las métricas. Probá de nuevo en un rato.</Vacio>
      ) : filas === null ? (
        <Vacio>Cargando…</Vacio>
      ) : total === 0 ? (
        <Vacio>Todavía no hay clicks en este período.</Vacio>
      ) : (
        <Panel titulo={`${total} ${total === 1 ? "click" : "clicks"} a WhatsApp`}>
          <ul className="flex flex-col">
            {filas.map((f) => (
              <li
                key={f.pagina + f.origen}
                className="flex items-baseline justify-between gap-3 border-b-2 border-dashed border-[#e5d9cd] py-2.5 last:border-b-0"
              >
                <span className="min-w-0 font-alt font-bold">
                  {ETIQUETAS[f.origen] ?? f.origen}
                  {f.pagina === "quinta" && <span className="font-semibold text-[#5a4a41]"> · Quinta</span>}
                </span>
                <span className="flex-none font-alt font-extrabold tabular-nums">
                  {f.total} <small className="font-semibold text-[#5a4a41]">({Math.round((f.total / total) * 100)}%)</small>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
