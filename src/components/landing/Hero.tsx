import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VisorFotos } from "@/components/ui/visor-fotos";
import { scrollAId } from "@/lib/scroll";
import { linkWhatsApp, MSG_INFLABLES } from "@/lib/whatsapp";

const FOTO_HERO = {
  src: "/img/hero.jpg",
  alt: "Castillo inflable de Astefil con arco de colores armado en un jardín",
};

export function Hero() {
  const [fotoAbierta, setFotoAbierta] = useState(false);

  return (
    <section className="relative py-14 pt-9 md:pt-14">
      <div className="container grid items-center gap-9 md:grid-cols-[1.1fr_.9fr] md:gap-11">
        <div>
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
          {/* Dato real y verificable, no un claim pendiente: la cobertura sale
              de la tabla `zonas` y el canal es el único que existe. */}
          <p className="sticker mb-5 inline-block !bg-white">
            Zona norte y noroeste del GBA · Te respondemos por WhatsApp
          </p>

          {/* Una sola acción principal. Antes eran tres botones del mismo peso
              y el ojo no tenía dónde caer, justo en la pantalla que más
              importa. WhatsApp va primero porque la visitante llega de
              Instagram o del QR del flyer: ya sabe qué alquilamos, y como no
              hay precios publicados, navegar el catálogo no le contesta
              "¿cuánto sale y tenés mi fecha?". Solo WhatsApp se la contesta. */}
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-3.5">
            <Button asChild variant="verde" className="w-full shadow-hard-lg sm:w-auto">
              <a href={linkWhatsApp(MSG_INFLABLES)} target="_blank" rel="noopener">
                Pedime precio por WhatsApp
              </a>
            </Button>
            <Button variant="blanco" size="chico" onClick={() => scrollAId("catalogo")}>
              Ver el catálogo
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
            <button
              type="button"
              onClick={() => setFotoAbierta(true)}
              aria-label="Ver la foto en grande"
              className="block w-full cursor-zoom-in"
            >
              <img
                src={FOTO_HERO.src}
                alt={FOTO_HERO.alt}
                width={860}
                height={1146}
                fetchPriority="high"
                decoding="sync"
                className="w-full rounded-lg border-3 border-tinta object-cover"
              />
            </button>
          </figure>
        </div>
      </div>

      <VisorFotos
        fotos={[FOTO_HERO]}
        indice={fotoAbierta ? 0 : null}
        onCerrar={() => setFotoAbierta(false)}
      />
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
