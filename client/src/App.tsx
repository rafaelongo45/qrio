import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import QRPage from './pages/QRPage'
import DashboardPage from './pages/DashboardPage'
import DynamicQRPage from './pages/DynamicQRPage'
import CheckoutPage from './pages/CheckoutPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import PrivacyPage from './pages/PrivacyPage'
import NotFound from './pages/NotFound'

function AppRoutes() {
  const { pathname } = useLocation()

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/qr-dinamico" element={<DynamicQRPage />} />
        <Route path="/assinar-pro" element={<CheckoutPage />} />
        <Route path="/gerador-qr-code" element={<QRPage key={pathname} />} />
        <Route path="/gerador-qr-code-url" element={<QRPage key={pathname} defaultType="url" />} />
        <Route path="/gerador-qr-code-pix" element={<QRPage key={pathname} defaultType="pix" />} />
        <Route path="/gerador-qr-code-whatsapp" element={<QRPage key={pathname} defaultType="whatsapp" />} />
        <Route path="/gerador-qr-code-wifi" element={<QRPage key={pathname} defaultType="wifi" />} />
        <Route path="/gerador-qr-code-email" element={<QRPage key={pathname} defaultType="email" />} />
        <Route path="/gerador-qr-code-texto" element={<QRPage key={pathname} defaultType="texto" />} />
        <Route path="/gerador-qr-code-telefone" element={<QRPage key={pathname} defaultType="telefone" />} />
        <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
