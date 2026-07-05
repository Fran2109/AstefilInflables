import { MARQUEE } from "@/data/site";

export function Marquee() {
  // Se duplica la lista para que el loop de -50% sea perfecto.
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div aria-hidden="true" className="overflow-hidden border-y-3 border-tinta bg-rojo py-3">
      <div className="flex w-max animate-rodar">
        {items.map((palabra, i) => (
          <span key={i} className="flex items-center whitespace-nowrap">
            <span className="px-[22px] font-display text-[1.35rem] tracking-[.5px] text-white">
              {palabra}
            </span>
            <span className="font-display text-[1.35rem] text-amarillo">★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
