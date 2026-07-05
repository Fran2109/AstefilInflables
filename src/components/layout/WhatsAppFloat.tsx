import { linkWhatsApp } from "@/lib/whatsapp";

/** Botón flotante de WhatsApp, siempre visible. */
export function WhatsAppFloat() {
  return (
    <a
      href={linkWhatsApp("¡Hola Astefil! Quiero consultar por un inflable 🎉")}
      target="_blank"
      rel="noopener"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-[22px] right-[22px] z-[70] flex h-[62px] w-[62px] items-center justify-center rounded-full border-3 border-tinta bg-verde shadow-hard-sm transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard active:translate-x-[3px] active:translate-y-[3px] active:scale-95 active:shadow-none"
    >
      <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white" aria-hidden="true">
        <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.33 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.83 9.83 0 0 0 12.04 2zm5.82 14.13c-.25.7-1.45 1.34-2 1.39-.51.05-1.15.07-1.86-.12-.43-.11-.98-.29-1.69-.55-2.97-1.09-4.9-4.08-5.05-4.27-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.25.58.84 2 .91 2.15.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.76 1.24 1.63 2.01 1.12.99 2.06 1.3 2.36 1.45.3.15.47.12.64-.07.17-.2.74-.86.94-1.15.2-.3.39-.25.66-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.07.12.07.72-.18 1.42z" />
      </svg>
    </a>
  );
}
