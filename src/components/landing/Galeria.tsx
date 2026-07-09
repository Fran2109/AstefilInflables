import { useMemo } from "react";
import { TituloSeccion } from "@/components/landing/TituloSeccion";
import { SITIO } from "@/data/site";
import { useLanding } from "@/context/LandingContext";
import { useCatalogo } from "@/context/CatalogoContext";

const MAX_TIRA = 10;

/** Copia y desordena un array (Fisher–Yates). */
function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Tira "Astefil en acción": hasta 10 inflables al azar, con su foto de
 * portada real (subida desde el admin). Si todavía no se cargó ninguna foto,
 * se muestra un estado vacío en vez de la tira.
 */
export function Galeria() {
  const { abrirVisor } = useLanding();
  const { modelos } = useCatalogo();

  const conFoto = useMemo(
    () => modelos.filter((m) => m.fotos && m.fotos.length > 0),
    [modelos]
  );
  const tira = useMemo(() => mezclar(conFoto).slice(0, MAX_TIRA), [conFoto]);

  const abrir = (id: string) => {
    const m = tira.find((x) => x.id === id);
    if (!m) return;
    abrirVisor({
      titulo: m.nombre,
      tag: m.cat,
      desc: m.descripcion ?? "",
      fotos: m.fotos ?? [],
    });
  };

  return (
    <section id="fotos" className="border-y-3 border-tinta bg-papel">
      <div className="container pt-12">
        <TituloSeccion
          bandaClassName="bg-rosa"
          sub={
            <>
              Fotos reales de nuestros inflables, tal como llegan a tu fiesta. Más en{" "}
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

      {tira.length === 0 ? (
        <div className="container pb-12">
          <div className="mt-2 rounded-lg border-3 border-dashed border-tinta bg-cielo p-8 text-center">
            <p className="mx-auto max-w-[30rem] text-[1.05rem]">
              Estamos subiendo las fotos de cada inflable. Mientras tanto, mirá fiestas reales en{" "}
              <a href={SITIO.instagram.url} target="_blank" rel="noopener" className="font-extrabold">
                {SITIO.instagram.handle}
              </a>
              .
            </p>
          </div>
        </div>
      ) : (
        <div
          tabIndex={0}
          aria-label="Galería de fotos, deslizá para ver más"
          className="flex gap-[26px] overflow-x-auto px-5 pb-10 pt-[30px] [scroll-snap-type:x_mandatory]"
        >
          {tira.map((m, i) => (
            <button
              key={m.id}
              onClick={() => abrir(m.id)}
              className={`flex-none cursor-zoom-in rounded-[10px] border-3 border-tinta bg-white p-2 pb-3 shadow-hard-sm [scroll-snap-align:center] ${
                i % 2 === 0 ? "-rotate-2" : "rotate-[1.6deg]"
              }`}
            >
              <img
                src={m.fotos![0]}
                alt={m.nombre}
                loading="lazy"
                className="h-[220px] w-auto rounded-md border-2 border-tinta object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
