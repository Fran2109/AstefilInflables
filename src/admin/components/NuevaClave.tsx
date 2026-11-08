import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/admin/store/AdminContext";
import { Button } from "@/components/ui/button";

const MIN_CLAVE = 8;

const campoCls =
  "mb-3 w-full rounded-[14px] border-3 border-tinta bg-white p-3 font-body text-[1.05rem] focus-visible:outline focus-visible:outline-4 focus-visible:outline-azul";

/**
 * Pantalla a la que llega el link de "¿Olvidaste tu clave?". El link ya abre
 * una sesión, así que alcanza con `updateUser`: no se pide la clave vieja.
 */
export function NuevaClave() {
  const { terminarRecuperacion, mostrarToast } = useAdmin();
  const [clave, setClave] = useState("");
  const [repetida, setRepetida] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const guardar = async () => {
    if (!supabase) return;
    setError("");
    if (clave.length < MIN_CLAVE) return setError(`Usá al menos ${MIN_CLAVE} caracteres.`);
    if (clave !== repetida) return setError("Las dos claves no coinciden.");
    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password: clave });
    setCargando(false);
    if (error) return setError("No pudimos guardarla. Pedí un link nuevo y probá otra vez.");
    mostrarToast("Clave actualizada ✓");
    terminarRecuperacion();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cielo p-5">
      <div className="w-full max-w-[400px] rounded-[22px] border-3 border-tinta bg-papel px-8 py-9 text-center shadow-hard-xl">
        <h1 className="mb-1 text-[1.9rem]">Elegí tu clave nueva</h1>
        <p className="mb-5 text-[.95rem] text-[#5a4a41]">Con esta vas a entrar al panel de ahora en más.</p>

        <input
          type="password"
          autoComplete="new-password"
          aria-label="Clave nueva"
          placeholder="clave nueva"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          autoFocus
          className={campoCls}
        />
        <input
          type="password"
          autoComplete="new-password"
          aria-label="Repetí la clave"
          placeholder="repetí la clave"
          value={repetida}
          onChange={(e) => setRepetida(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && guardar()}
          className={campoCls}
        />

        {error && <p className="mb-3 font-alt text-[.9rem] font-bold text-rojo">{error}</p>}

        <Button variant="rojo" size="full" onClick={guardar} disabled={cargando}>
          {cargando ? "Guardando…" : "Guardar clave"}
        </Button>
      </div>
    </div>
  );
}
