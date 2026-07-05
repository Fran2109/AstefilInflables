import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Config, Inflable, Reserva } from "@/admin/types";
import { ESTADOS } from "@/admin/types";
import { store, K, modoStorage } from "@/admin/lib/store";
import { seedInflables, reservasEjemplo, COLORES } from "@/admin/lib/seed";
import { uid } from "@/admin/lib/formato";
import { haySupabase, supabase } from "@/lib/supabase";
import * as db from "@/admin/lib/db";

interface Toast {
  id: number;
  msg: string;
}

interface AdminContextValue {
  cargando: boolean;
  /** true = persistencia en Supabase; false = localStorage local. */
  online: boolean;
  /** Estado de sesión (solo relevante online): null = averiguando. */
  sesion: boolean | null;
  emailUsuario: string;
  cerrarSesion: () => void;

  inflables: Inflable[];
  reservas: Reserva[];
  config: Config;
  modo: string;
  toast: Toast | null;
  mostrarToast: (msg: string) => void;

  guardarReserva: (r: Reserva) => void;
  eliminarReserva: (id: string) => void;
  avanzarEstado: (r: Reserva) => void;

  guardarInflable: (data: Omit<Inflable, "id" | "color">, id?: string) => void;
  eliminarInflable: (id: string) => void;

  setNombre: (nombre: string) => void;
  setPin: (pin: string) => void;
  definirPin: (pin: string) => void;

