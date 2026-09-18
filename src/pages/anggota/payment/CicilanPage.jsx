import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export default function CicilanPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [paymentMethod, setPaymentMethod] = useState('qris')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { data: cicilan = [] } = useQuery({
    queryKey: ['anggota-cicilan-payment'],
    queryFn: () => api.get('/anggota/cicilan').then(response => response.data?.data || []),
  })
  const item = cicilan.find(row => String(row.id) === String(id))

  const submit = async event => {
    event.preventDefault()
    if (!item) return
    setLoading(true)
    setMessage('')
    try {
      const { data } = await api.post('/anggota/payment/proses-cicilan', {
        id: item.id,
        nominal: Number(item.nominal),
        payment_method: paymentMethod,
      })
      navigate(`/anggota/payment/status/${data.order_id}`)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Pembayaran cicilan gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="p-6 space-y-4">
      <button type="button" onClick={() => navigate(-1)} className="text-indigo-600 font-semibold">
        <i className="fas fa-arrow-left mr-2"></i>Kembali
      </button>
      <h1 className="font-bold text-xl">Bayar Cicilan</h1>
      {!item && <p className="text-gray-500">Memuat data cicilan...</p>}
      {item && (
        <>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Cicilan ke-{item.cicilan_ke}</p>
            <p className="mt-1 text-2xl font-bold">Rp {Number(item.nominal).toLocaleString('id-ID')}</p>
          </div>
          <select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)} className="w-full rounded-xl border border-gray-200 p-3">
            <option value="qris">QRIS</option>
            <option value="transfer">Transfer Bank</option>
          </select>
          {message && <p className="text-sm text-red-600">{message}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-indigo-600 p-3 font-bold text-white disabled:opacity-50">
            {loading ? 'Memproses...' : 'Lanjutkan Pembayaran'}
          </button>
        </>
      )}
    </form>
  )
}
