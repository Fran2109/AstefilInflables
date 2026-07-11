import { useState } from "react";
import type { Articulo, Categoria, Reserva, Zona } from "@/admin/types";
import { AdminProvider, useAdmin } from "@/admin/store/AdminContext";
import { Rail, type Vista } from "@/admin/components/Rail";
import { Gate } from "@/admin/components/Gate";
import { Login } from "@/admin/components/Login";
import { ConfirmProvider } from "@/admin/components/Confirm";
import { Toast } from "@/admin/components/Toast";
import { ReservaDialog } from "@/admin/components/ReservaDialog";
import { ArticuloDialog } from "@/admin/components/ArticuloDialog";
import { CategoriaDialog } from "@/admin/components/CategoriaDialog";
import { ZonaDialog } from "@/admin/components/ZonaDialog";
import { DiaDialog } from "@/admin/components/DiaDialog";
import { InicioView } from "@/admin/views/InicioView";
import { CalendarioView } from "@/admin/views/CalendarioView";
import { ReservasView } from "@/admin/views/ReservasView";
import { InventarioView } from "@/admin/views/InventarioView";
import { CategoriasView } from "@/admin/views/CategoriasView";
import { ZonasView } from "@/admin/views/ZonasView";
import { EquipoView } from "@/admin/views/EquipoView";
import { AjustesView } from "@/admin/views/AjustesView";

export function AdminPage() {
  return (
    <AdminProvider>
      <ConfirmProvider>
        <AdminInner />
      </ConfirmProvider>
    </AdminProvider>
  );
}

function AdminInner() {
  const { cargando, config, online, sesion, esAdmin } = useAdmin();
  const [gateOk, setGateOk] = useState(false);
  const [vista, setVista] = useState<Vista>("inicio");
  // Vistas solo para admin: si un empleado cae en una, se muestra Inicio.
  const adminOnly =
    vista === "categorias" || vista === "zonas" || vista === "equipo" || vista === "ajustes";
  const vistaActual: Vista = adminOnly && !esAdmin ? "inicio" : vista;

  // Diálogos
  const [dlgReserva, setDlgReserva] = useState<{ open: boolean; reserva: Reserva | null; fecha?: string }>({
    open: false,
    reserva: null,
  });
  const [dlgArticulo, setDlgArticulo] = useState<{ open: boolean; articulo: Articulo | null }>({
    open: false,
    articulo: null,
  });
  const [dlgCategoria, setDlgCategoria] = useState<{ open: boolean; categoria: Categoria | null }>({
    open: false,
    categoria: null,
  });
  const [dlgZona, setDlgZona] = useState<{ open: boolean; zona: Zona | null }>({
    open: false,
    zona: null,
  });
  const [dlgDia, setDlgDia] = useState<{ open: boolean; iso: string | null }>({ open: false, iso: null });

  const abrirReserva = (r: Reserva | null) => setDlgReserva({ open: true, reserva: r });
  const abrirArticulo = (a: Articulo | null) => setDlgArticulo({ open: true, articulo: a });
  const abrirCategoria = (c: Categoria | null) => setDlgCategoria({ open: true, categoria: c });
  const abrirZona = (z: Zona | null) => setDlgZona({ open: true, zona: z });
  const abrirDia = (iso: string) => setDlgDia({ open: true, iso });

  // Modo Supabase: login real. Sin sesión → pantalla de login.
  if (online && sesion === false) {
    return (
      <div className="font-body text-tinta">
        <Login onEntrar={() => {}} />
        <Toast />
      </div>
    );
  }

  if (cargando || (online && sesion === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cielo">
        <span className="sticker">Cargando panel… 🎈</span>
      </div>
    );
  }

  // Modo local: gate de PIN (disuasión casual).
  if (!online && !gateOk && config.pin !== "") {
    return (
      <div className="font-body text-tinta">
        <Gate onUnlock={() => setGateOk(true)} />
        <Toast />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-papel font-body text-tinta"
      style={{
        backgroundImage: "radial-gradient(circle at 90% -10%, var(--cielo) 0 260px, transparent 261px)",
      }}
    >
      <div className="grid md:grid-cols-[230px_1fr]">
        <Rail activa={vistaActual} onCambiar={setVista} />
        <main className="mx-auto w-full max-w-[1100px] px-4 pb-[130px] pt-[18px] md:px-[30px] md:pb-[110px] md:pt-[26px]">
          {vistaActual === "inicio" && <InicioView onAbrirReserva={abrirReserva} />}
          {vistaActual === "calendario" && <CalendarioView onAbrirDia={abrirDia} />}
          {vistaActual === "reservas" && <ReservasView onAbrirReserva={abrirReserva} />}
          {vistaActual === "inventario" && <InventarioView onAbrirArticulo={abrirArticulo} />}
          {vistaActual === "categorias" && <CategoriasView onAbrirCategoria={abrirCategoria} />}
          {vistaActual === "zonas" && <ZonasView onAbrirZona={abrirZona} />}
          {vistaActual === "equipo" && <EquipoView />}
          {vistaActual === "ajustes" && <AjustesView />}
        </main>
      </div>

      <ReservaDialog
        open={dlgReserva.open}
        reserva={dlgReserva.reserva}
        fechaSugerida={dlgReserva.fecha}
        onClose={() => setDlgReserva((d) => ({ ...d, open: false }))}
      />
      <ArticuloDialog
        open={dlgArticulo.open}
        articulo={dlgArticulo.articulo}
        onClose={() => setDlgArticulo((d) => ({ ...d, open: false }))}
      />
      <CategoriaDialog
        open={dlgCategoria.open}
        categoria={dlgCategoria.categoria}
        onClose={() => setDlgCategoria((d) => ({ ...d, open: false }))}
      />
      <ZonaDialog
        open={dlgZona.open}
        zona={dlgZona.zona}
        onClose={() => setDlgZona((d) => ({ ...d, open: false }))}
      />
      <DiaDialog
        open={dlgDia.open}
        iso={dlgDia.iso}
        onClose={() => setDlgDia((d) => ({ ...d, open: false }))}
        onAbrirReserva={(r) => {
          setDlgDia((d) => ({ ...d, open: false }));
          abrirReserva(r);
        }}
        onNuevaEnDia={(iso) => {
          setDlgDia((d) => ({ ...d, open: false }));
          setDlgReserva({ open: true, reserva: null, fecha: iso });
        }}
      />

      <Toast />
    </div>
  );
}
