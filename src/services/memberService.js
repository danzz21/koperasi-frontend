import api from '@/lib/api'

const memberData = path => api.get(path).then(response => response.data?.data ?? {})

export const getDashboard = () => memberData('/anggota/dashboard')
export const getSavings = () => memberData('/anggota/simpanan')
export const getLoans = () => memberData('/anggota/pinjaman').then(data => Array.isArray(data) ? data : [])
export const submitLoanApplication = payload => api.post('/anggota/pinjaman/ajukan', payload)
export const getInstallments = () => memberData('/anggota/cicilan').then(data => Array.isArray(data) ? data : [])
export const getProfile = () => memberData('/anggota/profil')
export const updateProfile = payload => api.post('/anggota/profil/update', payload).then(response => response.data)
export const getOnboarding = () => api.get('/anggota/onboarding').then(response => response.data)
export const submitOnboarding = payload => api.post('/anggota/onboarding', payload).then(response => response.data)

export const getWithdrawalSummary = () => api.get('/anggota/pengunduran-diri/ringkasan')
  .then(response => response.data?.data ?? response.data ?? {})
export const getWithdrawalRequests = () => api.get('/anggota/pengunduran-diri')
  .then(response => response.data?.data ?? [])
export const submitWithdrawalRequest = () => api.post('/anggota/pengunduran-diri')
