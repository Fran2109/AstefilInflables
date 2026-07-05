import { useState } from "react";
import { Menu, MessageCircle } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { scrollAId } from "@/lib/scroll";
import { linkWhatsApp } from "@/lib/whatsapp";

const LINKS = [
  { id: "catalogo", label: "Catálogo" },
  { id: "fotos", label: "Fotos" },
  { id: "cotizar", label: "Cotizá" },
  { id: "zonas", label: "Zonas" },
  { id: "faq", label: "Preguntas" },
];

export function Header() {
  const [abierto, setAbierto] = useState(false);

  const ir = (id: string) => {
    setAbierto(false);
    scrollAId(id);
  };

  return (
    <header className="sticky top-0 z-[60] border-b-3 border-tinta bg-papel">
      <div className="container flex items-center justify-between gap-4 py-2.5">
        <button
          onClick={() => ir("inicio")}
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
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => ir(l.id)}
              className="rounded-full border-3 border-transparent px-3.5 py-2 font-alt text-[.98rem] font-bold transition-colors hover:border-tinta hover:bg-amarillo"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <Button asChild variant="verde" size="chico" className="hidden md:inline-flex">
          <a href={linkWhatsApp()} target="_blank" rel="noopener">
            WhatsApp
          </a>
        </Button>
      </div>

      {/* Menú mobile desplegable */}
      {abierto && (
        <div className="flex flex-col gap-3 border-b-3 border-tinta bg-papel px-[18px] pb-5 pt-4 md:hidden">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => ir(l.id)}
              className="w-full rounded-full border-3 border-tinta bg-white px-4 py-3 text-center font-alt text-[1.08rem] font-bold shadow-hard-sm transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              {l.label}
            </button>
          ))}
          <a
            href={linkWhatsApp("¡Hola Astefil! Quiero consultar por un inflable 🎉")}
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
