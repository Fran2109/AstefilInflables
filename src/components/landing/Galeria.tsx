import { TituloSeccion } from "@/components/landing/TituloSeccion";
import { SITIO } from "@/data/site";
import { useLanding } from "@/context/LandingContext";
import { useCatalogo } from "@/context/CatalogoContext";

/** Fotos que se muestran en la tira (el visor abre la galería completa). */
const TIRA = ["rampa-salon", "castillo-salon", "noche", "castillo-parque", "castillo-pasto"];

export function Galeria() {
  const { abrirVisor } = useLanding();
  const { fotos: FOTOS, galeria } = useCatalogo();

  const abrir = (clave: string) =>
    abrirVisor({
      titulo: "Astefil en acción",
      tag: "📸 Fotos reales",
      desc: "Fiestas reales en jardines, salones y patios como el tuyo. Deslizá para ver todas.",
      fotos: galeria,
      indiceInicial: Math.max(0, galeria.indexOf(clave)),
    });

  return (
    <section id="fotos" className="border-y-3 border-tinta bg-papel">
      <div className="container pt-12">
        <TituloSeccion
          bandaClassName="bg-rosa"
          sub={
            <>
              Un vistazo a fiestas reales: en jardines, salones y patios como el tuyo. Más fotos en{" "}
              <a href={SITIO.instagram.url} target="_blank" rel="noopener">
                <strong>{SITIO.instagram.handle}</strong>
              </a>
              .
            </>
          }
        >
          Astefil en acción
        </TituloSeccion>
      </div>

      <div
        tabIndex={0}
        aria-label="Galería de fotos, deslizá para ver más"
        className="flex gap-[26px] overflow-x-auto px-5 pb-10 pt-[30px] [scroll-snap-type:x_mandatory]"
      >
        {TIRA.map((clave, i) => {
          const foto = FOTOS[clave];
          if (!foto) return null;
          return (
            <button
              key={clave}
              onClick={() => abrir(clave)}
              className={`flex-none cursor-zoom-in rounded-[10px] border-3 border-tinta bg-white p-2 pb-3 shadow-hard-sm [scroll-snap-align:center] ${
                i % 2 === 0 ? "-rotate-2" : "rotate-[1.6deg]"
              }`}
            >
              <img
                src={foto.src}
                alt={foto.alt}
                loading="lazy"
                className="h-[220px] w-auto rounded-md border-2 border-tinta"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
