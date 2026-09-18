import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export default function RiwayatPage() {
  const navigate = useNavigate()
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => api.get('/anggota/payment/riwayat').then(response => response.data?.data || []),
  })

  return (
    <div className="p-6 space-y-4">
      <button onClick={() => navigate(-1)} className="text-emerald-600 font-semibold">
        <i className="fas fa-arrow-left mr-2"></i>Kembali
      </button>
      <h1 className="font-bold text-xl">Riwayat Pembayaran</h1>
      {isLoading && <p>Memuat...</p>}
      {!isLoading && payments.length === 0 && <p className="text-gray-500">Belum ada transaksi pembayaran.</p>}
      {payments.map(payment => (
        <div key={payment.order_id} className="rounded-xl bg-white p-4 shadow-sm">
          <p className="font-semibold">{payment.jenis_pembayaran}</p>
          <p>Rp {Number(payment.total_bayar).toLocaleString('id-ID')}</p>
          <p className="text-sm text-gray-500">{payment.status}</p>
        </div>
      ))}
    </div>
  )
}
