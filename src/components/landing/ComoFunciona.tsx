import { TituloSeccion } from "@/components/landing/TituloSeccion";
import { PASOS } from "@/data/site";

const COLOR_NUM = ["bg-rojo text-white", "bg-azul text-white", "bg-amarillo text-tinta", "bg-verde text-white"];

export function ComoFunciona() {
  return (
    <section className="pt-5">
      <div className="container">
        <TituloSeccion bandaClassName="bg-azul text-white">¿Cómo funciona?</TituloSeccion>

        <div className="mt-9 grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((p, i) => (
            <div key={p.titulo} className="rounded-lg border-3 border-tinta bg-papel p-[22px] shadow-hard">
              <div
                className={`mb-3.5 flex h-[58px] w-[58px] items-center justify-center rounded-full border-3 border-tinta font-display text-[2.2rem] shadow-hard-sm ${COLOR_NUM[i]}`}
              >
                {i + 1}
              </div>
              <h3 className="mb-2 text-[1.15rem] font-extrabold">{p.titulo}</h3>
              <p className="text-[.94rem] leading-[1.5] text-[#3c2f28]">{p.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
