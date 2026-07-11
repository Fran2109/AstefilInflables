import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { TituloSeccion } from "@/components/landing/TituloSeccion";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { VisorFotos } from "@/components/ui/visor-fotos";
import { linkConsultaQuinta } from "@/lib/whatsapp";
import { scrollAId } from "@/lib/scroll";
import { QUINTA, MOTIVOS_QUINTA } from "@/data/quinta";

const inputCls =
  "w-full rounded-xl border-3 border-tinta bg-white px-3.5 py-3 font-body text-base text-tinta shadow-[inset_3px_3px_0_rgba(27,19,16,.08)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-azul";
const labelCls = "mb-1.5 block font-alt text-[.92rem] font-extrabold";

/**
 * Página propia de la quinta "El Esfuerzo" (`/quinta`). Contenido estático
 * (ver `data/quinta.ts`): una sola quinta que no cambia seguido, sin ABM.
 * La ubicación no se publica: el formulario de consulta la pide por WhatsApp
 * junto con el precio y la disponibilidad.
 */
export function QuintaPage() {
  // Índice de la foto abierta en el visor de la galería (null = cerrado).
  const [fotoAbierta, setFotoAbierta] = useState<number | null>(null);

  // Título propio + arrancar arriba (el router no resetea el scroll).
  useEffect(() => {
    const previo = document.title;
    document.title = `Quinta ${QUINTA.nombre} · Astefil Inflables`;
    window.scrollTo(0, 0);
    return () => {
      document.title = previo;
    };
  }, []);

  return (
    <>
      <Header />
      {/* id="inicio": el logo del Header scrollea al tope de la página actual. */}
      <main id="inicio">
        {/* Hero */}
        <section className="py-14 pt-9 md:pt-14">
          <div className="container grid items-center gap-9 md:grid-cols-[1.1fr_.9fr] md:gap-11">
            <div>
              <h1 className="text-[clamp(2.4rem,5.5vw,4.2rem)]">
                QUINTA{" "}
                <span className="text-rojo [-webkit-text-stroke:2px_var(--tinta)]">EL</span>{" "}
                <span className="text-azul [-webkit-text-stroke:2px_var(--tinta)]">ESFUERZO</span>
              </h1>
              <p className="my-6 max-w-[34rem] text-[1.12rem] leading-[1.55]">
                Nuestra quinta para pasar el día: <strong>pileta, parrilla y todas las
                comodidades</strong>, {QUINTA.horario}. Contanos qué estás organizando y te
                pasamos precio, disponibilidad y ubicación por WhatsApp.
              </p>
              <div className="flex flex-wrap gap-3.5">
                <Button variant="verde" onClick={() => scrollAId("consulta")}>
                  Consultar por la quinta
                </Button>
              </div>
            </div>

            {/* Polaroid de portada */}
            <figure className="relative mx-auto w-full max-w-[340px] rotate-[2.5deg] rounded-[14px] border-3 border-tinta bg-papel px-3 pb-4 pt-3 shadow-hard-lg md:max-w-[420px]">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-[-16px] h-8 w-[120px] -translate-x-1/2 -rotate-3 rounded border-2 border-tinta bg-amarillo/90"
              />
              <img
                src={QUINTA.portada.src}
                alt={QUINTA.portada.alt}
                width={1400}
                height={1050}
                className="w-full rounded-lg border-3 border-tinta object-cover"
              />
            </figure>
          </div>
        </section>

        {/* Fotos reales */}
        <section id="fotos" className="border-y-3 border-tinta bg-papel py-12">
          <div className="container">
            <TituloSeccion
              bandaClassName="bg-cielo"
              sub="El parque, la pileta, la pérgola y los rincones de la quinta, tal como los vas a encontrar."
            >
              La quinta en fotos
            </TituloSeccion>
            <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3">
              {QUINTA.fotos.map((f, i) => (
                <button
                  key={f.src}
                  type="button"
                  onClick={() => setFotoAbierta(i)}
                  className={`cursor-zoom-in rounded-[10px] border-3 border-tinta bg-white p-2 pb-3 shadow-hard-sm transition hover:-translate-y-0.5 ${
                    i % 2 === 0 ? "-rotate-1" : "rotate-[1.2deg]"
                  }`}
                >
                  <img
                    src={f.src}
                    alt={f.alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-md border-2 border-tinta object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        <VisorFotos
          fotos={QUINTA.fotos}
          indice={fotoAbierta}
          onCerrar={() => setFotoAbierta(null)}
        />

        {/* Qué incluye + condiciones */}
        <section className="py-12">
          <div className="container grid gap-6 md:grid-cols-2">
            <div className="rounded-[var(--radio)] border-3 border-tinta bg-white p-7 shadow-hard">
              <h3 className="mb-4 text-[1.5rem]">¿Qué incluye?</h3>
              <div className="flex flex-wrap gap-2.5">
                {QUINTA.comodidades.map((c) => (
                  <span key={c} className="chip !bg-cielo">
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-5 rounded-xl border-3 border-tinta bg-cielo p-4">
                <strong>🏊 La pileta:</strong> {QUINTA.pileta.medidas}, con una profundidad que va{" "}
                {QUINTA.pileta.profundidad}.
              </div>
            </div>

            <div className="rounded-[var(--radio)] border-3 border-tinta bg-white p-7 shadow-hard">
              <h3 className="mb-4 text-[1.5rem]">Para tener en cuenta</h3>
              <ul className="flex flex-col gap-3 text-[1rem] leading-[1.5] text-[#3c2f28]">
                {QUINTA.condiciones.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <span className="mt-0.5 text-[.9rem] text-rojo">★</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <SeccionInflables />

        <FormularioConsulta />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

/**
 * Cross-sell real: en la quinta ya se armaron cumpleaños con inflables de
 * Astefil (la foto es de uno). Los artículos del catálogo se cotizan aparte.
 */
function SeccionInflables() {
  const navigate = useNavigate();
  // Índice de la foto abierta en el visor de esta sección (null = cerrado).
  const [fotoAbierta, setFotoAbierta] = useState<number | null>(null);

  // Va al catálogo de la landing (misma técnica que el Header: navegar y
  // scrollear recién cuando la landing está montada).
  const irAlCatalogo = () => {
    navigate("/");
    let intentos = 0;
    const intentar = () => {
      if (document.getElementById("catalogo")) return scrollAId("catalogo");
      if (++intentos < 60) requestAnimationFrame(intentar);
    };
    requestAnimationFrame(intentar);
  };

  return (
    <section className="border-y-3 border-tinta bg-cielo py-12">
      <div className="container grid items-center gap-9 md:grid-cols-[1fr_1fr]">
        <div className="mx-auto grid w-full max-w-[480px] grid-cols-2 gap-5">
          {QUINTA.fotosInflables.map((f, i) => (
            <button
              key={f.src}
              type="button"
              onClick={() => setFotoAbierta(i)}
              className={`cursor-zoom-in rounded-[10px] border-3 border-tinta bg-papel p-2 pb-3 shadow-hard-sm transition hover:-translate-y-0.5 ${
                i % 2 === 0 ? "-rotate-1" : "rotate-[1.4deg]"
              }`}
            >
              <img
                src={f.src}
                alt={f.alt}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-md border-2 border-tinta object-cover"
              />
            </button>
          ))}
        </div>
        <div>
          <h2 className="mb-3 text-[clamp(1.8rem,4vw,2.6rem)]">¿Le sumamos inflables? 🎈</h2>
          <p className="mb-5 max-w-[36rem] text-[1.05rem] leading-[1.55]">
            La quinta y los inflables son la combinación que mejor nos sale: castillos, tobogán
            acuático, juegos de salón o candy bar, armados en el mismo parque (como en las fotos,
            de eventos reales acá). Se cotizan aparte — decinos qué te gustaría sumar cuando
            consultes.
          </p>
          <Button variant="rojo" onClick={irAlCatalogo}>
            Ver el catálogo
          </Button>
        </div>
      </div>

      <VisorFotos
        fotos={QUINTA.fotosInflables}
        indice={fotoAbierta}
        onCerrar={() => setFotoAbierta(null)}
      />
    </section>
  );
}

/**
 * Formulario de consulta: arma el mensaje de WhatsApp en vivo (mismo patrón
 * que el Cotizador de la landing). La respuesta incluye la ubicación exacta,
 * que no se publica en la página.
 */
function FormularioConsulta() {
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [personas, setPersonas] = useState("");
  const [motivo, setMotivo] = useState("");

  const waLink = linkConsultaQuinta({ nombre, fecha, fechaHasta, personas, motivo, extras: [] });

  return (
    <section id="consulta" className="pb-16 pt-12">
      <div className="container">
        <TituloSeccion
          bandaClassName="bg-verde text-white"
          sub="Completá lo que sepas y te abrimos WhatsApp con el mensaje armado. Te respondemos con precio, disponibilidad y la ubicación exacta."
        >
          Consultá por la quinta
        </TituloSeccion>

        <div className="mx-auto mt-10 max-w-[760px] rounded-[calc(var(--radio)+6px)] border-3 border-tinta bg-papel p-6 shadow-hard-lg md:p-[34px]">
          <div className="my-6 grid grid-cols-1 gap-[18px] md:grid-cols-2">
            <div>
              <label htmlFor="q-nombre" className={labelCls}>
                Tu nombre
              </label>
              <input
                id="q-nombre"
                type="text"
                placeholder="Ej: Caro"
                autoComplete="name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="q-personas" className={labelCls}>
                Cantidad de personas
              </label>
              <input
                id="q-personas"
                type="number"
                min={30}
                step={5}
                inputMode="numeric"
                placeholder="Ej: 50"
                value={personas}
                onChange={(e) => setPersonas(e.target.value)}
                onBlur={() => {
                  // Regla del alquiler: mínimo 30 personas (las flechas saltan de a 5).
                  if (personas && Number(personas) < 30) setPersonas("30");
                }}
                className={inputCls}
              />
              <p className="mt-1.5 text-[.78rem] text-[#5a4a41]">Mínimo: 30 personas.</p>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="q-fecha" className={labelCls}>
                Fecha (una puntual, o un rango si tenés flexibilidad)
              </label>
              <div className="flex items-center gap-2">
                <DatePicker id="q-fecha" value={fecha} onChange={setFecha} triggerClassName={inputCls} />
                <span className="font-alt font-bold text-[#5a4a41]">al</span>
                <DatePicker
                  id="q-fecha-hasta"
                  value={fechaHasta}
                  onChange={setFechaHasta}
                  triggerClassName={inputCls}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="q-motivo" className={labelCls}>
                Motivo del evento
              </label>
              <Select
                id="q-motivo"
                value={motivo}
                onChange={setMotivo}
                options={MOTIVOS_QUINTA}
                placeholder="Elegí una opción"
                triggerClassName={inputCls}
              />
            </div>
          </div>

          <Button asChild variant="verde" size="full">
            <a href={waLink} target="_blank" rel="noopener">
              <MessageCircle className="h-[22px] w-[22px]" />
              Enviar consulta por WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
