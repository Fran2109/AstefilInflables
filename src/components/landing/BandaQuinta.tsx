import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VisorFotos } from "@/components/ui/visor-fotos";
import { FotoResponsive } from "@/components/ui/foto-responsive";
import { useState } from "react";
import { QUINTA } from "@/data/quinta";

/**
 * Cross-sell de la quinta, en la landing de inflables.
 *
 * Ocupa el lugar donde `Testimonios` devuelve `null` (no hay reseñas reales
 * cargadas todavía y no se inventan). El contenido es real: hubo cumpleaños
 * con inflables de Astefil en la quinta, y las fotos son de esos eventos.
 *
 * Está acá y no en el hero a propósito. En el hero era un tercer botón del
 * mismo peso que competía con la acción principal; acá aparece después de que
 * la visitante ya vio el catálogo, que es cuando "¿y dónde lo hago?" es una
 * pregunta que se puede tener.
 */
export function BandaQuinta() {
  const navigate = useNavigate();
  const [abierta, setAbierta] = useState<number | null>(null);
  const fotos = QUINTA.fotosInflables.slice(0, 2);

  return (
    <section className="py-16">
      <div className="container">
        <div className="grid items-center gap-8 rounded-[calc(var(--radio)+8px)] border-3 border-tinta bg-verde/15 p-7 shadow-hard-lg md:grid-cols-[1fr_.85fr] md:p-10">
          <div>
            <h2 className="mb-3 text-[clamp(1.8rem,4vw,2.6rem)]">
              ¿Todavía no tenés dónde hacerlo?
            </h2>
            <p className="mb-6 max-w-[34rem] leading-[1.55]">
              Alquilamos <strong>la quinta {QUINTA.nombre}</strong> por día, {QUINTA.horario}, con
              pileta, parrilla y horno. Y sí: los inflables se pueden armar ahí mismo — en las
              fotos hay cumpleaños que hicimos así.
            </p>
            <Button variant="amarillo" onClick={() => navigate("/quinta")}>
              Conocé la quinta 🌳
            </Button>
          </div>

          <div className="flex gap-4">
            {fotos.map((f, i) => (
              <button
                key={f.src}
                type="button"
                onClick={() => setAbierta(i)}
                aria-label={`Ver foto: ${f.alt}`}
                className={`flex-1 cursor-zoom-in rounded-[10px] border-3 border-tinta bg-white p-2 pb-3 shadow-hard-sm transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-1 hover:shadow-hard ${
                  i % 2 === 0 ? "-rotate-2" : "rotate-[1.6deg]"
                }`}
              >
                <FotoResponsive
                  src={f.src}
                  alt={f.alt}
                  sizes="(min-width: 768px) 220px, 44vw"
                  className="aspect-[4/3] w-full rounded-md border-2 border-tinta object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <VisorFotos fotos={fotos} indice={abierta} onCerrar={() => setAbierta(null)} />
    </section>
  );
}
