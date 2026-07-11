import { useRef, useState } from "react";
import type { Articulo, Reserva } from "@/admin/types";
import { hoyStr } from "@/admin/lib/fechas";
import { nombresInf } from "@/admin/lib/conflictos";
import { useAdmin } from "@/admin/store/AdminContext";
import { useConfirmar } from "@/admin/components/Confirm";
import { Panel } from "@/admin/views/comunes";
import { Button } from "@/components/ui/button";

/** Descarga un archivo generado en el navegador. */
function descargar(nombre: string, contenido: string, tipo: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function AjustesView() {
  const { config, reservas, articulos, online, emailUsuario, cerrarSesion, setNombre, setPin, cargarEjemplos, borrarTodo, importarBackup, mostrarToast } =
    useAdmin();
  const confirmar = useConfirmar();
  const [nombre, setNombreLocal] = useState(config.nombre || "");
  const fileRef = useRef<HTMLInputElement>(null);

  const exportarJson = () => {
    const data = {
      app: "astefil-admin",
      version: 1,
      exportado: new Date().toISOString(),
      config: { nombre: config.nombre },
      articulos,
      reservas,
    };
    descargar("astefil-backup-" + hoyStr() + ".json", JSON.stringify(data, null, 2), "application/json");
  };

  const exportarCsv = () => {
    const cab = ["fecha", "cliente", "telefono", "zona", "direccion", "articulos", "estado", "precio", "sena", "resta", "hora_entrega", "hora_retiro", "notas"];
    const filas = reservas.map((r) =>
      [
        r.fecha, r.cliente, r.telefono, r.zona, r.direccion,
        nombresInf(r.articuloIds, articulos).join(" + "),
        r.estado, r.precio, r.sena, (Number(r.precio) || 0) - (Number(r.sena) || 0),
        r.horaEntrega, r.horaRetiro, r.notas,
      ]
        .map((v) => '"' + String(v ?? "").replace(/"/g, '""') + '"')
        .join(",")
    );
    descargar("astefil-reservas-" + hoyStr() + ".csv", "﻿" + cab.join(",") + "\n" + filas.join("\n"), "text/csv");
  };

  const importar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text()) as { reservas?: Reserva[]; articulos?: Articulo[]; config?: { nombre?: string } };
      if (!Array.isArray(data.reservas) || !Array.isArray(data.articulos)) throw new Error("inválido");
      await importarBackup(data.reservas, data.articulos, data.config?.nombre);
    } catch {
      mostrarToast("Archivo inválido");
    }
    e.target.value = "";
  };

  const cambiarPin = async () => {
    const v = window.prompt("Nuevo PIN (vacío = sin PIN):", "");
    if (v === null) return;
    await setPin(v.trim());
    mostrarToast(v.trim() ? "PIN actualizado ✓" : "Acceso sin PIN");
  };

  const confirmarBorrar = async () => {
    const ok = await confirmar({
      titulo: "Borrar todo",
      mensaje: (
        <>
          Vas a borrar <strong>TODAS las reservas</strong>, el inventario y los ajustes. Esta acción
          no se puede deshacer. ¿Seguro?
        </>
      ),
      textoConfirmar: "Sí, borrar todo",
      peligro: true,
    });
    if (!ok) return;
    await borrarTodo();
    setNombreLocal("");
  };

  return (
    <div>
      <div className="mb-[22px]">
        <h2 className="text-[1.9rem]">Ajustes</h2>
      </div>

      <Panel>
        <Fila titulo="Tu nombre" desc="Para el saludo del panel.">
          <input
            className="rounded-xl border-3 border-tinta bg-white px-3 py-2.5 font-body focus-visible:outline focus-visible:outline-4 focus-visible:outline-azul"
            placeholder="Fran"
            value={nombre}
            onChange={(e) => setNombreLocal(e.target.value)}
            onBlur={() => nombre.trim() !== config.nombre && setNombre(nombre.trim())}
          />
        </Fila>

        {online ? (
          <Fila titulo="Sesión" desc={emailUsuario ? "Conectado como " + emailUsuario + "." : "Conectado a la nube."}>
            <Button variant="blanco" size="mini" onClick={cerrarSesion}>
              Cerrar sesión
            </Button>
          </Fila>
        ) : (
          <Fila titulo="PIN de acceso" desc="Cambiá el PIN de entrada. Dejalo vacío para entrar sin PIN.">
            <Button variant="blanco" size="mini" onClick={cambiarPin}>
              Cambiar PIN
            </Button>
          </Fila>
        )}

        <Fila
          titulo="Copia de seguridad"
          desc={
            online
              ? "Tus datos viven en Supabase (nube). Igual podés exportar un JSON de respaldo cuando quieras."
              : "Los datos viven en este navegador. Exportá un JSON cada tanto y guardalo donde quieras."
          }
        >
          <div className="flex flex-wrap gap-2">
            <Button variant="azul" size="mini" onClick={exportarJson}>⬇ Exportar JSON</Button>
            <Button variant="blanco" size="mini" onClick={() => fileRef.current?.click()}>⬆ Importar</Button>
            <Button variant="verde" size="mini" onClick={exportarCsv}>⬇ Reservas CSV</Button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={importar} />
          </div>
        </Fila>

        <Fila titulo="Datos de ejemplo" desc='Cargá reservas de muestra (marcadas como "Ejemplo") para probar el panel.'>
          <Button variant="blanco" size="mini" onClick={cargarEjemplos}>
            Cargar ejemplos
          </Button>
        </Fila>

        <Fila titulo="Borrar todo" desc="Elimina reservas, inventario y ajustes de este dispositivo. No hay vuelta atrás.">
          <Button variant="peligro" size="mini" onClick={confirmarBorrar}>
            🗑 Borrar todo
          </Button>
        </Fila>
      </Panel>

      <p className="text-[.82rem] text-[#5a4a41]">
        {online
          ? "Conectado a Supabase · Tus datos se sincronizan en la nube entre todos tus dispositivos."
          : "Prototipo local · Los datos se guardan en este dispositivo (localStorage)."}
      </p>
    </div>
  );
}

function Fila({ titulo, desc, children }: { titulo: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3.5 border-b-2 border-dashed border-[#e5d9cd] py-3 last:border-b-0">
      <div>
        <h4 className="text-base font-extrabold">{titulo}</h4>
        <p className="max-w-[420px] text-[.88rem] text-[#5a4a41]">{desc}</p>
      </div>
      {children}
    </div>
  );
}
