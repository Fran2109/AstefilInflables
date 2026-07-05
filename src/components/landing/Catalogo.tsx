import { Button } from "@/components/ui/button";
import { TituloSeccion } from "@/components/landing/TituloSeccion";
import { ProductoCard } from "@/components/landing/ProductoCard";
import { PRODUCTOS } from "@/data/productos";
import { JUEGOS_SALON } from "@/data/site";
import { useLanding } from "@/context/LandingContext";

export function Catalogo() {
  const { precargar } = useLanding();

  return (
    <section id="catalogo" className="py-16">
      <div className="container">
        <TituloSeccion
          sub={
            <>
              Fotos reales de los equipos que llegan a tu fiesta. Tocá "Lo quiero" y armamos la
              consulta por WhatsApp.
            </>
          }
        >
          Nuestros inflables
        </TituloSeccion>

        <div className="mt-9 grid grid-cols-1 gap-[26px] sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTOS.map((p) => (
            <ProductoCard key={p.id} producto={p} />
          ))}
        </div>

        {/* Banda juegos de salón */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-[18px] rounded-lg border-3 border-tinta bg-azul p-[26px] text-white shadow-hard">
          <div>
            <h3 className="text-[1.5rem] font-extrabold">🎱 Juegos de salón</h3>
            <p className="mt-1 max-w-[34rem] opacity-95">
              Sumale clásicos que enganchan a chicos y grandes por igual. Combinálos con cualquier
              inflable.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {JUEGOS_SALON.map((j) => (
              <span key={j} className="chip">
                {j}
              </span>
            ))}
          </div>
          <Button size="chico" onClick={() => precargar("Juegos de salón")}>
            Consultar juegos
          </Button>
        </div>
      </div>
    </section>
  );
}
