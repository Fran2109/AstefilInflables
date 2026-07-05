import { TituloSeccion } from "@/components/landing/TituloSeccion";
import { FAQ } from "@/data/site";

export function Faq() {
  return (
    <section id="faq" className="pt-5">
      <div className="container">
        <TituloSeccion>Preguntas frecuentes</TituloSeccion>

        <div className="mx-auto mt-9 flex max-w-[760px] flex-col gap-4">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group overflow-hidden rounded-2xl border-3 border-tinta bg-papel shadow-hard-sm"
            >
              <summary className="relative cursor-pointer list-none py-[18px] pl-5 pr-[52px] font-alt text-[1.05rem] font-extrabold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-display text-[1.5rem] text-rojo group-open:hidden">
                  +
                </span>
                <span className="absolute right-4 top-1/2 hidden -translate-y-1/2 font-display text-[1.5rem] text-rojo group-open:block">
                  –
                </span>
              </summary>
              <p className="px-5 pb-[18px] leading-[1.55] text-[#3c2f28]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
