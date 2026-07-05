import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

/**
 * Login real contra Supabase Auth (email + contraseña). El acceso al panel
 * queda protegido de verdad por RLS: sin sesión, la base no devuelve datos.
 * El usuario admin se crea desde el panel de Supabase (Authentication → Users).
 */
export function Login({ onEntrar }: { onEntrar: () => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    if (!supabase) return;
    setError("");
    if (!email.trim() || !pass) {
      setError("Completá email y contraseña.");
      return;
    }
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });
    setCargando(false);
    if (error) {
      setError("No pudimos entrar. Revisá el email y la contraseña.");
      setPass("");
      return;
    }
    onEntrar();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cielo p-5">
      <div className="w-full max-w-[400px] rounded-[22px] border-3 border-tinta bg-papel px-8 py-9 text-center shadow-hard-xl">
        <svg viewBox="0 0 84 84" width="90" aria-hidden="true" className="mx-auto block">
          <line x1="15.5" y1="30" x2="15.5" y2="14" stroke="#1B1310" strokeWidth="2.5" />
          <path d="M15.5 15 L29 19 L15.5 23 Z" fill="#E8352B" stroke="#1B1310" strokeWidth="2" />
          <line x1="68.5" y1="30" x2="68.5" y2="14" stroke="#1B1310" strokeWidth="2.5" />
          <path d="M68.5 15 L55 19 L68.5 23 Z" fill="#FFC61B" stroke="#1B1310" strokeWidth="2" />
          <path d="M23 50 A19 17 0 0 1 61 50" fill="none" stroke="#1B1310" strokeWidth="13" strokeLinecap="round" />
          <path d="M23 50 A19 17 0 0 1 61 50" fill="none" stroke="#FFC61B" strokeWidth="7" strokeLinecap="round" />
          <rect x="8" y="30" width="15" height="34" rx="7" fill="#1F6FD0" stroke="#1B1310" strokeWidth="4" />
          <rect x="61" y="30" width="15" height="34" rx="7" fill="#1F6FD0" stroke="#1B1310" strokeWidth="4" />
          <rect x="4" y="58" width="76" height="24" rx="9" fill="#E8352B" stroke="#1B1310" strokeWidth="4" />
          <path d="M34 82 v-8 a8 7 0 0 1 16 0 v8 z" fill="#1B1310" />
        </svg>
        <h1 className="mb-1 mt-3.5 text-[1.9rem]">Panel Astefil</h1>
        <p className="mb-5 text-[.95rem] text-[#5a4a41]">Ingresá con tu cuenta para administrar.</p>

        <input
          type="email"
          inputMode="email"
          autoComplete="username"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && entrar()}
          autoFocus
          className="mb-3 w-full rounded-[14px] border-3 border-tinta bg-white p-3 font-body text-[1.05rem] focus-visible:outline focus-visible:outline-4 focus-visible:outline-azul"
        />
        <input
          type="password"
          autoComplete="current-password"
          placeholder="contraseña"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && entrar()}
          className="mb-4 w-full rounded-[14px] border-3 border-tinta bg-white p-3 font-body text-[1.05rem] focus-visible:outline focus-visible:outline-4 focus-visible:outline-azul"
        />

        {error && <p className="mb-3 font-alt text-[.9rem] font-bold text-rojo">{error}</p>}

        <Button variant="rojo" size="full" onClick={entrar} disabled={cargando}>
          {cargando ? "Entrando…" : "Entrar"}
        </Button>
        <p className="mt-3.5 text-[.78rem] leading-[1.4] text-gris">
          Acceso protegido con Supabase. Tus datos viven en la nube y se sincronizan entre
          dispositivos.
        </p>
      </div>
    </div>
  );
}
