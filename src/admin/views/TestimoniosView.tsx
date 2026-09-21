import { useState } from "react";
import { Check, Clock, Star, Trash2, X } from "lucide-react";
import type { EstadoTestimonio, Testimonio } from "@/admin/types";
import { useAdmin } from "@/admin/store/AdminContext";
import { useConfirmar } from "@/admin/components/Confirm";
import { CabeceraVista, Vacio } from "@/admin/views/comunes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Filtro = EstadoTestimonio | "todos";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "pendiente", label: "Pendientes" },
  { id: "aprobado", label: "Publicados" },
  { id: "rechazado", label: "Rechazados" },
  { id: "todos", label: "Todos" },
];

const ESTILO_ESTADO: Record<EstadoTestimonio, { txt: string; cls: string }> = {
  pendiente: { txt: "Pendiente", cls: "bg-amarillo" },
  aprobado: { txt: "Publicado", cls: "bg-verde text-white" },
  rechazado: { txt: "Rechazado", cls: "bg-tinta text-white" },
};

/** "hace 3 días" / "hoy" a partir del ISO de creación. */
function haceCuanto(iso: string): string {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 30) return `hace ${dias} días`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? "hace un mes" : `hace ${meses} meses`;
}

/**
 * Moderación de los comentarios que dejan los visitantes desde la landing.
 *
 * No hay alta acá a propósito: los comentarios los escribe la gente, el panel
 * solo los resuelve. Arranca filtrado en "Pendientes" porque eso es la cola de
 * trabajo — lo demás es archivo.
 */
