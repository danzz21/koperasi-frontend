import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '@/lib/api'

const labels = {
  pokok: 'Simpanan Pokok',
  wajib: 'Simpanan Wajib',
  sukarela: 'Simpanan Sukarela',
}

export default function SimpananPage() {
  const navigate = useNavigate()
  const { jenis = 'wajib' } = useParams()
  const [nominal, setNominal] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('qris')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const { data } = await api.post('/anggota/payment/proses-simpanan', {
        nominal: Number(nominal),
        payment_method: paymentMethod,
        jenis,
      })
      navigate(`/anggota/payment/status/${data.order_id}`)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Pengajuan simpanan gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="p-6 space-y-4">
      <button type="button" onClick={() => navigate(-1)} className="text-emerald-600 font-semibold">
        <i className="fas fa-arrow-left mr-2"></i>Kembali
      </button>
      <h1 className="font-bold text-xl">{labels[jenis] || 'Setor Simpanan'}</h1>
      <label className="block text-sm font-semibold text-gray-700">
        Nominal
        <input
          required min="5000" step="1000" type="number" value={nominal}
          onChange={event => setNominal(event.target.value)}
          className="mt-1 w-full rounded-xl border border-gray-200 p-3"
        />
      </label>
      <label className="block text-sm font-semibold text-gray-700">
        Metode Pembayaran
        <select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 p-3">
          <option value="qris">QRIS</option>
          <option value="transfer">Transfer Bank</option>
        </select>
      </label>
      {message && <p className="text-sm text-red-600">{message}</p>}
      <button disabled={loading} className="w-full rounded-xl bg-emerald-600 p-3 font-bold text-white disabled:opacity-50">
        {loading ? 'Memproses...' : 'Lanjutkan Pembayaran'}
      </button>
    </form>
  )
}
