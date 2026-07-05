import { Button } from "@/components/ui/button";
import { linkWhatsApp } from "@/lib/whatsapp";

export function CtaFinal() {
  return (
    <section className="pt-5">
      <div className="container">
        <div className="relative overflow-hidden rounded-[calc(var(--radio)+8px)] border-3 border-tinta bg-rojo px-[34px] py-12 text-center text-white shadow-hard-xl">
          <span className="absolute left-[8%] top-[18%] h-3.5 w-3.5 rotate-[18deg] border-2 border-tinta bg-amarillo" />
          <span className="absolute left-[14%] top-[64%] h-3.5 w-3.5 -rotate-12 rounded-full border-2 border-tinta bg-azul" />
          <span className="absolute right-[10%] top-[26%] h-3.5 w-3.5 rotate-[30deg] border-2 border-tinta bg-white" />
          <span className="absolute bottom-[16%] right-[16%] h-3.5 w-3.5 -rotate-[25deg] rounded-full border-2 border-tinta bg-amarillo" />

          <h2 className="mb-3 text-[clamp(2rem,5vw,3.2rem)]">Tu fiesta está a un salto</h2>
          <p className="mx-auto mb-[26px] max-w-[36rem] text-[1.08rem]">
            Contanos fecha y zona, y te confirmamos disponibilidad hoy mismo. Los mejores cumples se
            reservan antes.
          </p>
          <Button asChild size="full" className="max-w-sm">
            <a
              href={linkWhatsApp("¡Hola Astefil! Quiero reservar un inflable 🎈")}
              target="_blank"
              rel="noopener"
            >
              💬 Escribinos por WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
