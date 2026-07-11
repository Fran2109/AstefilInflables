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
import type { Articulo, Categoria, Config, Requisito, Reserva, Rol, Zona } from "@/admin/types";
import { ESTADOS } from "@/admin/types";
import { store, K, modoStorage } from "@/admin/lib/store";
import { seedArticulos, reservasEjemplo, COLORES, CATEGORIAS, ZONAS } from "@/admin/lib/seed";
import { uid } from "@/admin/lib/formato";
import { haySupabase, supabase } from "@/lib/supabase";
import * as db from "@/admin/lib/db";

/** Slug para el id de una categoría/zona: "Juegos de salón" → "juegos-de-salon". */
function slugificar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Categorías iniciales (fallback local) a partir de la lista de nombres. */
const CATEGORIAS_INICIALES: Categoria[] = CATEGORIAS.map((nombre, i) => ({
  id: slugificar(nombre),
  nombre,
  orden: i + 1,
  activo: true,
  descripcionReq: "opcional",
  medidasReq: "opcional",
  medidasTurbinaReq: "opcional",
  fotosReq: "opcional",
}));

/** Zonas iniciales (fallback local) a partir de la lista de nombres. */
const ZONAS_INICIALES: Zona[] = ZONAS.map((nombre, i) => ({
  id: slugificar(nombre),
  nombre,
  orden: i + 1,
  activo: true,
}));

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

  articulos: Articulo[];
  reservas: Reserva[];
  config: Config;
  /** Categorías del catálogo (de la DB si hay Supabase; si no, las locales), por `orden`. */
  categorias: Categoria[];
  /** Zonas de cobertura (de la DB si hay Supabase; si no, las locales), por `orden`. */
  zonas: Zona[];
  modo: string;
  toast: Toast | null;
  mostrarToast: (msg: string) => void;

  guardarReserva: (r: Reserva) => void;
  eliminarReserva: (id: string) => void;
  avanzarEstado: (r: Reserva) => void;

  guardarArticulo: (data: Omit<Articulo, "id" | "color">, id?: string) => void;
  eliminarArticulo: (id: string) => void;

  /** ABM de categorías. */
  guardarCategoria: (
    datos: { nombre: string; descripcionReq: Requisito; medidasReq: Requisito; medidasTurbinaReq: Requisito; fotosReq: Requisito },
    id?: string
  ) => void;
  toggleCategoria: (id: string) => void;
  eliminarCategoria: (id: string) => void;
  moverCategoria: (id: string, dir: -1 | 1) => void;

  /** ABM de zonas. */
  guardarZona: (nombre: string, id?: string) => void;
  toggleZona: (id: string) => void;
  eliminarZona: (id: string) => void;
  moverZona: (id: string, dir: -1 | 1) => void;

  setNombre: (nombre: string) => void;
  setPin: (pin: string) => void;
  definirPin: (pin: string) => void;

  cargarEjemplos: () => void;
  borrarTodo: () => void;
  importarBackup: (reservas: Reserva[], articulos: Articulo[], nombre?: string) => void;
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
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [config, setConfig] = useState<Config>({ nombre: "", pin: null });
  // El fallback local (CATEGORIAS_INICIALES/ZONAS_INICIALES) es la semilla real
  // en modo offline (localStorage, sin Supabase) — igual que seedArticulos().
  // En modo online arranca vacío: si la tabla no existe o está vacía, mostrar
  // una lista local "fantasma" (que parece guardada pero no lo está) sería
  // mentir. El estado vacío real lo maneja cada vista (Vacio en Categorías/Zonas).
  const [categorias, setCategorias] = useState<Categoria[]>(online ? [] : CATEGORIAS_INICIALES);
  const [zonas, setZonas] = useState<Zona[]>(online ? [] : ZONAS_INICIALES);
  const [modo, setModo] = useState<string>(online ? "supabase" : "navegador");
  const [toast, setToast] = useState<Toast | null>(null);

  const mostrarToast = useCallback((msg: string) => setToast({ id: Date.now(), msg }), []);

  // Refs para leer inventario/categorías más recientes sin recrear callbacks.
  const articulosRef = useRef(articulos);
  articulosRef.current = articulos;
  const categoriasRef = useRef(categorias);
  categoriasRef.current = categorias;
  const zonasRef = useRef(zonas);
  zonasRef.current = zonas;

  // Trae los datos desde Supabase (requiere sesión activa).
  const cargarDesdeSupabase = useCallback(async () => {
    setCargando(true);
    try {
      const d = await db.cargarTodo();
      setArticulos(d.articulos);
      setReservas(d.reservas);
      setConfig(d.config);
      // Siempre refleja lo real (incluso vacío): no conservar el fallback local
      // si la tabla no existe o está vacía, para no mostrar datos "fantasma".
      setCategorias(d.categorias);
      setZonas(d.zonas);
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
        const [art, res, cfg] = await Promise.all([
          store.get<Articulo[]>(K.inf),
          store.get<Reserva[]>(K.res),
          store.get<Config>(K.cfg),
        ]);
        setArticulos(art ?? seedArticulos());
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
        setArticulos([]);
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
    store.set(K.inf, articulos).then(() => setModo(modoStorage()));
  }, [articulos, cargando, online]);

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
  const guardarArticulo = useCallback(
    async (data: Omit<Articulo, "id" | "color">, id?: string) => {
      const lista = articulosRef.current;
      const obj: Articulo = id
        ? { ...(lista.find((x) => x.id === id) as Articulo), ...data, id }
        : { id: uid(), color: COLORES[lista.length % COLORES.length], ...data };
      if (online) {
        try {
          await db.upsertArticulo(obj);
        } catch {
          return mostrarToast("Error al guardar el artículo");
        }
      }
      setArticulos((prev) =>
        id ? prev.map((x) => (x.id === id ? obj : x)) : [...prev, obj]
      );
    },
    [online, mostrarToast]
  );

  const eliminarArticulo = useCallback(
    async (id: string) => {
      if (online) {
        try {
          await db.borrarArticulo(id);
        } catch {
          return mostrarToast("Error al eliminar");
        }
      }
      setArticulos((prev) => prev.filter((x) => x.id !== id));
    },
    [online, mostrarToast]
  );

  // ---- Categorías (ABM) ----
  const guardarCategoria = useCallback(
    async (
      datos: { nombre: string; descripcionReq: Requisito; medidasReq: Requisito; medidasTurbinaReq: Requisito; fotosReq: Requisito },
      id?: string
    ) => {
      const n = datos.nombre.trim();
      if (!n) return mostrarToast("Poné un nombre");
      const lista = categoriasRef.current;
      if (lista.some((c) => c.nombre.toLowerCase() === n.toLowerCase() && c.id !== id))
        return mostrarToast("Ya existe una categoría con ese nombre");
      const req = {
        descripcionReq: datos.descripcionReq,
        medidasReq: datos.medidasReq,
        medidasTurbinaReq: datos.medidasTurbinaReq,
        fotosReq: datos.fotosReq,
      };

      if (id) {
        const anterior = lista.find((c) => c.id === id);
        if (online) {
          try {
            await db.actualizarCategoria(id, { nombre: n, ...req });
          } catch {
            return mostrarToast("Error al guardar la categoría");
          }
        }
        setCategorias((prev) => prev.map((c) => (c.id === id ? { ...c, nombre: n, ...req } : c)));
        // La FK ON UPDATE CASCADE reetiqueta los artículos en la DB; reflejarlo local.
        if (anterior && anterior.nombre !== n)
          setArticulos((prev) => prev.map((x) => (x.cat === anterior.nombre ? { ...x, cat: n } : x)));
        mostrarToast("Categoría guardada ✓");
      } else {
        const orden = lista.reduce((m, c) => Math.max(m, c.orden), 0) + 1;
        const base = slugificar(n) || "categoria";
        let nuevoId = base;
        let k = 2;
        while (lista.some((c) => c.id === nuevoId)) nuevoId = base + "-" + k++;
        const nueva: Categoria = { id: nuevoId, nombre: n, orden, activo: true, ...req };
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
      const usos = articulosRef.current.filter((a) => a.cat === c.nombre).length;
      if (usos > 0)
        return mostrarToast(
          `No se puede: ${usos} artículo(s) usan "${c.nombre}". Reasignalos primero.`
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

  // ---- Zonas (ABM) ----
  const guardarZona = useCallback(
    async (nombre: string, id?: string) => {
      const n = nombre.trim();
      if (!n) return mostrarToast("Poné un nombre");
      const lista = zonasRef.current;
      if (lista.some((z) => z.nombre.toLowerCase() === n.toLowerCase() && z.id !== id))
        return mostrarToast("Ya existe una zona con ese nombre");

      if (id) {
        if (online) {
          try {
            await db.actualizarZona(id, { nombre: n });
          } catch {
            return mostrarToast("Error al guardar la zona");
          }
        }
        setZonas((prev) => prev.map((z) => (z.id === id ? { ...z, nombre: n } : z)));
        mostrarToast("Zona guardada ✓");
      } else {
        const orden = lista.reduce((m, z) => Math.max(m, z.orden), 0) + 1;
        const base = slugificar(n) || "zona";
        let nuevoId = base;
        let k = 2;
        while (lista.some((z) => z.id === nuevoId)) nuevoId = base + "-" + k++;
        const nueva: Zona = { id: nuevoId, nombre: n, orden, activo: true };
        if (online) {
          try {
            await db.crearZona(nueva);
          } catch {
            return mostrarToast("Error al crear la zona");
          }
        }
        setZonas((prev) => [...prev, nueva]);
        mostrarToast("Zona creada ✓");
      }
    },
    [online, mostrarToast]
  );

  const toggleZona = useCallback(
    async (id: string) => {
      const z = zonasRef.current.find((x) => x.id === id);
      if (!z) return;
      const activo = !z.activo;
      if (online) {
        try {
          await db.actualizarZona(id, { activo });
        } catch {
          return mostrarToast("Error al actualizar");
        }
      }
      setZonas((prev) => prev.map((x) => (x.id === id ? { ...x, activo } : x)));
    },
    [online, mostrarToast]
  );

  const eliminarZona = useCallback(
    async (id: string) => {
      if (online) {
        try {
          await db.borrarZona(id);
        } catch {
          return mostrarToast("Error al eliminar");
        }
      }
      setZonas((prev) => prev.filter((x) => x.id !== id));
      mostrarToast("Zona eliminada");
    },
    [online, mostrarToast]
  );

  const moverZona = useCallback(
    async (id: string, dir: -1 | 1) => {
      const orden = [...zonasRef.current].sort((a, b) => a.orden - b.orden);
      const idx = orden.findIndex((z) => z.id === id);
      const j = idx + dir;
      if (idx < 0 || j < 0 || j >= orden.length) return;
      const a = orden[idx];
      const b = orden[j];
      if (online) {
        try {
          await db.actualizarZona(a.id, { orden: b.orden });
          await db.actualizarZona(b.id, { orden: a.orden });
        } catch {
          return mostrarToast("Error al reordenar");
        }
      }
      setZonas((prev) =>
        prev.map((z) =>
          z.id === a.id ? { ...z, orden: b.orden } : z.id === b.id ? { ...z, orden: a.orden } : z
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
    const nuevas = reservasEjemplo(articulosRef.current);
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
    const nuevoInv = seedArticulos();
    if (online) {
      try {
        await db.reemplazarTodo(nuevoInv, []);
        await db.guardarConfig("");
      } catch {
        return mostrarToast("Error al borrar");
      }
    }
    setReservas([]);
    setArticulos(nuevoInv);
    setConfig({ nombre: "", pin: online ? null : "" });
    mostrarToast("Todo borrado. Inventario reiniciado.");
  }, [online, mostrarToast]);

  const importarBackup = useCallback(
    async (res: Reserva[], art: Articulo[], nombre?: string) => {
      if (online) {
        try {
          await db.reemplazarTodo(art, res);
          if (nombre !== undefined) await db.guardarConfig(nombre);
        } catch {
          return mostrarToast("Error al importar");
        }
      }
      setReservas(res);
      setArticulos(art);
      if (nombre !== undefined) setConfig((prev) => ({ ...prev, nombre }));
      mostrarToast("Backup importado ✓ (" + res.length + " reservas)");
    },
    [online, mostrarToast]
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      cargando, online, sesion, emailUsuario, rol, esAdmin, cerrarSesion,
      articulos, reservas, config, categorias, zonas, modo, toast, mostrarToast,
      guardarReserva, eliminarReserva, avanzarEstado,
      guardarArticulo, eliminarArticulo,
      guardarCategoria, toggleCategoria, eliminarCategoria, moverCategoria,
      guardarZona, toggleZona, eliminarZona, moverZona,
      setNombre, setPin: guardarPin, definirPin: guardarPin,
      cargarEjemplos, borrarTodo, importarBackup,
    }),
    [
      cargando, online, sesion, emailUsuario, rol, esAdmin, cerrarSesion,
      articulos, reservas, config, categorias, zonas, modo, toast, mostrarToast,
      guardarReserva, eliminarReserva, avanzarEstado,
      guardarArticulo, eliminarArticulo,
      guardarCategoria, toggleCategoria, eliminarCategoria, moverCategoria,
      guardarZona, toggleZona, eliminarZona, moverZona,
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
