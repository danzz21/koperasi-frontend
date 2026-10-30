import api from '@/lib/api'

export const getPpobCatalog = () => api.get('/anggota/ppob').then(response => response.data)
export const getPpobHistory = () => api.get('/anggota/ppob/riwayat')
  .then(response => response.data?.data ?? [])
export const getPpobStatus = orderId => api.get(`/anggota/ppob/status/${orderId}`)
  .then(response => response.data?.data || response.data)
export const createPpobOrder = payload => api.post('/anggota/ppob/order', payload, { timeout: 20000 })
export const simulatePpobPayment = orderId => api.post('/anggota/ppob/simulasi-bayar', { order_id: orderId })
