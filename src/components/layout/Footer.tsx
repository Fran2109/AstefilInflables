import { Logo } from "@/components/layout/Logo";
import { SITIO } from "@/data/site";
import { linkWhatsApp } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="mt-[70px] bg-tinta pb-[30px] pt-11 text-papel">
      <div className="container">
        <div className="grid grid-cols-1 gap-[34px] md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo footer className="h-[62px]" />
            <p className="mt-2.5 text-[.95rem] leading-relaxed opacity-90">
              Alquiler de inflables y juegos para cumpleaños y eventos. Hacemos que la fiesta salte
              más alto. 🎈
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-[1.1rem] font-extrabold text-amarillo">Contacto</h4>
            <ul className="flex flex-col gap-2 text-[.96rem]">
              {SITIO.telefonos.map((t) => (
                <li key={t.wa}>
                  📱{" "}
                  <a
                    href={linkWhatsApp(undefined, t.wa)}
                    target="_blank"
                    rel="noopener"
                    className="hover:text-amarillo hover:underline"
                  >
                    {t.label}
                  </a>
                </li>
              ))}
              <li>
                ✉️{" "}
                <a href={`mailto:${SITIO.email}`} className="hover:text-amarillo hover:underline">
                  {SITIO.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-[1.1rem] font-extrabold text-amarillo">Seguinos</h4>
            <ul className="flex flex-col gap-2 text-[.96rem]">
              <li>
                📷{" "}
                <a
                  href={SITIO.instagram.url}
                  target="_blank"
                  rel="noopener"
                  className="hover:text-amarillo hover:underline"
                >
                  {SITIO.instagram.handle}
                </a>
              </li>
              <li>
                👍{" "}
                <a
                  href={SITIO.facebook.url}
                  target="_blank"
                  rel="noopener"
                  className="hover:text-amarillo hover:underline"
                >
                  {SITIO.facebook.handle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t-2 border-papel/20 pt-[18px] text-center text-[.85rem] opacity-75">
          © {new Date().getFullYear()} Astefil Inflables · Buenos Aires, Argentina · Hecho con 🎈 y
          muchos saltos
        </div>
      </div>
    </footer>
  );
}
