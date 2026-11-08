import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { QuintaPage } from "@/pages/QuintaPage";
import { AdminPage } from "@/pages/AdminPage";
import { medirClicksWhatsApp } from "@/lib/metricas";

export default function App() {
  useEffect(() => medirClicksWhatsApp(), []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quinta" element={<QuintaPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
