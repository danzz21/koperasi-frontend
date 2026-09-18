import axios from 'axios'

// Base instance — semua request ke Laravel API
const api = axios.create({
  baseURL: '/api',          // di-proxy Vite ke http://localhost:8000/api
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
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

// Response interceptor: handle 401 global
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('koperasi_token')
      localStorage.removeItem('koperasi_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
