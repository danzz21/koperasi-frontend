import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Bolt, History, Receipt, Smartphone, Wallet, Wifi } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'

const filters = [
  ['semua', 'Semua'],
  ['pulsa', 'Pulsa'],
  ['paket_data', 'Paket Data'],
  ['token_listrik', 'Token Listrik'],
  ['ewallet', 'E-Wallet'],
]
const icons = { pulsa: Smartphone, paket_data: Wifi, token_listrik: Bolt, ewallet: Wallet }
const colors = { pulsa: 'from-emerald-500 to-teal-600', paket_data: 'from-blue-500 to-indigo-600', token_listrik: 'from-amber-500 to-orange-600', ewallet: 'from-purple-500 to-violet-600' }

export default function RiwayatPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('semua')
  const { data: history = [], isLoading, isError } = useQuery({
    queryKey: ['ppob-history'],
    queryFn: () => api.get('/anggota/ppob/riwayat').then(response => response.data?.data || []),
  })
  const visible = filter === 'semua' ? history : history.filter(item => item.jenis_produk === filter)

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: '90px' }}>
      <header className="bg-gradient-to-br from-emerald-500 to-cyan-600 text-white rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 px-4 py-4">
          <button type="button" onClick={() => navigate('/anggota/ppob')} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center" aria-label="Kembali"><ArrowLeft size={19} /></button>
          <div><h1 className="font-bold">Riwayat Transaksi PPOB</h1><p className="text-xs text-white/80">{history.length} transaksi</p></div>
          <History className="ml-auto" size={21} />
        </div>
      </header>
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map(([id, label]) => <button key={id} type="button" onClick={() => setFilter(id)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${filter === id ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{label}</button>)}
        </div>
        {isError && <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">Riwayat PPOB belum dapat dimuat.</div>}
        {isLoading && <div className="py-12 text-center text-gray-500">Memuat transaksi...</div>}
        {!isLoading && !isError && visible.length === 0 && <div className="py-16 text-center text-gray-400"><Receipt size={48} className="mx-auto mb-3 opacity-30" /><p className="font-bold">Belum ada transaksi PPOB</p><p className="text-sm mt-1">Yuk mulai transaksi pertamamu!</p></div>}
        <div className="space-y-2">
          {visible.map(item => {
            const Icon = icons[item.jenis_produk] || Receipt
            const status = item.status || 'pending'
            return <div key={item.id_transaksi || item.order_id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm border border-gray-100">
              <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${colors[item.jenis_produk] || 'from-slate-500 to-slate-600'} text-white flex items-center justify-center`}><Icon size={19} /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-gray-800">{item.nama_produk || item.jenis_produk}</p><p className="text-xs text-gray-500">{item.nomor_tujuan || '-'} · {item.provider || '-'}</p><span className={`badge mt-1 ${status === 'success' || status === 'paid' ? 'badge-success' : status === 'failed' ? 'badge-failed' : 'badge-pending'}`}>{status}</span></div>
              <div className="shrink-0 text-right"><p className="text-sm font-extrabold">Rp {Number(item.harga || item.total_bayar || 0).toLocaleString('id-ID')}</p><p className="text-xs text-gray-400">{item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}</p></div>
            </div>
          })}
        </div>
      </div>
    </div>
  )
}
