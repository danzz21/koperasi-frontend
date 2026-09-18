import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    try {
      const user = await login(form.username, form.password)
      if (user.role === 'admin') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.replace(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/admin/login`)
        return
      }

      navigate('/anggota/dashboard', { replace: true })
    } catch (_) {}
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-2xl">KS</span>
          </div>
          <h1 className="text-2xl font-black text-gray-800">Koperasi Syariah</h1>
          <p className="text-emerald-600 font-semibold text-sm mt-1">K-Samara</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-800 mb-1">Selamat Datang 👋</h2>
          <p className="text-gray-500 text-sm mb-6">Masuk ke akun koperasi Anda</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Username / Email
              </label>
              <div className="relative">
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  className="input-field pl-10"
                  placeholder="Masukkan username atau email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field pl-10 pr-12"
                  placeholder="Masukkan password"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Masuk...
                </span>
              ) : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Belum punya akun?{' '}
            <Link to="/register" className="text-emerald-600 font-bold hover:underline">Daftar Sekarang</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 Koperasi Syariah K-Samara
        </p>
      </div>
    </div>
  )
}
