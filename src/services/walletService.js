import api from '@/lib/api'

export const getWallet = () => api.get('/anggota/ewallet').then(response => response.data?.data ?? {})
export const topUpWallet = payload => api.post('/anggota/ewallet/topup', payload)
export const transferToWallet = payload => api.post('/anggota/ewallet/pindah', payload)
export const uploadWalletProof = (id, file) => {
  const payload = new FormData()
  payload.append('id', id)
  payload.append('bukti', file)

  return api.post('/anggota/ewallet/bukti', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export const getWalletHistory = () => api.get('/anggota/ewallet/riwayat')
  .then(response => response.data?.data ?? [])
