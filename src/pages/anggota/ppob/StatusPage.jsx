import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, Clock3, LoaderCircle, XCircle } from 'lucide-react'
import api from '@/lib/api'

export default function StatusPage() {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const [processing, setProcessing] = useState(false)
  const { data: statusData, isLoading, isError, refetch } = useQuery({
    queryKey: ['ppob-status', orderId],
    queryFn: () => api.get(`/anggota/ppob/status/${orderId}`).then(response => response.data?.data || response.data),
  })
  const payment = statusData?.payment || statusData
  const transaction = statusData?.transaksi
  const status = payment?.status
  const simulatePayment = async () => {
    setProcessing(true)
    try {
      await api.post('/anggota/ppob/simulasi-bayar', { order_id: orderId })
      await refetch()
    } finally {
      setProcessing(false)
    }
  }
  const StatusIcon = status === 'success' || status === 'paid' ? CheckCircle2 : status === 'failed' ? XCircle : Clock3
  const statusColor = status === 'success' || status === 'paid' ? 'text-emerald-500' : status === 'failed' ? 'text-red-500' : 'text-amber-500'

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: '90px' }}>
      <header className="bg-gradient-to-br from-emerald-500 to-cyan-600 text-white rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 px-4 py-4"><button type="button" onClick={() => navigate('/anggota/ppob')} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center" aria-label="Kembali"><ArrowLeft size={19} /></button><h1 className="font-bold">Status Pembayaran PPOB</h1></div>
      </header>
      <div className="px-4 py-8 text-center">
        {isLoading && <p className="text-gray-500">Memuat status...</p>}
        {isError && <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">Status transaksi belum dapat dimuat.</div>}
        {!isLoading && !isError && <><StatusIcon size={64} className={`mx-auto ${statusColor}`} /><h2 className="mt-4 text-xl font-extrabold text-gray-900">{status === 'success' || status === 'paid' ? 'Pembayaran Berhasil' : status === 'failed' ? 'Pembayaran Gagal' : 'Menunggu Pembayaran'}</h2><p className="mt-2 text-sm text-gray-500">Order ID: {orderId}</p><div className="mt-5 rounded-2xl bg-white p-4 text-left shadow-sm"><div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-sm text-gray-500">Produk</span><b className="text-sm">{transaction?.nama_produk || payment?.keterangan || 'PPOB'}</b></div><div className="flex justify-between pt-3"><span className="text-sm text-gray-500">Total</span><b className="text-sm">Rp {Number(payment?.total_bayar || payment?.nominal || 0).toLocaleString('id-ID')}</b></div></div>{status === 'pending' && <button type="button" onClick={simulatePayment} disabled={processing} className="mt-5 w-full rounded-2xl bg-emerald-600 py-3 font-bold text-white disabled:opacity-50">{processing ? <span className="flex justify-center gap-2"><LoaderCircle className="animate-spin" size={18} /> Memproses...</span> : 'Simulasikan Pembayaran'}</button>}</>}
        <button type="button" onClick={() => navigate('/anggota/ppob')} className="mt-3 w-full rounded-2xl border border-gray-200 bg-white py-3 font-bold text-gray-700">Kembali ke PPOB</button>
      </div>
    </div>
  )
}
