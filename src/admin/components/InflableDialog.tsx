import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Inflable } from "@/admin/types";
import { subirFoto, borrarFoto, urlFoto } from "@/admin/lib/db";
import { useAdmin } from "@/admin/store/AdminContext";
import { useConfirmar } from "@/admin/components/Confirm";
import { Modal } from "@/admin/components/Modal";
import { Campo, campoInputCls } from "@/admin/components/Campo";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  inflable: Inflable | null;
}

export function InflableDialog({ open, onClose, inflable }: Props) {
  const { reservas, categorias, guardarInflable, eliminarInflable, mostrarToast } = useAdmin();
  const confirmar = useConfirmar();
  // Nombres de categorías activas, ordenadas (para el desplegable).
  const nombresCat = [...categorias]
    .filter((c) => c.activo)
    .sort((a, b) => a.orden - b.orden)
    .map((c) => c.nombre);
  const [nombre, setNombre] = useState("");
  const [cat, setCat] = useState(nombresCat[0] ?? "");
  const [precio, setPrecio] = useState("");
  const [activo, setActivo] = useState(true);
  const [descripcion, setDescripcion] = useState("");
  const [ancho, setAncho] = useState("");
  const [largo, setLargo] = useState("");
  const [alto, setAlto] = useState("");
  const [anchoT, setAnchoT] = useState("");
  const [largoT, setLargoT] = useState("");
  const [altoT, setAltoT] = useState("");
  // Mientras no se toquen las medidas con turbina, se copian de las sin turbina.
  const [turbinaManual, setTurbinaManual] = useState(false);
  const [fotos, setFotos] = useState<string[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setNombre(inflable?.nombre || "");
    setCat(inflable?.cat || nombresCat[0] || "");
    setPrecio(inflable?.precio ? String(inflable.precio) : "");
    setActivo(inflable ? inflable.activo : true);
    setDescripcion(inflable?.descripcion || "");
    setAncho(inflable?.ancho ? String(inflable.ancho) : "");
    setLargo(inflable?.largo ? String(inflable.largo) : "");
    setAlto(inflable?.alto ? String(inflable.alto) : "");
    setAnchoT(inflable?.anchoTurbina ? String(inflable.anchoTurbina) : "");
    setLargoT(inflable?.largoTurbina ? String(inflable.largoTurbina) : "");
    setAltoT(inflable?.altoTurbina ? String(inflable.altoTurbina) : "");
    // Si ya trae medidas con turbina, se respetan (modo manual); si no, se copiarán.
    setTurbinaManual(!!(inflable?.anchoTurbina || inflable?.largoTurbina || inflable?.altoTurbina));
    setFotos(inflable?.fotos ?? []);
  }, [open, inflable]);

  // Cambia una medida sin turbina y, si el usuario no tocó las de turbina, la copia.
  const cambiarSin = (setter: (v: string) => void, setterT: (v: string) => void, v: string) => {
    setter(v);
    if (!turbinaManual) setterT(v);
  };
  // Cambia una medida con turbina (pasa a modo manual: deja de copiarse).
  const cambiarTurbina = (setterT: (v: string) => void, v: string) => {
    setterT(v);
    setTurbinaManual(true);
  };

  // Sube las imágenes elegidas (comprimidas) y agrega sus paths a la lista.
  const agregarFotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setSubiendo(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const path = await subirFoto(file);
        setFotos((prev) => [...prev, path]);
      }
    } catch {
      mostrarToast("No se pudo subir la foto");
    } finally {
      setSubiendo(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Quita una foto de la lista (se borra del storage recién al guardar).
  const quitarFoto = (path: string) => setFotos((prev) => prev.filter((p) => p !== path));

  // Convierte texto a número o undefined (campo dimensional vacío = sin dato).
  const numOpt = (v: string) => {
    const n = Number(v.replace(",", "."));
    return v.trim() && n > 0 ? n : undefined;
  };

  // Medidas parseadas y si hay alguna medida con turbina cargada.
  const dims = ["ancho", "largo", "alto"] as const;
  const s = { ancho: numOpt(ancho), largo: numOpt(largo), alto: numOpt(alto) };
  const t = { ancho: numOpt(anchoT), largo: numOpt(largoT), alto: numOpt(altoT) };
  const turbinaCargada = dims.some((d) => t[d] != null);

  // Motivo por el que NO se puede guardar todavía (null = todo OK). Se usa para
  // deshabilitar el botón y como chequeo defensivo al guardar.
  const problema: string | null = (() => {
    if (!nombre.trim()) return "Falta el nombre";
    if (turbinaCargada) {
      for (const d of dims) {
        if (t[d] == null) continue;
        if (s[d] == null) return `Cargá el ${d} sin turbina antes que el de con turbina`;
        if (t[d]! < s[d]!) return `El ${d} con turbina no puede ser menor que sin turbina`;
      }
      const algunaMayor = dims.some((d) => t[d] != null && s[d] != null && t[d]! > s[d]!);
      if (!algunaMayor) return "Con turbina tiene que ser mayor que sin turbina en al menos una medida";
    }
    return null;
  })();

  const guardar = async () => {
    if (problema) return mostrarToast(problema);
    if (subiendo) return mostrarToast("Esperá a que terminen de subir las fotos");

    await guardarInflable(
      {
        nombre: nombre.trim(),
        cat,
        precio: Number(precio) || 0,
        activo,
        descripcion: descripcion.trim(),
        ancho: s.ancho,
        largo: s.largo,
        alto: s.alto,
        anchoTurbina: turbinaCargada ? t.ancho : undefined,
        largoTurbina: turbinaCargada ? t.largo : undefined,
        altoTurbina: turbinaCargada ? t.alto : undefined,
        fotos,
      },
      inflable?.id
    );
    // Borra del storage las fotos guardadas que se quitaron (evita archivos huérfanos).
    const eliminadas = (inflable?.fotos ?? []).filter((p) => !fotos.includes(p));
    eliminadas.forEach((p) => borrarFoto(p).catch(() => {}));
    onClose();
    mostrarToast("Inventario guardado ✓");
  };

  const eliminar = async () => {
    if (!inflable) return;
    const usos = reservas.filter((r) => (r.inflableIds || []).includes(inflable.id)).length;
    const ok = await confirmar({
      titulo: "Eliminar inflable",
      mensaje: (
        <>
          ¿Eliminar <strong>{inflable.nombre}</strong>?
          {usos ? ` Está en ${usos} reserva(s); quedarán sin ese ítem.` : ""}
        </>
      ),
      textoConfirmar: "Eliminar",
      peligro: true,
    });
    if (!ok) return;
    await eliminarInflable(inflable.id);
    onClose();
    mostrarToast("Eliminado");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      titulo={inflable ? "Editar inflable" : "Agregar al inventario"}
      footer={
        <>
          {inflable && (
            <Button variant="peligro" size="mini" onClick={eliminar}>
              🗑 Eliminar
            </Button>
          )}
          <div className="ml-auto flex gap-2.5">
            <Button variant="blanco" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="verde"
              onClick={guardar}
              disabled={!!problema || subiendo}
              title={problema ?? (subiendo ? "Esperá a que terminen de subir las fotos" : undefined)}
            >
              Guardar
            </Button>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Campo label="Nombre *" htmlFor="i-nombre" ancho>
          <input id="i-nombre" placeholder="Castillo arcoíris" className={campoInputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Campo>
        <Campo label="Categoría" htmlFor="i-cat">
          <Select
            id="i-cat"
            value={cat}
            onChange={setCat}
            options={nombresCat.includes(cat) || !cat ? nombresCat : [cat, ...nombresCat]}
            placeholder="Elegí una categoría"
            triggerClassName={campoInputCls}
          />
        </Campo>
        <Campo label="Precio base ($)" htmlFor="i-precio">
          <input id="i-precio" type="number" min={0} step={500} placeholder="0 = sin definir" className={campoInputCls} value={precio} onChange={(e) => setPrecio(e.target.value)} />
        </Campo>
        <Campo label="Disponibilidad">
          <label className="inline-flex cursor-pointer items-center gap-2 font-body text-[.95rem]">
            <input type="checkbox" className="h-[18px] w-[18px] accent-verde" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
            Disponible para alquilar
          </label>
        </Campo>
        <Campo label="Medidas sin turbina (m): ancho · largo · alto" ancho>
          <div className="flex items-center gap-2">
            <input aria-label="Ancho sin turbina en metros" type="number" min={0} step={0.1} placeholder="ancho" className={campoInputCls} value={ancho} onChange={(e) => cambiarSin(setAncho, setAnchoT, e.target.value)} />
            <span className="font-alt font-bold text-[#5a4a41]">×</span>
            <input aria-label="Largo sin turbina en metros" type="number" min={0} step={0.1} placeholder="largo" className={campoInputCls} value={largo} onChange={(e) => cambiarSin(setLargo, setLargoT, e.target.value)} />
            <span className="font-alt font-bold text-[#5a4a41]">×</span>
            <input aria-label="Alto sin turbina en metros" type="number" min={0} step={0.1} placeholder="alto" className={campoInputCls} value={alto} onChange={(e) => cambiarSin(setAlto, setAltoT, e.target.value)} />
          </div>
        </Campo>
        <Campo label="Medidas con turbina (m): ancho · largo · alto" ancho>
          <div className="flex items-center gap-2">
            <input aria-label="Ancho con turbina en metros" type="number" min={0} step={0.1} placeholder="ancho" className={campoInputCls} value={anchoT} onChange={(e) => cambiarTurbina(setAnchoT, e.target.value)} />
            <span className="font-alt font-bold text-[#5a4a41]">×</span>
            <input aria-label="Largo con turbina en metros" type="number" min={0} step={0.1} placeholder="largo" className={campoInputCls} value={largoT} onChange={(e) => cambiarTurbina(setLargoT, e.target.value)} />
            <span className="font-alt font-bold text-[#5a4a41]">×</span>
            <input aria-label="Alto con turbina en metros" type="number" min={0} step={0.1} placeholder="alto" className={campoInputCls} value={altoT} onChange={(e) => cambiarTurbina(setAltoT, e.target.value)} />
          </div>
          <p className="mt-1.5 text-[.78rem] text-[#5a4a41]">
            Opcional. Se copian de las de arriba; ajustá el espacio real con la turbina puesta (tiene
            que ser mayor en al menos una medida).
          </p>
        </Campo>
        <Campo label="Descripción" htmlFor="i-desc" ancho>
          <textarea id="i-desc" rows={3} placeholder="Texto para la ficha del inflable" className={campoInputCls} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </Campo>
        <Campo label="Fotos" ancho>
          <div className="flex flex-wrap gap-2.5">
            {fotos.map((path) => (
              <div key={path} className="relative h-[84px] w-[84px] overflow-hidden rounded-xl border-3 border-tinta">
                <img src={urlFoto(path)} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label="Quitar foto"
                  onClick={() => quitarFoto(path)}
                  className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-lg border-2 border-tinta bg-rojo text-white shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={3} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={subiendo}
              className="flex h-[84px] w-[84px] flex-col items-center justify-center gap-1 rounded-xl border-3 border-dashed border-tinta bg-white font-alt text-[.72rem] font-extrabold text-[#5a4a41] hover:bg-papel disabled:opacity-60"
            >
              {subiendo ? "Subiendo…" : <>＋<br />Agregar</>}
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => agregarFotos(e.target.files)}
          />
          <p className="mt-1.5 text-[.78rem] text-[#5a4a41]">
            La primera foto es la portada en la web. Se comprimen solas al subir.
          </p>
        </Campo>
      </div>
    </Modal>
  );
}
