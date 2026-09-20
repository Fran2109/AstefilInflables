import { LandingProvider } from "@/context/LandingContext";
import { CatalogoProvider } from "@/context/CatalogoContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { Catalogo } from "@/components/landing/Catalogo";
import { Galeria } from "@/components/landing/Galeria";
import { Testimonios } from "@/components/landing/Testimonios";
import { Cotizador } from "@/components/landing/Cotizador";
import { ComoFunciona } from "@/components/landing/ComoFunciona";
import { Zonas } from "@/components/landing/Zonas";
import { Faq } from "@/components/landing/Faq";
import { CtaFinal } from "@/components/landing/CtaFinal";
import { BandaQuinta } from "@/components/landing/BandaQuinta";

export function LandingPage() {
  return (
    <CatalogoProvider>
      <LandingProvider>
        <Header />
        <main id="inicio">
          {/* El orden es el recorrido de una decisión, no una lista de
              secciones: mostrar el producto, probarlo con fotos reales,
              explicar el servicio, confirmar que llegamos a su zona, y recién
              ahí pedirle los datos.

              Antes "¿Cómo funciona?" y "¿Llegamos a tu zona?" venían DESPUÉS
              del cotizador. Las dos responden objeciones que se tienen antes
              de ponerse a completar campos — y si no llegábamos a su zona, el
              formulario que ya había llenado era tiempo perdido. */}
          <Hero />
          <Marquee />
          <Catalogo />
          <Galeria />
          <Testimonios />
          <ComoFunciona />
          <Zonas />
          <Cotizador />
          <BandaQuinta />
          <Faq />
          <CtaFinal />
        </main>
        <Footer />
        <WhatsAppFloat />
      </LandingProvider>
    </CatalogoProvider>
  );
}
