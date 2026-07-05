/**
 * Scroll suave a una sección por id. Respeta prefers-reduced-motion.
 * Existe porque algunos entornos embebidos bloquean las anclas nativas;
 * en hosting real conviven ambas.
 */
export function scrollAId(id: string) {
  const destino = document.getElementById(id);
  if (!destino) return;
  const suave = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
  destino.scrollIntoView({ behavior: suave, block: "start" });
}
