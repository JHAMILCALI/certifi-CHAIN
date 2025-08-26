import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'  // 👈 ahora sí
import CertificatePage from './CertificatePage';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/:id" element={<CertificatePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
