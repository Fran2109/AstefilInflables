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

export function LandingPage() {
  return (
    <CatalogoProvider>
      <LandingProvider>
        <Header />
        <main id="inicio">
          <Hero />
          <Marquee />
          <Catalogo />
          <Galeria />
          <Testimonios />
          <Cotizador />
          <ComoFunciona />
          <Zonas />
          <Faq />
          <CtaFinal />
        </main>
        <Footer />
        <WhatsAppFloat />
      </LandingProvider>
    </CatalogoProvider>
  );
}
