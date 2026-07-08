import { useEffect, useState } from "react";
import type { Perfil, Rol } from "@/admin/types";
import * as db from "@/admin/lib/db";
import { useAdmin } from "@/admin/store/AdminContext";
import { CabeceraVista, Panel, Vacio } from "@/admin/views/comunes";
import { campoInputCls } from "@/admin/components/Campo";

export function EquipoView() {
  const { emailUsuario, mostrarToast } = useAdmin();
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    db.cargarPerfiles()
      .then(setPerfiles)
      .catch(() => mostrarToast("No pudimos cargar el equipo"))
      .finally(() => setCargando(false));
  }, [mostrarToast]);

  const cambiar = async (p: Perfil, rol: Rol) => {
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
                  <select
                    className={campoInputCls + " w-auto"}
                    value={p.rol}
                    disabled={esVos}
                    title={esVos ? "No podés cambiar tu propio rol" : undefined}
                    onChange={(e) => cambiar(p, e.target.value as Rol)}
                  >
                    <option value="admin">Admin</option>
                    <option value="empleado">Empleado</option>
                  </select>
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
