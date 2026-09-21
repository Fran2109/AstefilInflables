import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, MessageCircle } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { scrollAId } from "@/lib/scroll";
import { linkWhatsApp, mensajeConsulta } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * Un link del nav: o scrollea a una sección de la página, o navega a otra
 * ruta. `destacado` lo pinta como chip llamativo (para la quinta).
 */
type LinkNav =
  | { label: string; id: string; ruta?: never; destacado?: boolean }
  | { label: string; ruta: string; id?: never; destacado?: boolean };

/** Nav de la landing: sus secciones en orden + la página de la quinta al final. */
const LINKS_LANDING: LinkNav[] = [
  { id: "catalogo", label: "Catálogo" },
  { id: "fotos", label: "Fotos" },
  { id: "comentarios", label: "Opiniones" },
  { id: "cotizar", label: "Cotizá" },
  { id: "zonas", label: "Zonas" },
  { id: "faq", label: "FAQ" },
  { ruta: "/quinta", label: "Quinta 🌳", destacado: true },
];

/** Nav dentro de /quinta: sus secciones + la vuelta a la landing, destacada. */
const LINKS_QUINTA: LinkNav[] = [
  { ruta: "/", label: "Catálogo 🎈", destacado: true },
  { id: "fotos", label: "Fotos" },
  { id: "consulta", label: "Consultá" },
];

export function Header() {
  const [abierto, setAbierto] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const links = pathname === "/quinta" ? LINKS_QUINTA : LINKS_LANDING;

  // Sección: si existe en la página actual scrollea acá; si no, es de la
  // landing → vuelve a "/" y scrollea recién cuando esté montada (reintenta
  // por frames porque el montaje puede tardar más de uno).
  const irSeccion = (id: string) => {
    setAbierto(false);

    const scrollear = () => {
      if (document.getElementById(id)) return scrollAId(id);
      navigate("/");
      let intentos = 0;
      const intentar = () => {
        if (document.getElementById(id)) return scrollAId(id);
        if (++intentos < 60) requestAnimationFrame(intentar);
      };
      requestAnimationFrame(intentar);
    };

    // Doble rAF antes de medir: el menú desplegable ocupa alto real, y
    // scrollear en el mismo tick calcula el destino con el menú TODAVÍA
    // abierto. Cuando React lo desmonta, la página se corre hacia arriba esa
    // misma altura y la sección termina fuera de pantalla — medido a 820px,
    // el scroll se pasaba 482px y caías después de la sección. Un frame
    // aplica el re-render y el otro deja el layout ya asentado.
    requestAnimationFrame(() => requestAnimationFrame(scrollear));
  };

  const irRuta = (ruta: string) => {
    setAbierto(false);
    if (pathname !== ruta) {
      navigate(ruta);
      // El router no resetea el scroll: la página nueva arranca desde arriba.
      window.scrollTo(0, 0);
    }
  };

  const ir = (l: LinkNav) => (l.ruta !== undefined ? irRuta(l.ruta) : irSeccion(l.id));

  /*
   * El nav de la landing son 7 chips y el de /quinta 3: el largo entra en una
   * tablet sólo si se lo aprieta.
   *
   * El presupuesto, medido a 768px: el contenedor útil es 728px y el logo se
   * lleva 171px, así que entre el nav y el botón de WhatsApp queda poco. De
   * ahí las tres decisiones de abajo, que juntas hacen entrar la fila: chips
   * chicos hasta `xl`, etiquetas cortas (FAQ, Opiniones) y el botón de
   * WhatsApp reducido a su ícono hasta `lg`.
   *
   * Las clases van completas y no armadas por concatenación: Tailwind no ve
   * las que se construyen en runtime y las purgaría del build.
   *
   * ⚠️ Al sumar o sacar un link, volver a medir el desborde de la fila a
   * 768px — es el ancho donde aparece y el que menos margen tiene.
   */
  const navLargo = links.length > 4;

  return (
    <header className="sticky top-0 z-[60] border-b-3 border-tinta bg-papel">
      <div className="container flex items-center justify-between gap-2 py-2.5 lg:gap-4">
        <button
          onClick={() => irSeccion("inicio")}
          aria-label="Astefil Inflables — inicio"
          className="flex items-center gap-2.5"
        >
          <Logo />
        </button>

        {/* Hamburguesa (mobile) */}
        <button
          onClick={() => setAbierto((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={abierto}
          className="rounded-xl border-3 border-tinta bg-amarillo p-2 shadow-hard-sm md:hidden"
        >
          <Menu strokeWidth={3} />
        </button>

        {/* Links desktop (ver `navLargo` arriba para el porqué del breakpoint) */}
        <nav
          className={cn(
            "hidden items-center",
            navLargo ? "gap-1 md:flex xl:gap-1.5" : "gap-1.5 md:flex"
          )}
        >
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => ir(l)}
              className={cn(
                "whitespace-nowrap rounded-full border-3 py-2 font-alt font-bold transition",
                // El nav largo entra apretado hasta `xl`; el corto no lo necesita.
                navLargo
                  ? "px-1.5 text-[.82rem] lg:px-2 lg:text-[.86rem] xl:px-3.5 xl:text-[.98rem]"
                  : "px-3.5 text-[.98rem]",
                l.destacado
                  ? "border-tinta bg-amarillo shadow-hard-sm hover:-translate-y-0.5 hover:bg-rosa"
                  : "border-transparent transition-colors hover:border-tinta hover:bg-amarillo"
              )}
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Con el nav largo el botón se reduce a su ícono hasta `lg`: con la
            palabra entera ocupa 115px y la fila no entra en una tablet. El
            `aria-label` mantiene el nombre accesible cuando el texto no está. */}
        <Button asChild variant="verde" size="chico" className="hidden md:inline-flex">
          <a
            href={linkWhatsApp(mensajeConsulta(pathname))}
            target="_blank"
            rel="noopener"
            aria-label="Escribinos por WhatsApp"
          >
            {navLargo ? (
              <>
                <MessageCircle className="h-[18px] w-[18px] lg:hidden" />
                <span className="hidden lg:inline">WhatsApp</span>
              </>
            ) : (
              "WhatsApp"
            )}
          </a>
        </Button>
      </div>

      {/* Menú mobile desplegable */}
      {abierto && (
        <div className="flex flex-col gap-3 border-b-3 border-tinta bg-papel px-[18px] pb-5 pt-4 md:hidden">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => ir(l)}
              className={`w-full rounded-full border-3 border-tinta px-4 py-3 text-center font-alt text-[1.08rem] font-bold shadow-hard-sm transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${
                l.destacado ? "bg-amarillo" : "bg-white"
              }`}
            >
              {l.label}
            </button>
          ))}
          <a
            href={linkWhatsApp(mensajeConsulta(pathname))}
            target="_blank"
            rel="noopener"
            onClick={() => setAbierto(false)}
            className="flex w-full items-center justify-center gap-2 rounded-full border-3 border-tinta bg-verde px-4 py-3 text-center font-alt text-[1.08rem] font-bold text-white shadow-hard-sm"
          >
            <MessageCircle className="h-5 w-5" /> Escribinos por WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
