import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, MessageCircle } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { scrollAId } from "@/lib/scroll";
import { linkWhatsApp, mensajeConsulta } from "@/lib/whatsapp";

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
  { id: "cotizar", label: "Cotizá" },
  { id: "zonas", label: "Zonas" },
  { id: "faq", label: "Preguntas" },
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
    if (document.getElementById(id)) return scrollAId(id);
    navigate("/");
    let intentos = 0;
    const intentar = () => {
      if (document.getElementById(id)) return scrollAId(id);
      if (++intentos < 60) requestAnimationFrame(intentar);
    };
    requestAnimationFrame(intentar);
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

  return (
    <header className="sticky top-0 z-[60] border-b-3 border-tinta bg-papel">
      <div className="container flex items-center justify-between gap-4 py-2.5">
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

        {/* Links desktop */}
        <nav className="hidden items-center gap-1.5 md:flex">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => ir(l)}
              className={`whitespace-nowrap rounded-full border-3 px-3.5 py-2 font-alt text-[.98rem] font-bold transition ${
                l.destacado
                  ? "border-tinta bg-amarillo shadow-hard-sm hover:-translate-y-0.5 hover:bg-rosa"
                  : "border-transparent transition-colors hover:border-tinta hover:bg-amarillo"
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <Button asChild variant="verde" size="chico" className="hidden md:inline-flex">
          <a href={linkWhatsApp(mensajeConsulta(pathname))} target="_blank" rel="noopener">
            WhatsApp
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
