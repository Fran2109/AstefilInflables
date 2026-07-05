import type { Inflable, Reserva } from "@/admin/types";
import { telWa, plata } from "@/admin/lib/formato";
import { nombresInf } from "@/admin/lib/conflictos";
import { fmtFechaLarga } from "@/admin/lib/fechas";

/**
 * Arma el link de WhatsApp al cliente. Mensaje distinto para Consulta vs. confirmación.
 * Devuelve null si la reserva no tiene teléfono válido.
 */
export function linkWaCliente(r: Reserva, inflables: Inflable[]): string | null {
  const tel = telWa(r.telefono);
  if (!tel) return null;
  const infs = nombresInf(r.inflableIds, inflables).join(", ");
  let msg: string;
  if (r.estado === "Consulta") {
    msg =
      "¡Hola " + (r.cliente || "") + "! Te escribo de Astefil Inflables por tu consulta para el " +
      fmtFechaLarga(r.fecha) + " (" + infs + "). ¿Seguimos coordinando? 🎈";
  } else {
    const resto = (Number(r.precio) || 0) - (Number(r.sena) || 0);
    msg =
      "¡Hola " + (r.cliente || "") + "! Te confirmo tu reserva de Astefil Inflables 🎈\n\n• " +
      infs + "\n• " + fmtFechaLarga(r.fecha) +
      (r.horaEntrega ? "\n• Entrega: " + r.horaEntrega : "") +
      (r.direccion || r.zona ? "\n• Lugar: " + [r.direccion, r.zona].filter(Boolean).join(", ") : "") +
      (r.precio
        ? "\n• Total: " + plata(r.precio) + (r.sena ? " (seña " + plata(r.sena) + ", resta " + plata(resto) + ")" : "")
        : "") +
      "\n\n¡Gracias!";
  }
  return "https://api.whatsapp.com/send?phone=" + tel + "&text=" + encodeURIComponent(msg);
}
