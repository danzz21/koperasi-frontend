import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export default function StatusPage() {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [processing, setProcessing] = useState(false)
  const { data: payment, refetch } = useQuery({
    queryKey: ['payment-status', orderId],
    queryFn: () => api.get(`/anggota/payment/status/${orderId}`).then(response => response.data?.data),
  })

  const simulatePayment = async () => {
    setProcessing(true)
    await api.post('/anggota/payment/simulasi-bayar', { order_id: orderId })
    await refetch()
    setProcessing(false)
  }

  return (
    <div className="p-6 space-y-4 text-center">
      <i className={`fas ${payment?.status === 'paid' ? 'fa-circle-check text-emerald-500' : 'fa-clock text-amber-500'} text-5xl`}></i>
      <h1 className="font-bold text-xl">Status Pembayaran</h1>
      <p className="text-gray-600">{payment?.status || 'Memuat...'}</p>
      {payment?.status === 'pending' && (
        <button onClick={simulatePayment} disabled={processing} className="w-full rounded-xl bg-emerald-600 p-3 font-bold text-white">
          {processing ? 'Memproses...' : 'Simulasikan Pembayaran'}
        </button>
      )}
      <button onClick={() => navigate('/anggota/dashboard')} className="w-full rounded-xl border p-3 font-semibold">
        Kembali ke Dashboard
      </button>
    </div>
  )
}
