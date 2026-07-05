export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
export const DOWS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** Hoy en 'YYYY-MM-DD' (hora local). */
export function hoyStr(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

/** Suma `n` días a una fecha ISO y devuelve ISO. */
export function addDias(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return (
    dt.getFullYear() +
    "-" +
    String(dt.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(dt.getDate()).padStart(2, "0")
  );
}

/** "Sáb 12 de julio 2026". */
export function fmtFechaLarga(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return DOWS[dt.getDay()] + " " + d + " de " + MESES[m - 1].toLowerCase() + " " + y;
}

/** Día de la semana (0=Dom … 6=Sáb) de una fecha ISO. */
export function dowDe(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** Mueve un mes 'YYYY-MM' en `n` meses. */
export function mueveMes(m: string, n: number): string {
  const [y, mm] = m.split("-").map(Number);
  const d = new Date(y, mm - 1 + n, 1);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}
