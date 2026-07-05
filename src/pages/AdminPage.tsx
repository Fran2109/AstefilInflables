import { useState } from "react";
import type { Inflable, Reserva } from "@/admin/types";
import { AdminProvider, useAdmin } from "@/admin/store/AdminContext";
import { Rail, type Vista } from "@/admin/components/Rail";
import { Gate } from "@/admin/components/Gate";
import { Toast } from "@/admin/components/Toast";
import { ReservaDialog } from "@/admin/components/ReservaDialog";
import { InflableDialog } from "@/admin/components/InflableDialog";
import { DiaDialog } from "@/admin/components/DiaDialog";
import { InicioView } from "@/admin/views/InicioView";
import { CalendarioView } from "@/admin/views/CalendarioView";
import { ReservasView } from "@/admin/views/ReservasView";
import { InventarioView } from "@/admin/views/InventarioView";
import { AjustesView } from "@/admin/views/AjustesView";

export function AdminPage() {
  return (
    <AdminProvider>
      <AdminInner />
    </AdminProvider>
  );
}

function AdminInner() {
  const { cargando, config } = useAdmin();
  const [gateOk, setGateOk] = useState(false);
  const [vista, setVista] = useState<Vista>("inicio");

  // Diálogos
  const [dlgReserva, setDlgReserva] = useState<{ open: boolean; reserva: Reserva | null; fecha?: string }>({
    open: false,
    reserva: null,
  });
  const [dlgInflable, setDlgInflable] = useState<{ open: boolean; inflable: Inflable | null }>({
    open: false,
    inflable: null,
  });
  const [dlgDia, setDlgDia] = useState<{ open: boolean; iso: string | null }>({ open: false, iso: null });

  const abrirReserva = (r: Reserva | null) => setDlgReserva({ open: true, reserva: r });
  const abrirInflable = (i: Inflable | null) => setDlgInflable({ open: true, inflable: i });
  const abrirDia = (iso: string) => setDlgDia({ open: true, iso });

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cielo">
        <span className="sticker">Cargando panel… 🎈</span>
      </div>
    );
  }

  if (!gateOk && config.pin !== "") {
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
        <Rail activa={vista} onCambiar={setVista} />
        <main className="mx-auto w-full max-w-[1100px] px-4 pb-[130px] pt-[18px] md:px-[30px] md:pb-[110px] md:pt-[26px]">
          {vista === "inicio" && <InicioView onAbrirReserva={abrirReserva} />}
          {vista === "calendario" && <CalendarioView onAbrirDia={abrirDia} />}
          {vista === "reservas" && <ReservasView onAbrirReserva={abrirReserva} />}
          {vista === "inventario" && <InventarioView onAbrirInflable={abrirInflable} />}
          {vista === "ajustes" && <AjustesView />}
        </main>
      </div>

      <ReservaDialog
        open={dlgReserva.open}
        reserva={dlgReserva.reserva}
        fechaSugerida={dlgReserva.fecha}
        onClose={() => setDlgReserva((d) => ({ ...d, open: false }))}
      />
      <InflableDialog
        open={dlgInflable.open}
        inflable={dlgInflable.inflable}
        onClose={() => setDlgInflable((d) => ({ ...d, open: false }))}
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
