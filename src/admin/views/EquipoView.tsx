import { useEffect, useState } from "react";
import type { Perfil, Rol } from "@/admin/types";
import * as db from "@/admin/lib/db";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/admin/store/AdminContext";
import { useConfirmar } from "@/admin/components/Confirm";
import { CabeceraVista, Panel, Vacio } from "@/admin/views/comunes";

export function EquipoView() {
  const { emailUsuario, mostrarToast } = useAdmin();
  const confirmar = useConfirmar();
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    db.cargarPerfiles()
      .then(setPerfiles)
      .catch(() => mostrarToast("No pudimos cargar el equipo"))
      .finally(() => setCargando(false));
  }, [mostrarToast]);

  const cambiar = async (p: Perfil, rol: Rol) => {
    const aAdmin = rol === "admin";
    const ok = await confirmar({
      titulo: "Cambiar rol",
      mensaje: (
        <>
          ¿Cambiar a <strong>{p.email}</strong> a <strong>{aAdmin ? "Admin" : "Empleado"}</strong>?{" "}
          {aAdmin
            ? "Va a tener acceso total al panel (catálogo, equipo y ajustes)."
            : "Solo va a poder gestionar reservas."}
        </>
      ),
      textoConfirmar: "Cambiar rol",
      peligro: aAdmin,
    });
    if (!ok) return;
    try {
      await db.cambiarRol(p.id, rol);
      setPerfiles((prev) => prev.map((x) => (x.id === p.id ? { ...x, rol } : x)));
      mostrarToast("Rol actualizado ✓");
    } catch {
      mostrarToast("Error al cambiar el rol");
    }
  };

  return (
    <div>
      <CabeceraVista titulo="Equipo" sub="Quién puede entrar al panel y con qué permisos." />

      <Panel>
        {cargando ? (
          <Vacio>Cargando…</Vacio>
        ) : perfiles.length === 0 ? (
          <Vacio>No hay usuarios todavía.</Vacio>
        ) : (
          <div className="flex flex-col divide-y-2 divide-dashed divide-[#e5d9cd]">
            {perfiles.map((p) => {
              const esVos = p.email === emailUsuario;
              return (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <div className="font-extrabold">
                      {p.email}
                      {esVos && (
                        <span className="ml-2 rounded-md bg-tinta px-1.5 py-0.5 font-alt text-[.68rem] font-extrabold text-amarillo">
                          VOS
                        </span>
                      )}
                    </div>
                    <div className="font-alt text-[.78rem] font-bold text-[#5a4a41]">
                      {p.rol === "admin" ? "Acceso total" : "Solo reservas"}
                    </div>
                  </div>
                  <div
                    role="group"
                    aria-label={"Rol de " + p.email}
                    title={esVos ? "No podés cambiar tu propio rol" : undefined}
                    className={cn(
                      "inline-flex overflow-hidden rounded-xl border-3 border-tinta shadow-hard-sm",
                      esVos && "opacity-60"
                    )}
                  >
                    {(["admin", "empleado"] as Rol[]).map((r, i) => (
                      <button
                        key={r}
                        type="button"
                        disabled={esVos || p.rol === r}
                        onClick={() => cambiar(p, r)}
                        className={cn(
                          "px-4 py-2 font-alt text-[.85rem] font-extrabold transition-colors",
                          i === 1 && "border-l-3 border-tinta",
                          p.rol === r ? "bg-amarillo" : "bg-white",
                          !esVos && p.rol !== r && "cursor-pointer hover:bg-papel",
                          esVos && "cursor-not-allowed"
                        )}
                      >
                        {r === "admin" ? "Admin" : "Empleado"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <p className="text-[.82rem] text-[#5a4a41]">
        Para <strong>crear o eliminar</strong> usuarios: Supabase → Authentication → Users. Los
        nuevos entran como <strong>Empleado</strong> hasta que los subas a Admin acá. Un empleado
        gestiona reservas; no ve el catálogo, el equipo ni los ajustes.
      </p>
    </div>
  );
}
