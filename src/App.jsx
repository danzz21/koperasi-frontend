import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import InstallBanner from '@/components/InstallBanner'

// Auth
import LoginPage    from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPassword'

// Anggota
import AnggotaLayout    from '@/layouts/AnggotaLayout'
import OnboardingPage   from '@/pages/anggota/OnboardingPage'
import EditProfilPage   from '@/pages/anggota/EditProfilPage'
import DashboardPage    from '@/pages/anggota/DashboardPage'
import SimpananPage     from '@/pages/anggota/SimpananPage'
import PinjamanPage     from '@/pages/anggota/PinjamanPage'
import PengunduranDiriPage from '@/pages/anggota/PengunduranDiriPage'
import NotifikasiPage    from '@/pages/anggota/NotifikasiPage'
import CicilanPage      from '@/pages/anggota/CicilanPage'
import ProfilPage       from '@/pages/anggota/ProfilPage'
import PpobPage         from '@/pages/anggota/ppob/PpobPage'
import PpobPulsaPage    from '@/pages/anggota/ppob/PulsaPage'
import PpobDataPage     from '@/pages/anggota/ppob/DataPage'
import PpobListrikPage  from '@/pages/anggota/ppob/ListrikPage'
import PpobEwalletPage  from '@/pages/anggota/ppob/EwalletPage'
import PpobStatusPage   from '@/pages/anggota/ppob/StatusPage'
import PpobRiwayatPage  from '@/pages/anggota/ppob/RiwayatPage'
import PpobConfirmationPage from '@/pages/anggota/ppob/ConfirmationPage'
import EwalletPage      from '@/pages/anggota/EwalletPage'
import PaymentCicilanPage  from '@/pages/anggota/payment/CicilanPage'
import PaymentSimpananPage from '@/pages/anggota/payment/SimpananPage'
import PaymentStatusPage   from '@/pages/anggota/payment/StatusPage'
import PaymentRiwayatPage  from '@/pages/anggota/payment/RiwayatPage'
import RiwayatEwalletPage  from '@/pages/anggota/ppob/RiwayatEwalletPage'

const ONBOARDING_PATH = '/anggota/onboarding'

// Guard components
function RequireAuth({ children, role, allowIncomplete = false }) {
  const { user } = useAuthStore()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace />

  if (role && user.role !== role) {
    if (user.role === 'admin' || user.role === 'superadmin') {
      window.location.replace(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/admin/login`)
      return null
    }

    return <Navigate to="/login" replace />
  }

  // Anggota wajib melengkapi data dulu sebelum memakai fitur apa pun
  if (!allowIncomplete && user.role === 'anggota' && user.needs_onboarding && location.pathname !== ONBOARDING_PATH) {
    return <Navigate to={ONBOARDING_PATH} replace />
  }

  return children
}

/** Sinkronkan data user dari server saat aplikasi dibuka (status onboarding bisa berubah dari admin). */
function useSyncUser() {
  const token = useAuthStore((state) => state.token)
  const refreshUser = useAuthStore((state) => state.refreshUser)

  useEffect(() => {
    if (token) {
      refreshUser()
    }
  }, [token, refreshUser])
}

function RedirectIfAuth() {
  const { user } = useAuthStore()

  if (user?.role === 'admin') {
    window.location.replace(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/admin`)
    return null
  }

  if (user?.role === 'anggota') {
    return <Navigate to={user.needs_onboarding ? ONBOARDING_PATH : '/anggota/dashboard'} replace />
  }

  return <Navigate to="/login" replace />
}

export default function App() {
  useSyncUser()

  return (
    <>
      {/* Banner install PWA — tampil di semua halaman (login maupun anggota) */}
      <InstallBanner />

      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<RedirectIfAuth />} />
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

        {/* ── Onboarding anggota (tanpa bottom nav, sebelum profil lengkap) ── */}
        <Route path={ONBOARDING_PATH} element={
          <RequireAuth role="anggota" allowIncomplete>
            <OnboardingPage />
          </RequireAuth>
        } />

        {/* ── Anggota ── */}
        <Route path="/anggota" element={
          <RequireAuth role="anggota"><AnggotaLayout /></RequireAuth>
        }>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard"  element={<DashboardPage />} />
          <Route path="simpanan"   element={<SimpananPage />} />
          <Route path="pinjaman"   element={<PinjamanPage />} />
          <Route path="pengunduran-diri" element={<PengunduranDiriPage />} />
          <Route path="notifikasi" element={<NotifikasiPage />} />
          <Route path="cicilan"    element={<CicilanPage />} />
          <Route path="profil"     element={<ProfilPage />} />
          <Route path="profil/edit" element={<EditProfilPage />} />

          {/* E-Wallet Koperasi */}
          <Route path="ewallet" element={<EwalletPage />} />

          {/* PPOB */}
          <Route path="ppob"               element={<PpobPage />} />
          <Route path="ppob/pulsa"         element={<PpobPulsaPage />} />
          <Route path="ppob/data"          element={<PpobDataPage />} />
          <Route path="ppob/listrik"       element={<PpobListrikPage />} />
          <Route path="ppob/ewallet"       element={<PpobEwalletPage />} />
          <Route path="ppob/konfirmasi"    element={<PpobConfirmationPage />} />
          <Route path="ppob/status/:orderId" element={<PpobStatusPage />} />
          <Route path="ppob/riwayat"       element={<PpobRiwayatPage />} />
          <Route path="ppob/riwayat-ewallet" element={<RiwayatEwalletPage />} />

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
    </>
  )
}
