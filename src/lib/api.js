import axios from 'axios'

// Base instance — semua request ke Laravel API
const api = axios.create({
  baseURL: '/api',          // di-proxy Vite ke http://localhost:8000/api
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
  timeout: 20000,
  withCredentials: false,
})

// Request interceptor: injek Bearer token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('koperasi_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 & 403 (profil belum lengkap) secara global
api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    const code = err.response?.data?.code

    if (status === 401) {
      localStorage.removeItem('koperasi_token')
      localStorage.removeItem('koperasi_user')
      window.location.href = '/login'
    }

    // Anggota yang belum melengkapi data (mis. login Google) diarahkan ke onboarding
    if (status === 403 && code === 'PROFILE_INCOMPLETE') {
      if (!window.location.pathname.startsWith('/anggota/onboarding')) {
        window.location.href = '/anggota/onboarding'
      }
    }

    return Promise.reject(err)
  }
)

export default api
