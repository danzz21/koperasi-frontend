import { create } from 'zustand'
import api from '@/lib/api'

const useAuthStore = create((set, get) => ({
  user:    JSON.parse(localStorage.getItem('koperasi_user') || 'null'),
  token:   localStorage.getItem('koperasi_token') || null,
  loading: false,
  error:   null,

  // Login
  login: async (username, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { username, password })
      localStorage.setItem('koperasi_token', data.token)
      localStorage.setItem('koperasi_user',  JSON.stringify(data.user))
      set({ token: data.token, user: data.user, loading: false })
      return data.user
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal'
      set({ error: msg, loading: false })
      throw new Error(msg)
    }
  },

  // Logout
  logout: async () => {
    try { await api.post('/auth/logout') } catch (_) {}
    localStorage.removeItem('koperasi_token')
    localStorage.removeItem('koperasi_user')
    set({ user: null, token: null })
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Tandai proses login berjalan (dipakai hook Google/passkey)
  setLoading: (loading) => set({ loading }),

  // Set pesan error dari jalur login lain
  setError: (message) => set({ error: message, loading: false }),

  /**
   * Simpan hasil login dari jalur selain password (Google / passkey).
   * Menerima { token, user } sesuai balikan AuthController.
   */
  applyAuth: ({ token, user } = {}) => {
    if (!user) {
      set({ loading: false, error: 'Respons login tidak valid.' })
      return null
    }

    if (token) localStorage.setItem('koperasi_token', token)
    localStorage.setItem('koperasi_user', JSON.stringify(user))
    set({ token: token ?? get().token, user, loading: false, error: null })

    return user
  },

  // Check apakah user adalah admin
  isAdmin:   () => get().user?.role === 'admin',
  isAnggota: () => get().user?.role === 'anggota',
}))

export default useAuthStore
