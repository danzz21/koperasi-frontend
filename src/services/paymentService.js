import api from '@/lib/api'

export const getPaymentHistory = () => api.get('/anggota/payment/riwayat')
  .then(response => response.data?.data ?? [])
export const getPaymentStatus = orderId => api.get(`/anggota/payment/status/${orderId}`)
  .then(response => response.data?.data)
export const simulatePayment = orderId => api.post('/anggota/payment/simulasi-bayar', { order_id: orderId })
export const createSavingsPayment = payload => api.post('/anggota/payment/proses-simpanan', payload)
export const createInstallmentPayment = payload => api.post('/anggota/payment/proses-cicilan', payload)
