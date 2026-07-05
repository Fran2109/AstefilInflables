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

interface Toast {
  id: number;
  msg: string;
}

interface AdminContextValue {
  cargando: boolean;
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
  const [cargando, setCargando] = useState(true);
  const [inflables, setInflables] = useState<Inflable[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [config, setConfig] = useState<Config>({ nombre: "", pin: null });
  const [modo, setModo] = useState<string>("navegador");
  const [toast, setToast] = useState<Toast | null>(null);

  const mostrarToast = useCallback((msg: string) => setToast({ id: Date.now(), msg }), []);

  // Ref para leer el inventario más reciente sin recrear callbacks.
  const inflablesRef = useRef(inflables);
  inflablesRef.current = inflables;

  // Carga inicial (seed de inventario si no hay nada guardado).
  useEffect(() => {
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
  }, []);

  // Persistencia reactiva: cada colección se guarda cuando cambia (una vez cargada).
  // Es la costura para migrar a Supabase (cambiar la implementación de `store`).
  useEffect(() => {
    if (cargando) return;
    store.set(K.inf, inflables).then(() => setModo(modoStorage()));
  }, [inflables, cargando]);

  useEffect(() => {
    if (cargando) return;
    store.set(K.res, reservas).then(() => setModo(modoStorage()));
  }, [reservas, cargando]);

  useEffect(() => {
    if (cargando) return;
    store.set(K.cfg, config).then(() => setModo(modoStorage()));
  }, [config, cargando]);

  // ---- Reservas ----
  const guardarReserva = useCallback((r: Reserva) => {
    setReservas((prev) =>
      prev.some((x) => x.id === r.id) ? prev.map((x) => (x.id === r.id ? r : x)) : [...prev, r]
    );
  }, []);

  const eliminarReserva = useCallback((id: string) => {
    setReservas((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const avanzarEstado = useCallback((r: Reserva) => {
    const idx = ESTADOS.indexOf(r.estado);
    if (idx < 0 || idx >= 4) return;
    const sig = ESTADOS[idx + 1];
    setReservas((prev) => prev.map((x) => (x.id === r.id ? { ...x, estado: sig } : x)));
  }, []);

  // ---- Inventario ----
  const guardarInflable = useCallback((data: Omit<Inflable, "id" | "color">, id?: string) => {
    setInflables((prev) =>
      id
        ? prev.map((x) => (x.id === id ? { ...x, ...data } : x))
        : [...prev, { id: uid(), color: COLORES[prev.length % COLORES.length], ...data }]
    );
  }, []);

  const eliminarInflable = useCallback((id: string) => {
    setInflables((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // ---- Config ----
  const setNombre = useCallback(
    (nombre: string) => {
      setConfig((prev) => ({ ...prev, nombre }));
      mostrarToast("Nombre guardado ✓");
    },
    [mostrarToast]
  );

  // Al fijar/definir el PIN se descarta la marca interna _nuevo.
  const guardarPin = useCallback((pin: string) => {
    setConfig((prev) => {
      const { _nuevo: _omit, ...resto } = prev;
      void _omit;
      return { ...resto, pin };
    });
  }, []);

  // ---- Acciones de datos ----
  const cargarEjemplos = useCallback(() => {
    setReservas((prev) => [...prev, ...reservasEjemplo(inflablesRef.current)]);
    mostrarToast("5 reservas de ejemplo cargadas (fijate el conflicto del día +2 😉)");
  }, [mostrarToast]);

  const borrarTodo = useCallback(() => {
    setReservas([]);
    setInflables(seedInflables());
    setConfig({ nombre: "", pin: "" });
    mostrarToast("Todo borrado. Inventario reiniciado.");
  }, [mostrarToast]);

  const importarBackup = useCallback(
    (res: Reserva[], inf: Inflable[], nombre?: string) => {
      setReservas(res);
      setInflables(inf);
      if (nombre !== undefined) setConfig((prev) => ({ ...prev, nombre }));
      mostrarToast("Backup importado ✓ (" + res.length + " reservas)");
    },
    [mostrarToast]
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      cargando, inflables, reservas, config, modo, toast, mostrarToast,
      guardarReserva, eliminarReserva, avanzarEstado,
      guardarInflable, eliminarInflable,
      setNombre, setPin: guardarPin, definirPin: guardarPin,
      cargarEjemplos, borrarTodo, importarBackup,
    }),
    [
      cargando, inflables, reservas, config, modo, toast, mostrarToast,
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
