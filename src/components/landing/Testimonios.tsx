import { TituloSeccion } from "@/components/landing/TituloSeccion";
import { TESTIMONIOS } from "@/data/site";

const GLOBITO: Record<string, string> = {
  azul: "bg-azul",
  rojo: "bg-rojo",
  amarillo: "bg-amarillo",
};

const ROTACION = ["-rotate-[1.2deg]", "rotate-[.9deg]", "-rotate-[.6deg]"];

export function Testimonios() {
  // Sin reseñas cargadas todavía: no se muestra nada (evita mostrar la sección vacía).
  if (TESTIMONIOS.length === 0) return null;

  return (
    <section id="testimonios" className="pb-2 pt-16">
      <div className="container">
        <TituloSeccion
          bandaClassName="bg-azul text-white rotate-[1deg]"
          sub="Lo que nos dicen después de cada fiesta."
        >
          Familias que ya saltaron
        </TituloSeccion>

        <div className="mx-auto mt-11 grid max-w-[460px] grid-cols-1 gap-7 md:max-w-none md:grid-cols-3">
          {TESTIMONIOS.map((t, i) => (
            <article
              key={t.quien}
              className={`relative rounded-lg border-3 border-tinta bg-papel px-[22px] pb-5 pt-[26px] shadow-hard ${ROTACION[i]}`}
            >
              <span
                aria-hidden="true"
                className="absolute -top-6 left-4 font-display text-[3rem] leading-none text-rojo [-webkit-text-stroke:2px_var(--tinta)]"
              >
                "
              </span>
              <p className="text-[.98rem] leading-[1.55] text-[#3c2f28]">{t.texto}</p>
              <div className="mt-3.5 flex items-center gap-2 font-alt text-[.92rem] font-extrabold">
                <span
                  aria-hidden="true"
                  className={`inline-block h-[15px] w-3 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-2 border-tinta ${GLOBITO[t.color]}`}
                />
                {t.quien}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
