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
import type { Categoria, Config, Inflable, Reserva, Rol } from "@/admin/types";
import { ESTADOS } from "@/admin/types";
import { store, K, modoStorage } from "@/admin/lib/store";
import { seedInflables, reservasEjemplo, COLORES, CATEGORIAS } from "@/admin/lib/seed";

/** Slug para el id de una categoría: "Juegos de salón" → "juegos-de-salon". */
function slugCat(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Categorías iniciales (fallback local) a partir de la lista de nombres. */
const CATEGORIAS_INICIALES: Categoria[] = CATEGORIAS.map((nombre, i) => ({
  id: slugCat(nombre),
  nombre,
  orden: i + 1,
  activo: true,
}));
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
  /** Rol del usuario logueado (online). En modo local es "admin". */
  rol: Rol;
  esAdmin: boolean;
  cerrarSesion: () => void;

  inflables: Inflable[];
  reservas: Reserva[];
  config: Config;
  /** Categorías del catálogo (de la DB si hay Supabase; si no, las locales), por `orden`. */
  categorias: Categoria[];
  modo: string;
  toast: Toast | null;
  mostrarToast: (msg: string) => void;

  guardarReserva: (r: Reserva) => void;
  eliminarReserva: (id: string) => void;
  avanzarEstado: (r: Reserva) => void;

  guardarInflable: (data: Omit<Inflable, "id" | "color">, id?: string) => void;
  eliminarInflable: (id: string) => void;

  /** ABM de categorías. */
  guardarCategoria: (nombre: string, id?: string) => void;
  toggleCategoria: (id: string) => void;
  eliminarCategoria: (id: string) => void;
  moverCategoria: (id: string, dir: -1 | 1) => void;

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
  // Online arranca en "empleado" (mínimo privilegio) hasta confirmar el rol.
  const [rol, setRol] = useState<Rol>(online ? "empleado" : "admin");
  const esAdmin = rol === "admin";
  const [inflables, setInflables] = useState<Inflable[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [config, setConfig] = useState<Config>({ nombre: "", pin: null });
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_INICIALES);
  const [modo, setModo] = useState<string>(online ? "supabase" : "navegador");
  const [toast, setToast] = useState<Toast | null>(null);

  const mostrarToast = useCallback((msg: string) => setToast({ id: Date.now(), msg }), []);

  // Refs para leer inventario/categorías más recientes sin recrear callbacks.
  const inflablesRef = useRef(inflables);
  inflablesRef.current = inflables;
  const categoriasRef = useRef(categorias);
  categoriasRef.current = categorias;

  // Trae los datos desde Supabase (requiere sesión activa).
  const cargarDesdeSupabase = useCallback(async () => {
    setCargando(true);
    try {
      const d = await db.cargarTodo();
      setInflables(d.inflables);
      setReservas(d.reservas);
      setConfig(d.config);
      if (d.categorias.length) setCategorias(d.categorias);
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
        db.cargarRol().then(setRol);
        cargarDesdeSupabase();
      } else {
        setRol("empleado");
        setInflables([]);
        setReservas([]);
        setConfig({ nombre: "", pin: null });
        setToast(null); // evita que un toast previo reaparezca en el login
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

  // ---- Categorías (ABM) ----
  const guardarCategoria = useCallback(
    async (nombre: string, id?: string) => {
      const n = nombre.trim();
      if (!n) return mostrarToast("Poné un nombre");
      const lista = categoriasRef.current;
      if (lista.some((c) => c.nombre.toLowerCase() === n.toLowerCase() && c.id !== id))
        return mostrarToast("Ya existe una categoría con ese nombre");

      if (id) {
        const anterior = lista.find((c) => c.id === id);
        if (online) {
          try {
            await db.actualizarCategoria(id, { nombre: n });
          } catch {
            return mostrarToast("Error al guardar la categoría");
          }
        }
        setCategorias((prev) => prev.map((c) => (c.id === id ? { ...c, nombre: n } : c)));
        // La FK ON UPDATE CASCADE reetiqueta los inflables en la DB; reflejarlo local.
        if (anterior && anterior.nombre !== n)
          setInflables((prev) => prev.map((x) => (x.cat === anterior.nombre ? { ...x, cat: n } : x)));
        mostrarToast("Categoría guardada ✓");
      } else {
        const orden = lista.reduce((m, c) => Math.max(m, c.orden), 0) + 1;
        const base = slugCat(n) || "categoria";
        let nuevoId = base;
        let k = 2;
        while (lista.some((c) => c.id === nuevoId)) nuevoId = base + "-" + k++;
        const nueva: Categoria = { id: nuevoId, nombre: n, orden, activo: true };
        if (online) {
          try {
            await db.crearCategoria(nueva);
          } catch {
            return mostrarToast("Error al crear la categoría");
          }
        }
        setCategorias((prev) => [...prev, nueva]);
        mostrarToast("Categoría creada ✓");
      }
    },
    [online, mostrarToast]
  );

  const toggleCategoria = useCallback(
    async (id: string) => {
      const c = categoriasRef.current.find((x) => x.id === id);
      if (!c) return;
      const activo = !c.activo;
      if (online) {
        try {
          await db.actualizarCategoria(id, { activo });
        } catch {
          return mostrarToast("Error al actualizar");
        }
      }
      setCategorias((prev) => prev.map((x) => (x.id === id ? { ...x, activo } : x)));
    },
    [online, mostrarToast]
  );

  const eliminarCategoria = useCallback(
    async (id: string) => {
      const c = categoriasRef.current.find((x) => x.id === id);
      if (!c) return;
      const usos = inflablesRef.current.filter((inf) => inf.cat === c.nombre).length;
      if (usos > 0)
        return mostrarToast(
          `No se puede: ${usos} inflable(s) usan "${c.nombre}". Reasignalos primero.`
        );
      if (online) {
        try {
          await db.borrarCategoria(id);
        } catch {
          return mostrarToast("Error al eliminar");
        }
      }
      setCategorias((prev) => prev.filter((x) => x.id !== id));
      mostrarToast("Categoría eliminada");
    },
    [online, mostrarToast]
  );

  const moverCategoria = useCallback(
    async (id: string, dir: -1 | 1) => {
      const orden = [...categoriasRef.current].sort((a, b) => a.orden - b.orden);
      const idx = orden.findIndex((c) => c.id === id);
      const j = idx + dir;
      if (idx < 0 || j < 0 || j >= orden.length) return;
      const a = orden[idx];
      const b = orden[j];
      if (online) {
        try {
          await db.actualizarCategoria(a.id, { orden: b.orden });
          await db.actualizarCategoria(b.id, { orden: a.orden });
        } catch {
          return mostrarToast("Error al reordenar");
        }
      }
      setCategorias((prev) =>
        prev.map((c) =>
          c.id === a.id ? { ...c, orden: b.orden } : c.id === b.id ? { ...c, orden: a.orden } : c
        )
      );
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
      cargando, online, sesion, emailUsuario, rol, esAdmin, cerrarSesion,
      inflables, reservas, config, categorias, modo, toast, mostrarToast,
      guardarReserva, eliminarReserva, avanzarEstado,
      guardarInflable, eliminarInflable,
      guardarCategoria, toggleCategoria, eliminarCategoria, moverCategoria,
      setNombre, setPin: guardarPin, definirPin: guardarPin,
      cargarEjemplos, borrarTodo, importarBackup,
    }),
    [
      cargando, online, sesion, emailUsuario, rol, esAdmin, cerrarSesion,
      inflables, reservas, config, categorias, modo, toast, mostrarToast,
      guardarReserva, eliminarReserva, avanzarEstado,
      guardarInflable, eliminarInflable,
      guardarCategoria, toggleCategoria, eliminarCategoria, moverCategoria,
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