  cargarEjemplos: () => void;
  borrarTodo: () => void;
  importarBackup: (reservas: Reserva[], inflables: Inflable[], nombre?: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const online = haySupabase;
  const [cargando, setCargando] = useState(true);
  const [sesion, setSesion] = useState<boolean | null>(online ? null : true);
  const [emailUsuario, setEmailUsuario] = useState("");
  const [inflables, setInflables] = useState<Inflable[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [config, setConfig] = useState<Config>({ nombre: "", pin: null });
  const [modo, setModo] = useState<string>(online ? "supabase" : "navegador");
  const [toast, setToast] = useState<Toast | null>(null);

  const mostrarToast = useCallback((msg: string) => setToast({ id: Date.now(), msg }), []);

  // Ref para leer el inventario más reciente sin recrear callbacks.
  const inflablesRef = useRef(inflables);
  inflablesRef.current = inflables;

  // Trae los datos desde Supabase (requiere sesión activa).
  const cargarDesdeSupabase = useCallback(async () => {
    setCargando(true);
    try {
      const d = await db.cargarTodo();
      setInflables(d.inflables);
      setReservas(d.reservas);
      setConfig(d.config);
    } catch {
      mostrarToast("No pudimos cargar los datos");
    } finally {
      setCargando(false);
    }
  }, [mostrarToast]);

  // ---- Carga inicial + sesión ----
  useEffect(() => {
    if (!online) {
      // Modo local: seed de inventario si no hay nada guardado.
      (async () => {
        const [inf, res, cfg] = await Promise.all([
          store.get<Inflable[]>(K.inf),
          store.get<Reserva[]>(K.res),
          store.get<Config>(K.cfg),
        ]);
        setInflables(inf ?? seedInflables());
        setReservas(res ?? []);
        setConfig(cfg ?? { nombre: "", pin: null, _nuevo: true });
        setModo(modoStorage());
        setCargando(false);
      })();
      return;
    }

    // Modo Supabase: la sesión gobierna la carga (onAuthStateChange emite el
    // estado inicial y cada login/logout).
    const { data: listener } = supabase!.auth.onAuthStateChange((_evento, ses) => {
      const activa = !!ses;
      setSesion(activa);
      setEmailUsuario(ses?.user?.email ?? "");
      if (activa) {
        cargarDesdeSupabase();
      } else {
        setInflables([]);
        setReservas([]);
        setConfig({ nombre: "", pin: null });
        setCargando(false);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [online, cargarDesdeSupabase]);

  // ---- Persistencia local (solo modo navegador; online persiste por acción) ----
  useEffect(() => {
    if (online || cargando) return;
    store.set(K.inf, inflables).then(() => setModo(modoStorage()));
  }, [inflables, cargando, online]);

  useEffect(() => {
    if (online || cargando) return;
    store.set(K.res, reservas).then(() => setModo(modoStorage()));
  }, [reservas, cargando, online]);

  useEffect(() => {
    if (online || cargando) return;
    store.set(K.cfg, config).then(() => setModo(modoStorage()));
  }, [config, cargando, online]);

  const cerrarSesion = useCallback(() => {
    supabase?.auth.signOut();
  }, []);

  // ---- Reservas ----
  const guardarReserva = useCallback(
    async (r: Reserva) => {
      if (online) {
        try {
          await db.upsertReserva(r);
        } catch {
          return mostrarToast("Error al guardar la reserva");
        }
      }
      setReservas((prev) =>
        prev.some((x) => x.id === r.id) ? prev.map((x) => (x.id === r.id ? r : x)) : [...prev, r]
      );
    },
    [online, mostrarToast]
  );

  const eliminarReserva = useCallback(
    async (id: string) => {
      if (online) {
        try {
          await db.borrarReserva(id);
        } catch {
          return mostrarToast("Error al eliminar");
        }
      }
      setReservas((prev) => prev.filter((x) => x.id !== id));
    },
    [online, mostrarToast]
  );

  const avanzarEstado = useCallback(
    async (r: Reserva) => {
      const idx = ESTADOS.indexOf(r.estado);
      if (idx < 0 || idx >= 4) return;
      const actualizada: Reserva = { ...r, estado: ESTADOS[idx + 1] };
      if (online) {
        try {
          await db.upsertReserva(actualizada);
        } catch {
          return mostrarToast("Error al actualizar");
        }
      }
      setReservas((prev) => prev.map((x) => (x.id === r.id ? actualizada : x)));
    },
    [online, mostrarToast]
  );

  // ---- Inventario ----
  const guardarInflable = useCallback(
    async (data: Omit<Inflable, "id" | "color">, id?: string) => {
      const lista = inflablesRef.current;
      const obj: Inflable = id
        ? { ...(lista.find((x) => x.id === id) as Inflable), ...data, id }
        : { id: uid(), color: COLORES[lista.length % COLORES.length], ...data };
      if (online) {
        try {
          await db.upsertInflable(obj);
        } catch {
          return mostrarToast("Error al guardar el inflable");
        }
      }
      setInflables((prev) =>
        id ? prev.map((x) => (x.id === id ? obj : x)) : [...prev, obj]
      );
    },
    [online, mostrarToast]
  );

  const eliminarInflable = useCallback(
    async (id: string) => {
      if (online) {
        try {
          await db.borrarInflable(id);
        } catch {
          return mostrarToast("Error al eliminar");
        }
      }
      setInflables((prev) => prev.filter((x) => x.id !== id));
    },
    [online, mostrarToast]
  );

  // ---- Config ----
  const setNombre = useCallback(
    async (nombre: string) => {
      if (online) {
        try {
          await db.guardarConfig(nombre);
        } catch {
          return mostrarToast("Error al guardar el nombre");
        }
      }
      setConfig((prev) => ({ ...prev, nombre }));
      mostrarToast("Nombre guardado ✓");
    },
    [online, mostrarToast]
  );

  // PIN: solo aplica en modo local (offline). Online la barrera es el login.
  const guardarPin = useCallback((pin: string) => {
    setConfig((prev) => {
      const { _nuevo: _omit, ...resto } = prev;
      void _omit;
      return { ...resto, pin };
    });
  }, []);

  // ---- Acciones de datos ----
  const cargarEjemplos = useCallback(async () => {
    const nuevas = reservasEjemplo(inflablesRef.current);
    if (online) {
      try {
        await db.insertarReservas(nuevas);
      } catch {
        return mostrarToast("Error al cargar ejemplos");
      }
    }
    setReservas((prev) => [...prev, ...nuevas]);
    mostrarToast("5 reservas de ejemplo cargadas (fijate el conflicto del día +2 😉)");
  }, [online, mostrarToast]);

  const borrarTodo = useCallback(async () => {
    const nuevoInv = seedInflables();
    if (online) {
      try {
        await db.reemplazarTodo(nuevoInv, []);
        await db.guardarConfig("");
      } catch {
        return mostrarToast("Error al borrar");
      }
    }
    setReservas([]);
    setInflables(nuevoInv);
    setConfig({ nombre: "", pin: online ? null : "" });
    mostrarToast("Todo borrado. Inventario reiniciado.");
  }, [online, mostrarToast]);

  const importarBackup = useCallback(
    async (res: Reserva[], inf: Inflable[], nombre?: string) => {
      if (online) {
        try {
          await db.reemplazarTodo(inf, res);
          if (nombre !== undefined) await db.guardarConfig(nombre);
        } catch {
          return mostrarToast("Error al importar");
        }
      }
      setReservas(res);
      setInflables(inf);
      if (nombre !== undefined) setConfig((prev) => ({ ...prev, nombre }));
      mostrarToast("Backup importado ✓ (" + res.length + " reservas)");
    },
    [online, mostrarToast]
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      cargando, online, sesion, emailUsuario, cerrarSesion,
      inflables, reservas, config, modo, toast, mostrarToast,
      guardarReserva, eliminarReserva, avanzarEstado,
      guardarInflable, eliminarInflable,
      setNombre, setPin: guardarPin, definirPin: guardarPin,
      cargarEjemplos, borrarTodo, importarBackup,
    }),
    [
      cargando, online, sesion, emailUsuario, cerrarSesion,
      inflables, reservas, config, modo, toast, mostrarToast,
      guardarReserva, eliminarReserva, avanzarEstado,
      guardarInflable, eliminarInflable,
      setNombre, guardarPin, cargarEjemplos, borrarTodo, importarBackup,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin debe usarse dentro de <AdminProvider>");
  return ctx;
}
