/**
 * WhatsApp es el funnel: no hay backend. Estos helpers arman los links.
 * Número principal — el secundario vive solo en el footer (ver data/site.ts).
 */
export const WHATSAPP = "541162263170";

/** Arma un link de wa.me con el texto ya codificado. */
export function linkWhatsApp(texto?: string, telefono: string = WHATSAPP): string {
  const base = `https://api.whatsapp.com/send?phone=${telefono}`;
  return texto ? `${base}&text=${encodeURIComponent(texto)}` : base;
}

/** Datos que arma el cotizador de la landing. */
export interface DatosCotizacion {
  nombre: string;
  inflable: string;
  fecha: string; // 'YYYY-MM-DD' (value del input date) o ""
  zona: string;
  lugar: string;
}

/** Convierte 'YYYY-MM-DD' a 'DD/MM/YYYY'; vacío → "a definir". */
export function formatearFecha(fechaISO: string): string {
  if (!fechaISO) return "a definir";
  const [y, m, d] = fechaISO.split("-");
  return `${d}/${m}/${y}`;
}

/** Construye el link de WhatsApp con el mensaje del cotizador armado. */
export function linkCotizacion(datos: DatosCotizacion): string {
  const { nombre, inflable, fecha, zona, lugar } = datos;
  let msg = "¡Hola Astefil! 🎈\n";
  msg += "Soy " + (nombre || "—") + " y quiero pedir un presupuesto.\n\n";
  msg += "• Me interesa: " + (inflable || "ver opciones") + "\n";
  msg += "• Fecha del evento: " + formatearFecha(fecha) + "\n";
  msg += "• Zona: " + (zona || "a coordinar") + "\n";
  if (lugar) msg += "• Lugar: " + lugar + "\n";
  msg += "\n¿Me pasan precio y disponibilidad? ¡Gracias!";
  return linkWhatsApp(msg);
}
