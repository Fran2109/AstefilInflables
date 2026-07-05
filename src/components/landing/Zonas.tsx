import { ZONAS } from "@/data/site";

export function Zonas() {
  return (
    <section id="zonas" className="pt-5">
      <div className="container">
        <div className="rounded-[calc(var(--radio)+6px)] border-3 border-tinta bg-amarillo p-9 text-center shadow-hard-lg">
          <h2 className="mb-2.5 text-[clamp(1.8rem,4vw,2.6rem)]">¿Llegamos a tu zona?</h2>
          <p className="mx-auto mb-[22px] max-w-[44rem] leading-[1.55]">
            Trabajamos en <strong>zona norte y noroeste del GBA</strong>. Estas son algunas de las
            localidades donde ya estuvimos saltando — si la tuya no aparece, consultanos igual:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {ZONAS.map((z) => (
              <span key={z} className="chip !bg-white">
                {z}
              </span>
            ))}
            <span className="chip !bg-rojo !text-white">¿Otra? ¡Preguntá!</span>
          </div>
        </div>
      </div>
    </section>
  );
}
