import { Button } from "@/components/ui/button";
import { scrollAId } from "@/lib/scroll";
import { linkWhatsApp } from "@/lib/whatsapp";
import { HERO_STICKERS } from "@/data/site";

export function Hero() {
  return (
    <section className="relative py-14 pt-9 md:pt-14">
      <div className="container grid items-center gap-9 md:grid-cols-[1.1fr_.9fr] md:gap-11">
        <div>
          <div className="mb-5 flex flex-wrap gap-2.5">
            {HERO_STICKERS.map((s) => (
              <span key={s} className="sticker">
                {s}
              </span>
            ))}
          </div>
          <h1 className="text-[clamp(2.6rem,6vw,4.6rem)]">
            ¡QUE{" "}
            <span className="text-rojo [-webkit-text-stroke:2px_var(--tinta)]">SALTE</span> LA{" "}
            <span className="text-azul [-webkit-text-stroke:2px_var(--tinta)]">FIESTA</span>!
          </h1>
          <p className="my-6 max-w-[34rem] text-[1.12rem] leading-[1.55]">
            Alquiler de{" "}
            <strong>
              castillos inflables, rampas, carreras de obstáculos, acuáticos y juegos de salón
            </strong>{" "}
            para que tu evento sea el que todos recuerdan. Escribinos y coordinamos todo por
            WhatsApp.
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Button variant="rojo" onClick={() => scrollAId("catalogo")}>
              Ver el catálogo
            </Button>
            <Button asChild variant="verde">
              <a
                href={linkWhatsApp("¡Hola Astefil! Quiero consultar por un inflable 🎉")}
                target="_blank"
                rel="noopener"
              >
                Consultar ahora
              </a>
            </Button>
          </div>
        </div>

        {/* Foto real en polaroid torcido con globos flotando */}
        <div className="relative">
          <Globo className="left-[-6%] top-[8%] h-14 w-[46px] bg-rojo" />
          <Globo className="right-[4%] top-[-4%] h-[42px] w-[34px] bg-azul [animation-delay:.8s]" />
          <Globo className="bottom-[14%] left-[-9%] h-9 w-7 bg-rosa [animation-delay:.3s]" />

          <figure className="relative mx-auto max-w-[340px] rotate-[2.5deg] rounded-[14px] border-3 border-tinta bg-papel px-3 pb-4 pt-3 shadow-hard-lg md:max-w-[420px]">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-[-16px] h-8 w-[120px] -translate-x-1/2 -rotate-3 rounded border-2 border-tinta bg-amarillo/90"
            />
            <img
              src="/img/hero.jpg"
              alt="Castillo inflable de Astefil con arco de colores armado en un jardín"
              width={860}
              height={1146}
              className="w-full rounded-lg border-3 border-tinta object-cover"
            />
            <figcaption className="absolute -bottom-[18px] -right-3.5 -rotate-6 rounded-full border-3 border-tinta bg-rojo px-4 py-2 font-alt text-[.9rem] font-extrabold text-white shadow-hard-sm">
              📸 Foto real, es nuestro
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

function Globo({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute animate-flota rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-3 border-tinta after:absolute after:left-1/2 after:top-full after:h-[26px] after:w-0.5 after:bg-tinta after:content-[''] ${className ?? ""}`}
    />
  );
}
