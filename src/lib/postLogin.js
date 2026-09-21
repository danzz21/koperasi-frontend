import useAuthStore from '@/store/authStore'

/**
 * Arahkan user setelah login berhasil.
 * Admin/superadmin memakai panel Filament (bukan SPA anggota).
 */
export function redirectAfterLogin(user, navigate) {
  if (user?.role === 'admin' || user?.role === 'superadmin') {
    useAuthStore.setState({ user: null, token: null })
    localStorage.removeItem('koperasi_token')
    localStorage.removeItem('koperasi_user')
    window.location.replace(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/admin/login`)
    return
  }

  navigate?.('/anggota/dashboard', { replace: true })
}
