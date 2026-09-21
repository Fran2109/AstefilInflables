import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import type { TestimonioPublico } from "@/types/catalogo";
import { TituloSeccion } from "@/components/landing/TituloSeccion";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Esqueleto } from "@/components/landing/Esqueleto";
import {
  cargarTestimonios,
  enviarTestimonio,
  LIMITES_COMENTARIO,
  type ComentarioNuevo,
} from "@/lib/landingDb";
import { useCatalogo } from "@/context/CatalogoContext";
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

/** 'YYYY-MM-DD' → "agosto de 2026". El día exacto no aporta y envejece peor. */
function mesYAno(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  if (!y || !m) return "";
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${meses[m - 1]} de ${y}`;
}

/** Las estrellas de un comentario ya publicado (solo lectura). */
function Estrellas({ puntaje }: { puntaje: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${puntaje} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={cn("h-4 w-4", n <= puntaje ? "fill-amarillo text-tinta" : "fill-none text-gris")}
          strokeWidth={2.5}
        />
      ))}
    </div>
  );
}

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
                  "relative flex flex-col rounded-lg border-3 border-tinta bg-papel px-[22px] pb-5 pt-[26px] shadow-hard",
                  ROTACION[i % ROTACION.length]
                )}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-6 left-4 font-display text-[3rem] leading-none text-rojo [-webkit-text-stroke:2px_var(--tinta)]"
                >
                  "
                </span>

                {t.puntaje ? <Estrellas puntaje={t.puntaje} /> : null}

                <p
                  className={cn(
                    "whitespace-pre-wrap text-[.98rem] leading-[1.55] text-[#3c2f28]",
                    t.puntaje && "mt-2"
                  )}
                >
                  {t.texto}
                </p>

                {t.articulos && t.articulos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.articulos.map((a) => (
                      <span
                        key={a}
                        className="rounded-full border-2 border-tinta bg-cielo px-2.5 py-0.5 font-alt text-[.76rem] font-extrabold"
                      >
                        🎈 {a}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3.5 flex items-center gap-2 font-alt text-[.92rem] font-extrabold">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-block h-[15px] w-3 flex-none rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-2 border-tinta",
                      GLOBITO[i % GLOBITO.length]
                    )}
                  />
                  <span>
                    {t.quien}
                    {t.localidad && <span className="font-bold">, de {t.localidad}</span>}
                  </span>
                </div>

                {t.fechaEvento && (
                  <div className="mt-1 pl-5 font-alt text-[.78rem] font-bold text-[#5a4a41]">
                    Fiesta de {mesYAno(t.fechaEvento)}
                  </div>
                )}
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
 *
 * Solo el nombre y el texto son obligatorios. Los otros cuatro campos suman
 * contexto si la persona quiere darlo, y las listas de artículos y localidades
 * salen del inventario y las zonas reales — pero se guardan como texto, no
 * como referencia (ver `ComentarioNuevo`).
 */
function FormularioComentario() {
  const { modelos, zonas } = useCatalogo();
  const [quien, setQuien] = useState("");
  const [texto, setTexto] = useState("");
  const [puntaje, setPuntaje] = useState(0);
  const [articulos, setArticulos] = useState<string[]>([]);
  const [localidad, setLocalidad] = useState("");
  const [fechaEvento, setFechaEvento] = useState("");
  // Honeypot: un bot completa todos los campos; una persona no ve este.
  const [apodo, setApodo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<ComentarioNuevo | null>(null);
  const [error, setError] = useState("");

  const nombresModelos = useMemo(
    () => [...new Set(modelos.map((m) => m.nombre))].sort((a, b) => a.localeCompare(b, "es")),
    [modelos]
  );

  // Hoy en 'YYYY-MM-DD' local: una opinión habla de una fiesta que ya pasó.
  const hoy = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const problema = useMemo(() => {
    if (quien.trim().length < 2) return "Poné tu nombre";
    if (texto.trim().length < 3) return "Escribí tu comentario";
    if (texto.trim().length > LIMITES_COMENTARIO.texto) return "El comentario es muy largo";
    if (quien.trim().length > LIMITES_COMENTARIO.quien) return "El nombre es muy largo";
    return "";
  }, [quien, texto]);

  const enviar = async () => {
    if (problema) return setError(problema);
    const datos: ComentarioNuevo = {
      quien,
      texto,
      puntaje: puntaje || undefined,
      articulos: articulos.length ? articulos : undefined,
      localidad: localidad || undefined,
      fechaEvento: fechaEvento || undefined,
    };
    // El bot que completó el honeypot se lleva el mismo "gracias" que una
    // persona, pero no se escribe nada. Decirle que lo detectamos solo le
    // enseña a evitarlo.
    if (apodo.trim()) return setEnviado(datos);

    setEnviando(true);
    setError("");
    try {
      await enviarTestimonio(datos);
      setEnviado(datos);
      setQuien("");
      setTexto("");
      setPuntaje(0);
      setArticulos([]);
      setLocalidad("");
      setFechaEvento("");
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
          {enviado.puntaje ? <Estrellas puntaje={enviado.puntaje} /> : null}
          <p className={cn("whitespace-pre-wrap text-[.96rem] leading-[1.55] text-[#3c2f28]", enviado.puntaje && "mt-2")}>
            {enviado.texto}
          </p>
          {enviado.articulos && enviado.articulos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {enviado.articulos.map((a) => (
                <span
                  key={a}
                  className="rounded-full border-2 border-tinta bg-cielo px-2.5 py-0.5 font-alt text-[.76rem] font-extrabold"
                >
                  🎈 {a}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 font-alt text-[.9rem] font-extrabold">
            {enviado.quien}
            {enviado.localidad && `, de ${enviado.localidad}`}
          </div>
          {enviado.fechaEvento && (
            <div className="mt-0.5 font-alt text-[.78rem] font-bold text-[#5a4a41]">
              Fiesta de {mesYAno(enviado.fechaEvento)}
            </div>
          )}
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
            placeholder="Ej: Caro"
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

        {/* De acá para abajo es todo opcional. Va separado y dicho con todas
            las letras para que nadie sienta que tiene que completar un
            formulario largo para dejar dos líneas. */}
        <div className="border-t-3 border-dashed border-[#e5d9cd] pt-4">
          <p className="font-alt text-[.92rem] font-extrabold">
            ¿Nos contás un poco más? <span className="font-bold text-[#5a4a41]">(opcional)</span>
          </p>

          <div className="mt-3.5 flex flex-col gap-4">
            <EstrellasElegibles valor={puntaje} onChange={setPuntaje} />

            {/* Solo si hay inventario cargado: una lista vacía es un callejón.
                Va con chips y no con un desplegable porque una fiesta puede
                llevar varias cosas — mismo patrón que el `ReservaDialog` del
                panel para elegir artículos. */}
            {nombresModelos.length > 0 && (
              <fieldset>
                <legend className={labelCls}>¿Qué alquilaste?</legend>
                <div className="flex flex-wrap gap-2">
                  {nombresModelos.map((n) => {
                    const elegido = articulos.includes(n);
                    // El tope lo exige también la base (CHECK de cardinalidad).
                    const tope = articulos.length >= LIMITES_COMENTARIO.articulos;
                    return (
                      <label
                        key={n}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border-3 border-tinta px-3 py-1.5 font-alt text-[.85rem] font-bold",
                          elegido ? "bg-amarillo shadow-hard-sm" : "bg-white",
                          !elegido && tope ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-rojo"
                          checked={elegido}
                          disabled={!elegido && tope}
                          onChange={() =>
                            setArticulos((prev) =>
                              prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
                            )
                          }
                        />
                        {n}
                      </label>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[.8rem] text-[#5a4a41]">
                  Podés marcar más de uno.
                </p>
              </fieldset>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {zonas.length > 0 && (
                <div>
                  <label id="c-localidad-label" htmlFor="c-localidad" className={labelCls}>
                    ¿De qué zona sos?
                  </label>
                  <Select
                    id="c-localidad"
                    ariaLabelledBy="c-localidad-label"
                    value={localidad}
                    onChange={setLocalidad}
                    options={zonas}
                    placeholder="Elegí tu localidad"
                    triggerClassName={inputCls}
                  />
                </div>
              )}

              <div>
                <label id="c-fecha-label" htmlFor="c-fecha" className={labelCls}>
                  ¿Cuándo fue la fiesta?
                </label>
                <DatePicker
                  id="c-fecha"
                  ariaLabelledBy="c-fecha-label"
                  value={fechaEvento}
                  onChange={setFechaEvento}
                  max={hoy}
                  placeholder="dd/mm/aaaa"
                  triggerClassName={inputCls}
                />
              </div>
            </div>
          </div>
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

/**
 * Puntaje de 1 a 5 estrellas, opcional.
 *
 * Son radios nativos escondidos con `sr-only` en vez de botones: así el
 * teclado (flechas dentro del grupo) y los lectores de pantalla funcionan
 * solos, sin reimplementar nada. La estrella visible es el `<label>`.
 */
function EstrellasElegibles({ valor, onChange }: { valor: number; onChange: (n: number) => void }) {
  return (
    <fieldset>
      <legend className={labelCls}>¿Qué puntaje nos ponés?</legend>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="group cursor-pointer p-0.5"
            title={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
          >
            <input
              type="radio"
              name="puntaje"
              value={n}
              checked={valor === n}
              onChange={() => onChange(n)}
              className="peer sr-only"
            />
            <Star
              aria-hidden="true"
              strokeWidth={2.5}
              className={cn(
                "h-8 w-8 transition-transform peer-focus-visible:outline peer-focus-visible:outline-4 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-azul group-hover:scale-110",
                n <= valor ? "fill-amarillo text-tinta" : "fill-white text-gris"
              )}
            />
            <span className="sr-only">
              {n} {n === 1 ? "estrella" : "estrellas"}
            </span>
          </label>
        ))}

        {valor > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="ml-2 font-alt text-[.8rem] font-extrabold text-rojo hover:underline"
          >
            Quitar
          </button>
        )}
      </div>
    </fieldset>
  );
}