export function TestimoniosView() {
  const { testimonios, moderarTestimonio, eliminarTestimonio, online, guardando } = useAdmin();
  const confirmar = useConfirmar();
  const [filtro, setFiltro] = useState<Filtro>("pendiente");

  const cuenta = (e: EstadoTestimonio) => testimonios.filter((t) => t.estado === e).length;
  const lista = filtro === "todos" ? testimonios : testimonios.filter((t) => t.estado === filtro);

  const moderar = async (t: Testimonio, estado: EstadoTestimonio) => {
    const copy: Record<EstadoTestimonio, { titulo: string; mensaje: string; boton: string }> = {
      aprobado: {
        titulo: "Publicar comentario",
        mensaje: `El comentario de ${t.quien} pasa a verse en la web, arriba de todo por ser el más reciente.`,
        boton: "Publicar",
      },
      rechazado: {
        titulo: "Rechazar comentario",
        mensaje: `El comentario de ${t.quien} no se va a ver en la web. Queda guardado y lo podés volver atrás cuando quieras.`,
        boton: "Rechazar",
      },
      pendiente: {
        titulo: "Volver a pendiente",
        mensaje: `El comentario de ${t.quien} deja de verse en la web y vuelve a la cola.`,
        boton: "Volver a pendiente",
      },
    };
    const c = copy[estado];
    const ok = await confirmar({
      titulo: c.titulo,
      mensaje: c.mensaje,
      textoConfirmar: c.boton,
      peligro: estado !== "aprobado",
    });
    if (ok) moderarTestimonio(t.id, estado);
  };

  return (
    <div>
      <CabeceraVista
        titulo="Comentarios"
        sub="Lo que deja la gente desde la web. Solo se publica lo que aprobás acá."
      />

      {!online ? (
        <Vacio>
          Los comentarios viven en la base. Sin conexión a Supabase no hay nada que moderar.
        </Vacio>
      ) : (
        <>
          <div className="mb-[22px] flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
            {FILTROS.map((f) => {
              const n = f.id === "todos" ? testimonios.length : cuenta(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filtro === f.id}
                  onClick={() => setFiltro(f.id)}
                  className={cn(
                    "rounded-full border-3 border-tinta px-3.5 py-1.5 font-alt text-[.85rem] font-extrabold",
                    filtro === f.id ? "bg-amarillo shadow-hard-sm" : "bg-white hover:bg-papel"
                  )}
                >
                  {f.label} ({n})
                </button>
              );
            })}
          </div>

          {lista.length === 0 ? (
            <Vacio>
              {filtro === "pendiente"
                ? "No hay comentarios esperando. Todo al día ✨"
                : "Nada acá todavía."}
            </Vacio>
          ) : (
            <div className="flex flex-col gap-3">
              {lista.map((t) => {
                const est = ESTILO_ESTADO[t.estado];
                return (
                  <div
                    key={t.id}
                    className="rounded-2xl border-3 border-tinta bg-white p-4 shadow-hard-sm"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-[1.05rem] font-extrabold">{t.quien}</span>
                      <span
                        className={cn(
                          "rounded-full border-2 border-tinta px-2.5 py-0.5 font-alt text-[.72rem] font-extrabold",
                          est.cls
                        )}
                      >
                        {est.txt}
                      </span>
                      <span className="font-alt text-[.78rem] font-bold text-[#5a4a41]">
                        {haceCuanto(t.creado)}
                      </span>
                    </div>

                    {t.puntaje ? (
                      <div
                        className="mb-1.5 flex gap-0.5"
                        aria-label={`${t.puntaje} de 5 estrellas`}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            aria-hidden="true"
                            strokeWidth={2.5}
                            className={cn(
                              "h-4 w-4",
                              n <= t.puntaje! ? "fill-amarillo text-tinta" : "fill-none text-gris"
                            )}
                          />
                        ))}
                      </div>
                    ) : null}

                    <p className="whitespace-pre-wrap text-[.95rem] leading-[1.5] text-[#3c2f28]">
                      {t.texto}
                    </p>

                    {/* Los datos opcionales que haya completado. Se muestran solo
                        si están: un comentario sin ninguno es igual de válido. */}
                    {(t.articulo || t.localidad || t.fechaEvento) && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {t.articulo && (
                          <span className="rounded-full border-2 border-tinta bg-cielo px-2.5 py-0.5 font-alt text-[.74rem] font-extrabold">
                            🎈 {t.articulo}
                          </span>
                        )}
                        {t.localidad && (
                          <span className="rounded-full border-2 border-tinta bg-white px-2.5 py-0.5 font-alt text-[.74rem] font-extrabold">
                            📍 {t.localidad}
                          </span>
                        )}
                        {t.fechaEvento && (
                          <span className="rounded-full border-2 border-tinta bg-white px-2.5 py-0.5 font-alt text-[.74rem] font-extrabold">
                            📅 {t.fechaEvento.split("-").reverse().join("/")}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-3.5 flex flex-wrap gap-2">
                      {t.estado !== "aprobado" && (
                        <Button
                          variant="verde"
                          size="mini"
                          disabled={guardando}
                          onClick={() => moderar(t, "aprobado")}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" strokeWidth={3} /> Publicar
                        </Button>
                      )}
                      {t.estado !== "rechazado" && (
                        <Button
                          variant="blanco"
                          size="mini"
                          disabled={guardando}
                          onClick={() => moderar(t, "rechazado")}
                        >
                          <X className="mr-1 h-3.5 w-3.5" strokeWidth={3} /> Rechazar
                        </Button>
                      )}
                      {t.estado !== "pendiente" && (
                        <Button
                          variant="blanco"
                          size="mini"
                          disabled={guardando}
                          onClick={() => moderar(t, "pendiente")}
                        >
                          <Clock className="mr-1 h-3.5 w-3.5" strokeWidth={3} /> A pendiente
                        </Button>
                      )}
                      <Button
                        variant="peligro"
                        size="mini"
                        disabled={guardando}
                        onClick={async () => {
                          const ok = await confirmar({
                            titulo: "Eliminar comentario",
                            mensaje: (
                              <>
                                ¿Borrar para siempre el comentario de <strong>{t.quien}</strong>? Si
                                solo querés que no se vea, rechazalo: queda guardado.
                              </>
                            ),
                            textoConfirmar: "Eliminar",
                            peligro: true,
                          });
                          if (ok) eliminarTestimonio(t.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={3} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
