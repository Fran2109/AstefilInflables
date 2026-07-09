import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { TituloSeccion } from "@/components/landing/TituloSeccion";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { OPCIONES_INFLABLE, OPCIONES_LUGAR, SITIO } from "@/data/site";
import { linkCotizacion } from "@/lib/whatsapp";
import { useLanding } from "@/context/LandingContext";

const inputCls =
  "w-full rounded-xl border-3 border-tinta bg-white px-3.5 py-3 font-body text-base text-tinta shadow-[inset_3px_3px_0_rgba(27,19,16,.08)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-azul";
const labelCls = "mb-1.5 block font-alt text-[.92rem] font-extrabold";

export function Cotizador() {
  const { inflableSeleccionado, setInflableSeleccionado } = useLanding();
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [horarioDesde, setHorarioDesde] = useState("");
  const [horarioHasta, setHorarioHasta] = useState("");
  const [zona, setZona] = useState("");
  const [lugar, setLugar] = useState("");
  const [direccion, setDireccion] = useState("");

  const waLink = linkCotizacion({
    nombre,
    inflable: inflableSeleccionado,
    fecha,
    horarioDesde,
    horarioHasta,
    zona,
    lugar,
    direccion,
  });

  // Si precargaron un valor que no está en la lista base, lo mostramos igual.
  const opciones = OPCIONES_INFLABLE.includes(inflableSeleccionado) || !inflableSeleccionado
    ? OPCIONES_INFLABLE
    : [inflableSeleccionado, ...OPCIONES_INFLABLE];

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
              <label htmlFor="f-inflable" className={labelCls}>
                ¿Qué te interesa?
              </label>
              <Select
                id="f-inflable"
                value={inflableSeleccionado}
                onChange={setInflableSeleccionado}
                options={opciones}
                placeholder="Todavía no sé, quiero ver opciones"
                triggerClassName={inputCls}
              />
            </div>
            <div>
              <label htmlFor="f-fecha" className={labelCls}>
                Fecha del evento
              </label>
              <DatePicker
                id="f-fecha"
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
              <label htmlFor="f-lugar" className={labelCls}>
                ¿Dónde es la fiesta?
              </label>
              <Select
                id="f-lugar"
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

          <Button asChild variant="verde" size="full">
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
