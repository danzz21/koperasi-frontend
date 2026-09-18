import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

// Auth
import LoginPage    from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'

// Anggota
import AnggotaLayout    from '@/layouts/AnggotaLayout'
import DashboardPage    from '@/pages/anggota/DashboardPage'
import SimpananPage     from '@/pages/anggota/SimpananPage'
import PinjamanPage     from '@/pages/anggota/PinjamanPage'
import CicilanPage      from '@/pages/anggota/CicilanPage'
import ProfilPage       from '@/pages/anggota/ProfilPage'
import PpobPage         from '@/pages/anggota/ppob/PpobPage'
import PpobPulsaPage    from '@/pages/anggota/ppob/PulsaPage'
import PpobDataPage     from '@/pages/anggota/ppob/DataPage'
import PpobListrikPage  from '@/pages/anggota/ppob/ListrikPage'
import PpobEwalletPage  from '@/pages/anggota/ppob/EwalletPage'
import PpobStatusPage   from '@/pages/anggota/ppob/StatusPage'
import PpobRiwayatPage  from '@/pages/anggota/ppob/RiwayatPage'
import PaymentCicilanPage  from '@/pages/anggota/payment/CicilanPage'
import PaymentSimpananPage from '@/pages/anggota/payment/SimpananPage'
import PaymentStatusPage   from '@/pages/anggota/payment/StatusPage'
import PaymentRiwayatPage  from '@/pages/anggota/payment/RiwayatPage'

// Guard components
function RequireAuth({ children, role }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    if (user.role === 'admin') {
      window.location.replace(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/admin/login`)
      return null
    }

    return <Navigate to="/login" replace />
  }
  return children
}

function RedirectIfAuth() {
  const { user } = useAuthStore()

  if (user?.role === 'admin') {
    window.location.replace(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/admin`)
    return null
  }

  if (user?.role === 'anggota') {
    return <Navigate to="/anggota/dashboard" replace />
  }

  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<RedirectIfAuth />} />
      <Route path="/login"   element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Anggota ── */}
      <Route path="/anggota" element={
        <RequireAuth role="anggota"><AnggotaLayout /></RequireAuth>
      }>
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard"  element={<DashboardPage />} />
        <Route path="simpanan"   element={<SimpananPage />} />
        <Route path="pinjaman"   element={<PinjamanPage />} />
        <Route path="cicilan"    element={<CicilanPage />} />
        <Route path="profil"     element={<ProfilPage />} />

        {/* PPOB */}
        <Route path="ppob"               element={<PpobPage />} />
        <Route path="ppob/pulsa"         element={<PpobPulsaPage />} />
        <Route path="ppob/data"          element={<PpobDataPage />} />
        <Route path="ppob/listrik"       element={<PpobListrikPage />} />
        <Route path="ppob/ewallet"       element={<PpobEwalletPage />} />
        <Route path="ppob/status/:orderId" element={<PpobStatusPage />} />
        <Route path="ppob/riwayat"       element={<PpobRiwayatPage />} />

        {/* Payment */}
        <Route path="payment/cicilan/:jenis/:id" element={<PaymentCicilanPage />} />
        <Route path="payment/simpanan/:jenis"    element={<PaymentSimpananPage />} />
        <Route path="payment/status/:orderId"    element={<PaymentStatusPage />} />
        <Route path="payment/riwayat"            element={<PaymentRiwayatPage />} />
      </Route>

      {/* ── 404 ── */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-6xl font-black text-gray-200 mb-2">404</div>
            <p className="font-semibold mb-4">Halaman tidak ditemukan</p>
            <a href="/" className="text-emerald-600 font-bold hover:underline">← Kembali ke Beranda</a>
          </div>
        </div>
      } />
    </Routes>
  )
}
