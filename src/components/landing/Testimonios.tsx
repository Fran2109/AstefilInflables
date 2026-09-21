import { useEffect, useMemo, useState } from "react";
import type { TestimonioPublico } from "@/types/catalogo";
import { TituloSeccion } from "@/components/landing/TituloSeccion";
import { Button } from "@/components/ui/button";
import { Esqueleto } from "@/components/landing/Esqueleto";
import { cargarTestimonios, enviarTestimonio, LIMITES_COMENTARIO } from "@/lib/landingDb";
import { haySupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

// El color y la rotación salen de la posición en la lista, no de una columna
// en la base: así la pared siempre se ve variada sin que nadie elija nada al
// moderar. El orden lo manda la fecha, así que las tarjetas van rotando solas.
const GLOBITO = ["bg-azul", "bg-rojo", "bg-amarillo"];
const ROTACION = ["-rotate-[1.2deg]", "rotate-[.9deg]", "-rotate-[.6deg]"];

const inputCls =
  "w-full rounded-xl border-3 border-tinta bg-white px-3.5 py-3 font-body text-base text-tinta shadow-[inset_3px_3px_0_rgba(27,19,16,.08)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-azul";
const labelCls = "mb-1.5 block font-alt text-[.92rem] font-extrabold";

export function Testimonios() {
  const [lista, setLista] = useState<TestimonioPublico[]>([]);
  const [cargando, setCargando] = useState(haySupabase);

  useEffect(() => {
    let vivo = true;
    cargarTestimonios()
      .then((t) => vivo && setLista(t))
      .catch(() => {
        /* Se queda sin comentarios: la sección lo dice, no inventa ninguno. */
      })
      .finally(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <section id="comentarios" className="pb-2 pt-16">
      <div className="container">
        <TituloSeccion
          bandaClassName="bg-azul text-white rotate-[1deg]"
          sub="Lo que nos dicen después de cada fiesta. ¿Alquilaste con nosotros? Contanos cómo te fue."
        >
          Familias que ya saltaron
        </TituloSeccion>

        {cargando ? (
          <div className="mx-auto mt-11 grid max-w-[460px] grid-cols-1 gap-7 md:max-w-none md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Esqueleto key={i} className="h-[170px]" />
            ))}
          </div>
        ) : lista.length > 0 ? (
          <div className="mx-auto mt-11 grid max-w-[460px] grid-cols-1 gap-7 md:max-w-none md:grid-cols-3">
            {lista.map((t, i) => (
              <article
                key={t.id}
                className={cn(
                  "relative rounded-lg border-3 border-tinta bg-papel px-[22px] pb-5 pt-[26px] shadow-hard",
                  ROTACION[i % ROTACION.length]
                )}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-6 left-4 font-display text-[3rem] leading-none text-rojo [-webkit-text-stroke:2px_var(--tinta)]"
                >
                  "
                </span>
                <p className="whitespace-pre-wrap text-[.98rem] leading-[1.55] text-[#3c2f28]">
                  {t.texto}
                </p>
                <div className="mt-3.5 flex items-center gap-2 font-alt text-[.92rem] font-extrabold">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-block h-[15px] w-3 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-2 border-tinta",
                      GLOBITO[i % GLOBITO.length]
                    )}
                  />
                  {t.quien}
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Todavía no hay comentarios publicados. Se dice, no se disimula
             con reseñas de relleno. */
          <p className="mx-auto mt-9 max-w-[34rem] text-center text-[1.02rem] text-[#3c2f28]">
            Todavía no hay comentarios publicados. Si ya alquilaste con nosotros, sos el primero 👇
          </p>
        )}

        <FormularioComentario />
      </div>
    </section>
  );
}

/**
 * Alta pública de un comentario.
 *
 * El comentario entra como "pendiente" y no se publica hasta que Francisco lo
 * aprueba — eso lo fuerza la RLS, no este formulario. Después de enviarlo se
 * muestra acá mismo, una sola vez, con el aviso de que está esperando
 * aprobación: nunca se vuelve a leer de la base, porque un pendiente es
 * invisible para cualquiera que no sea admin.
 */
function FormularioComentario() {
  const [quien, setQuien] = useState("");
  const [texto, setTexto] = useState("");
  // Honeypot: un bot completa todos los campos; una persona no ve este.
  const [apodo, setApodo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<{ quien: string; texto: string } | null>(null);
  const [error, setError] = useState("");

  const problema = useMemo(() => {
    if (quien.trim().length < 2) return "Poné tu nombre";
    if (texto.trim().length < 3) return "Escribí tu comentario";
    if (texto.trim().length > LIMITES_COMENTARIO.texto) return "El comentario es muy largo";
    if (quien.trim().length > LIMITES_COMENTARIO.quien) return "El nombre es muy largo";
    return "";
  }, [quien, texto]);

  const enviar = async () => {
    if (problema) return setError(problema);
    // El bot que completó el honeypot se lleva el mismo "gracias" que una
    // persona, pero no se escribe nada. Decirle que lo detectamos solo le
    // enseña a evitarlo.
    if (apodo.trim()) return setEnviado({ quien: quien.trim(), texto: texto.trim() });

    setEnviando(true);
    setError("");
    try {
      await enviarTestimonio(quien, texto);
      setEnviado({ quien: quien.trim(), texto: texto.trim() });
      setQuien("");
      setTexto("");
    } catch {
      setError("No pudimos enviarlo. Probá de nuevo o escribinos por WhatsApp.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="mx-auto mt-10 max-w-[620px] rounded-[calc(var(--radio)+6px)] border-3 border-dashed border-tinta bg-papel p-6 text-center shadow-hard">
        <p className="font-alt text-[1.05rem] font-extrabold">¡Gracias por tu comentario! 🎈</p>
        <p className="mx-auto mt-1.5 max-w-[26rem] text-[.92rem] text-[#5a4a41]">
          Lo revisamos antes de publicarlo, así que todavía no se ve en la página. Así quedó:
        </p>
        <article className="relative mx-auto mt-5 max-w-[420px] rotate-[.9deg] rounded-lg border-3 border-tinta bg-white px-[22px] pb-5 pt-[26px] text-left shadow-hard-sm">
          <span className="absolute -top-3 right-3 rounded-full border-2 border-tinta bg-amarillo px-2.5 py-0.5 font-alt text-[.72rem] font-extrabold">
            Esperando aprobación
          </span>
          <p className="whitespace-pre-wrap text-[.96rem] leading-[1.55] text-[#3c2f28]">
            {enviado.texto}
          </p>
          <div className="mt-3 font-alt text-[.9rem] font-extrabold">{enviado.quien}</div>
        </article>
      </div>
    );
  }

  if (!haySupabase) return null;

  return (
    <div className="mx-auto mt-11 max-w-[620px] rounded-[calc(var(--radio)+6px)] border-3 border-tinta bg-papel p-6 shadow-hard md:p-7">
      <h3 className="text-[1.25rem] font-extrabold leading-tight">Dejanos tu comentario</h3>
      <p className="mt-1 text-[.9rem] text-[#5a4a41]">
        Lo leemos antes de publicarlo, así que puede tardar un ratito en aparecer.
      </p>

      <div className="mt-5 flex flex-col gap-4">
        <div>
          <label htmlFor="c-nombre" className={labelCls}>
            Tu nombre
          </label>
          <input
            id="c-nombre"
            type="text"
            placeholder="Ej: Caro, de Grand Bourg"
            maxLength={LIMITES_COMENTARIO.quien}
            className={inputCls}
            value={quien}
            onChange={(e) => setQuien(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="c-texto" className={labelCls}>
            ¿Cómo te fue?
          </label>
          <textarea
            id="c-texto"
            rows={4}
            placeholder="Contanos cómo estuvo la fiesta…"
            maxLength={LIMITES_COMENTARIO.texto}
            className={inputCls}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <p className="mt-1 text-right font-alt text-[.78rem] font-bold text-[#5a4a41]">
            {texto.length}/{LIMITES_COMENTARIO.texto}
          </p>
        </div>

        {/* Honeypot: invisible y fuera del recorrido de teclado y de lectores
            de pantalla. Si viene completo, lo llenó un bot. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="c-apodo">No completar</label>
          <input
            id="c-apodo"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={apodo}
            onChange={(e) => setApodo(e.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="font-alt text-[.88rem] font-bold text-rojo">
            {error}
          </p>
        )}

        <Button variant="rojo" size="full" onClick={enviar} disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar comentario"}
        </Button>
      </div>
    </div>
  );
}
