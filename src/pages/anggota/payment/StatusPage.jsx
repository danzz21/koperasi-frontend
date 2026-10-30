import { useNavigate, useParams } from 'react-router-dom'
import { usePaymentStatus, useSimulatePayment } from '@/hooks/usePaymentData'

export default function StatusPage() {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const { data: payment, refetch } = usePaymentStatus(orderId)
  const simulation = useSimulatePayment({ onSuccess: () => refetch() })

  const simulatePayment = () => simulation.mutate(orderId)

  return (
    <div className="p-6 space-y-4 text-center">
      <i className={`fas ${payment?.status === 'paid' ? 'fa-circle-check text-emerald-500' : 'fa-clock text-amber-500'} text-5xl`}></i>
      <h1 className="font-bold text-xl">Status Pembayaran</h1>
      <p className="text-gray-600">{payment?.status || 'Memuat...'}</p>
      {payment?.status === 'pending' && (
        <button onClick={simulatePayment} disabled={simulation.isPending} className="w-full rounded-xl bg-emerald-600 p-3 font-bold text-white">
          {simulation.isPending ? 'Memproses...' : 'Simulasikan Pembayaran'}
        </button>
      )}
      <button onClick={() => navigate('/anggota/dashboard')} className="w-full rounded-xl border p-3 font-semibold">
        Kembali ke Dashboard
      </button>
    </div>
  )
}
