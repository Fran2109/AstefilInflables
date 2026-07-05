import { useState } from "react";
import { useAdmin } from "@/admin/store/AdminContext";
import { Button } from "@/components/ui/button";

/** Pantalla de PIN. Disuasión casual, NO seguridad real (todo es client-side). */
export function Gate({ onUnlock }: { onUnlock: () => void }) {
  const { config, definirPin, mostrarToast } = useAdmin();
  const [pin, setPin] = useState("");
  const primeraVez = config.pin === null && config._nuevo;

  const enviar = async () => {
    const v = pin.trim();
    if (primeraVez) {
      await definirPin(v);
      onUnlock();
      return;
    }
    if (v === config.pin) {
      onUnlock();
    } else {
      mostrarToast("PIN incorrecto");
      setPin("");
    }
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
        <h1 className="mb-1 mt-3.5 text-[1.9rem]">{primeraVez ? "Creá tu PIN" : "Panel Astefil"}</h1>
        <p className="mb-5 text-[.95rem] text-[#5a4a41]">
          {primeraVez
            ? "Elegí un PIN de 4 a 6 dígitos (o dejalo vacío para entrar directo)."
            : "Ingresá tu PIN para entrar."}
        </p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••"
          autoComplete="off"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") enviar();
          }}
          autoFocus
          className="mb-4 w-full rounded-[14px] border-3 border-tinta bg-white p-3 text-center font-alt text-[1.6rem] font-extrabold tracking-[.5em] focus-visible:outline focus-visible:outline-4 focus-visible:outline-azul"
        />
        <Button variant="rojo" size="full" onClick={enviar}>
          {primeraVez ? "Crear y entrar" : "Entrar"}
        </Button>
        <p className="mt-3.5 text-[.78rem] leading-[1.4] text-gris">
          Protección básica del prototipo (no es seguridad real). Los datos viven únicamente en este
          dispositivo/navegador.
        </p>
      </div>
    </div>
  );
}
