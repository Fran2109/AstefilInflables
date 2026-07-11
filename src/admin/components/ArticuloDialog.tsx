import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Articulo } from "@/admin/types";
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
  articulo: Articulo | null;
}

export function ArticuloDialog({ open, onClose, articulo }: Props) {
  const { reservas, categorias, guardarArticulo, eliminarArticulo, mostrarToast } = useAdmin();
  const confirmar = useConfirmar();
  // Nombres de categorías activas, ordenadas (para el desplegable).
  const nombresCat = [...categorias]
    .filter((c) => c.activo)
    .sort((a, b) => a.orden - b.orden)
    .map((c) => c.nombre);
  const [nombre, setNombre] = useState("");
  const [cat, setCat] = useState(nombresCat[0] ?? "");
  // Config de atributos de la categoría elegida (si no está, todo "opcional").
  const categoriaSel = categorias.find((c) => c.nombre === cat);
  const reqDescripcion = categoriaSel?.descripcionReq ?? "opcional";
  const reqMedidas = categoriaSel?.medidasReq ?? "opcional";
  const reqMedidasTurbina = categoriaSel?.medidasTurbinaReq ?? "opcional";
  const reqFotos = categoriaSel?.fotosReq ?? "opcional";
  const turbinaVisible = reqMedidasTurbina !== "no_aplica";
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
  const [notasInternas, setNotasInternas] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setNombre(articulo?.nombre || "");
    setCat(articulo?.cat || nombresCat[0] || "");
    setPrecio(articulo?.precio ? String(articulo.precio) : "");
    setActivo(articulo ? articulo.activo : true);
    setDescripcion(articulo?.descripcion || "");
    setAncho(articulo?.ancho ? String(articulo.ancho) : "");
    setLargo(articulo?.largo ? String(articulo.largo) : "");
    setAlto(articulo?.alto ? String(articulo.alto) : "");
    setAnchoT(articulo?.anchoTurbina ? String(articulo.anchoTurbina) : "");
    setLargoT(articulo?.largoTurbina ? String(articulo.largoTurbina) : "");
    setAltoT(articulo?.altoTurbina ? String(articulo.altoTurbina) : "");
    // Si ya trae medidas con turbina, se respetan (modo manual); si no, se copiarán.
    setTurbinaManual(!!(articulo?.anchoTurbina || articulo?.largoTurbina || articulo?.altoTurbina));
    setFotos(articulo?.fotos ?? []);
    setNotasInternas(articulo?.notasInternas || "");
  }, [open, articulo]);

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

  // Medidas parseadas y si hay alguna medida con turbina cargada (solo cuenta
  // si la categoría elegida usa turbina).
  const dims = ["ancho", "largo", "alto"] as const;
  const s = { ancho: numOpt(ancho), largo: numOpt(largo), alto: numOpt(alto) };
  const t = { ancho: numOpt(anchoT), largo: numOpt(largoT), alto: numOpt(altoT) };
  const turbinaCargada = turbinaVisible && dims.some((d) => t[d] != null);

  // Motivo por el que NO se puede guardar todavía (null = todo OK). Se usa para
  // deshabilitar el botón y como chequeo defensivo al guardar. Los atributos
  // "obligatorio" dependen de la categoría elegida (Categoria.*Req).
  const problema: string | null = (() => {
    if (!nombre.trim()) return "Falta el nombre";
    if (reqDescripcion === "obligatorio" && !descripcion.trim()) return "Falta la descripción";
    if (reqMedidas === "obligatorio" && (s.ancho == null || s.largo == null))
      return "Faltan las medidas (ancho y largo)";
    if (reqFotos === "obligatorio" && fotos.length === 0) return "Faltan fotos";
    if (turbinaVisible) {
      if (reqMedidasTurbina === "obligatorio" && !turbinaCargada) return "Faltan las medidas con turbina";
      if (turbinaCargada) {
        for (const d of dims) {
          if (t[d] == null) continue;
          if (s[d] == null) return `Cargá el ${d} sin turbina antes que el de con turbina`;
          if (t[d]! < s[d]!) return `El ${d} con turbina no puede ser menor que sin turbina`;
        }
        const algunaMayor = dims.some((d) => t[d] != null && s[d] != null && t[d]! > s[d]!);
        if (!algunaMayor) return "Con turbina tiene que ser mayor que sin turbina en al menos una medida";
      }
    }
    return null;
  })();

  const guardar = async () => {
    if (problema) return mostrarToast(problema);
    if (subiendo) return mostrarToast("Esperá a que terminen de subir las fotos");

    // Los campos "no aplica" para la categoría elegida no se guardan, aunque
    // hayan quedado con datos de una categoría anterior.
    await guardarArticulo(
      {
        nombre: nombre.trim(),
        cat,
        precio: Number(precio) || 0,
        activo,
        descripcion: reqDescripcion === "no_aplica" ? "" : descripcion.trim(),
        ancho: reqMedidas === "no_aplica" ? undefined : s.ancho,
        largo: reqMedidas === "no_aplica" ? undefined : s.largo,
        alto: reqMedidas === "no_aplica" ? undefined : s.alto,
        anchoTurbina: turbinaCargada ? t.ancho : undefined,
        largoTurbina: turbinaCargada ? t.largo : undefined,
        altoTurbina: turbinaCargada ? t.alto : undefined,
        fotos: reqFotos === "no_aplica" ? [] : fotos,
        notasInternas: notasInternas.trim(),
      },
      articulo?.id
    );
    // Borra del storage las fotos guardadas que se quitaron (evita archivos huérfanos).
    const eliminadas = (articulo?.fotos ?? []).filter((p) => !fotos.includes(p));
    eliminadas.forEach((p) => borrarFoto(p).catch(() => {}));
    onClose();
    mostrarToast("Inventario guardado ✓");
  };

  const eliminar = async () => {
    if (!articulo) return;
    const usos = reservas.filter((r) => (r.articuloIds || []).includes(articulo.id)).length;
    const ok = await confirmar({
      titulo: "Eliminar artículo",
      mensaje: (
        <>
          ¿Eliminar <strong>{articulo.nombre}</strong>?
          {usos ? ` Está en ${usos} reserva(s); quedarán sin ese ítem.` : ""}
        </>
      ),
      textoConfirmar: "Eliminar",
      peligro: true,
    });
    if (!ok) return;
    await eliminarArticulo(articulo.id);
    onClose();
    mostrarToast("Eliminado");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      titulo={articulo ? "Editar artículo" : "Agregar al inventario"}
      footer={
        <>
          {articulo && (
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
        {reqMedidas !== "no_aplica" && (
          <Campo label={`Medidas (m): ancho · largo · alto${reqMedidas === "obligatorio" ? " *" : ""}`} ancho>
            <div className="flex items-center gap-2">
              <input aria-label="Ancho en metros" type="number" min={0} step={0.1} placeholder="ancho" className={campoInputCls} value={ancho} onChange={(e) => cambiarSin(setAncho, setAnchoT, e.target.value)} />
              <span className="font-alt font-bold text-[#5a4a41]">×</span>
              <input aria-label="Largo en metros" type="number" min={0} step={0.1} placeholder="largo" className={campoInputCls} value={largo} onChange={(e) => cambiarSin(setLargo, setLargoT, e.target.value)} />
              <span className="font-alt font-bold text-[#5a4a41]">×</span>
              <input aria-label="Alto en metros" type="number" min={0} step={0.1} placeholder="alto" className={campoInputCls} value={alto} onChange={(e) => cambiarSin(setAlto, setAltoT, e.target.value)} />
            </div>
          </Campo>
        )}
        {turbinaVisible && (
          <Campo label={`Medidas con turbina (m): ancho · largo · alto${reqMedidasTurbina === "obligatorio" ? " *" : ""}`} ancho>
            <div className="flex items-center gap-2">
              <input aria-label="Ancho con turbina en metros" type="number" min={0} step={0.1} placeholder="ancho" className={campoInputCls} value={anchoT} onChange={(e) => cambiarTurbina(setAnchoT, e.target.value)} />
              <span className="font-alt font-bold text-[#5a4a41]">×</span>
              <input aria-label="Largo con turbina en metros" type="number" min={0} step={0.1} placeholder="largo" className={campoInputCls} value={largoT} onChange={(e) => cambiarTurbina(setLargoT, e.target.value)} />
              <span className="font-alt font-bold text-[#5a4a41]">×</span>
              <input aria-label="Alto con turbina en metros" type="number" min={0} step={0.1} placeholder="alto" className={campoInputCls} value={altoT} onChange={(e) => cambiarTurbina(setAltoT, e.target.value)} />
            </div>
            <p className="mt-1.5 text-[.78rem] text-[#5a4a41]">
              Se copian de las de arriba; ajustá el espacio real con la turbina puesta (tiene que ser
              mayor en al menos una medida).
            </p>
          </Campo>
        )}
        {reqDescripcion !== "no_aplica" && (
          <Campo label={`Descripción${reqDescripcion === "obligatorio" ? " *" : ""}`} htmlFor="i-desc" ancho>
            <textarea id="i-desc" rows={3} placeholder="Texto para la ficha del artículo" className={campoInputCls} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </Campo>
        )}
        {reqFotos !== "no_aplica" && (
        <Campo label={`Fotos${reqFotos === "obligatorio" ? " *" : ""}`} ancho>
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
        )}
        <Campo label="Notas internas" htmlFor="i-notas" ancho>
          <textarea id="i-notas" rows={2} placeholder="Estado, ubicación, defectos… (solo para el equipo, nunca se muestra en la web)" className={campoInputCls} value={notasInternas} onChange={(e) => setNotasInternas(e.target.value)} />
        </Campo>
      </div>
    </Modal>
  );
}
