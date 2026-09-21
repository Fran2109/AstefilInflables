import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { ModeloPublico } from "@/types/catalogo";
import { TituloSeccion } from "@/components/landing/TituloSeccion";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { OPCIONES_LUGAR, SITIO } from "@/data/site";
import { linkCotizacion } from "@/lib/whatsapp";
import { useLanding } from "@/context/LandingContext";
import { useCatalogo } from "@/context/CatalogoContext";

const inputCls =
  "w-full rounded-xl border-3 border-tinta bg-white px-3.5 py-3 font-body text-base text-tinta shadow-[inset_3px_3px_0_rgba(27,19,16,.08)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-azul";
const labelCls = "mb-1.5 block font-alt text-[.92rem] font-extrabold";

export function Cotizador() {
  const { inflableSeleccionado, setInflableSeleccionado } = useLanding();
  const { modelos, categorias, cargando } = useCatalogo();
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [horarioDesde, setHorarioDesde] = useState("");
  const [horarioHasta, setHorarioHasta] = useState("");
  const [zona, setZona] = useState("");
  const [lugar, setLugar] = useState("");
  const [direccion, setDireccion] = useState("");

  const datos = {
    nombre,
    inflable: inflableSeleccionado,
    fecha,
    horarioDesde,
    horarioHasta,
    zona,
    lugar,
    direccion,
  };
  const waLink = linkCotizacion(datos);

  const delInventario = useMemo(() => nombresDeModelos(categorias, modelos), [categorias, modelos]);

  // Si precargaron un valor que no está en el inventario, lo mostramos igual.
  // Pasa desde el overview del catálogo, que precarga el nombre de la
  // categoría ("Castillos") y no el de un modelo puntual.
  const opciones =
    !inflableSeleccionado || delInventario.includes(inflableSeleccionado)
      ? delInventario
      : [inflableSeleccionado, ...delInventario];

  return (
    <section id="cotizar" className="py-16">
      <div className="container">
        <TituloSeccion
          bandaClassName="bg-verde text-white"
          sub="Completá lo que sepas, tocá el botón y te abrimos WhatsApp con el mensaje ya armado. Sin vueltas."
        >
          Cotizá en 30 segundos
        </TituloSeccion>

        <div className="mx-auto mt-10 max-w-[760px] rounded-[calc(var(--radio)+6px)] border-3 border-tinta bg-papel p-6 shadow-hard-lg md:p-[34px]">
          <div className="my-6 grid grid-cols-1 gap-[18px] md:grid-cols-2">
            <div>
              <label htmlFor="f-nombre" className={labelCls}>
                Tu nombre
              </label>
              <input
                id="f-nombre"
                type="text"
                placeholder="Ej: Caro"
                autoComplete="name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label id="f-inflable-label" htmlFor="f-inflable" className={labelCls}>
                ¿Qué te interesa?
              </label>
              <Select
                id="f-inflable"
                ariaLabelledBy="f-inflable-label"
                value={inflableSeleccionado}
                onChange={setInflableSeleccionado}
                options={opciones}
                placeholder="Todavía no sé, quiero ver opciones"
                vacio={
                  cargando
                    ? "Cargando el catálogo…"
                    : "Todavía no hay modelos cargados — escribinos y te contamos"
                }
                triggerClassName={inputCls}
              />
            </div>
            <div>
              <label id="f-fecha-label" htmlFor="f-fecha" className={labelCls}>
                Fecha del evento
              </label>
              <DatePicker
                id="f-fecha"
                ariaLabelledBy="f-fecha-label"
                value={fecha}
                onChange={setFecha}
                triggerClassName={inputCls}
              />
            </div>
            <div>
              <label htmlFor="f-horario-desde" className={labelCls}>
                Horario tentativo
              </label>
              <div className="flex items-center gap-2">
                <TimePicker
                  id="f-horario-desde"
                  ariaLabel="Horario desde"
                  value={horarioDesde}
                  onChange={setHorarioDesde}
                  triggerClassName={inputCls}
                />
                <span className="font-alt font-bold text-[#5a4a41]">a</span>
                <TimePicker
                  id="f-horario-hasta"
                  ariaLabel="Horario hasta"
                  value={horarioHasta}
                  onChange={setHorarioHasta}
                  triggerClassName={inputCls}
                />
              </div>
            </div>
            <div>
              <label htmlFor="f-zona" className={labelCls}>
                Zona / localidad
              </label>
              <input
                id="f-zona"
                type="text"
                placeholder="Ej: Grand Bourg"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label id="f-lugar-label" htmlFor="f-lugar" className={labelCls}>
                ¿Dónde es la fiesta?
              </label>
              <Select
                id="f-lugar"
                ariaLabelledBy="f-lugar-label"
                value={lugar}
                onChange={setLugar}
                options={OPCIONES_LUGAR}
                placeholder="Elegí una opción"
                triggerClassName={inputCls}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="f-direccion" className={labelCls}>
                Dirección
              </label>
              <input
                id="f-direccion"
                type="text"
                placeholder="Ej: Los Ceibos 120"
                autoComplete="street-address"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <Button asChild variant="verde" size="full" data-cta-conversion>
            <a href={waLink} target="_blank" rel="noopener">
              <MessageCircle className="h-[22px] w-[22px]" />
              Enviar consulta por WhatsApp
            </a>
          </Button>

          <p className="mt-3.5 text-center text-[.88rem] text-[#5a4a41]">
            Te respondemos con precio y disponibilidad para tu fecha. También por{" "}
            <a href={SITIO.instagram.url} target="_blank" rel="noopener">
              <strong>Instagram</strong>
            </a>{" "}
            o{" "}
            <a href={SITIO.facebook.url} target="_blank" rel="noopener">
              <strong>Facebook</strong>
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Los modelos reales del inventario, para el select "¿Qué te interesa?".
 *
 * Antes era `OPCIONES_INFLABLE`, una lista escrita a mano que no coincidía ni
 * con las categorías ni con lo que Astefil tiene: ofrecía cosas que podían no
 * existir y se callaba las que sí. Salen ordenados por categoría (el orden del
 * ABM) y después por nombre, así los de un mismo tipo quedan juntos en la
 * lista.
 */
function nombresDeModelos(categorias: string[], modelos: ModeloPublico[]): string[] {
  const orden = new Map(categorias.map((c, i) => [c, i]));
  const ultimo = categorias.length;
  const ordenados = [...modelos].sort(
    (a, b) =>
      (orden.get(a.cat) ?? ultimo) - (orden.get(b.cat) ?? ultimo) ||
      a.nombre.localeCompare(b.nombre, "es")
  );
  // Sin duplicados: el nombre es la clave de cada opción del select.
  return [...new Set(ordenados.map((m) => m.nombre))];
}
