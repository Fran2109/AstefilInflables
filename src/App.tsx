import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { QuintaPage } from "@/pages/QuintaPage";
import { AdminPage } from "@/pages/AdminPage";

export default function App() {
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
