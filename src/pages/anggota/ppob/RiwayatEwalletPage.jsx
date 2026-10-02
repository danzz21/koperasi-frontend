import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, PlusCircle, Wallet } from 'lucide-react'
import api from '@/lib/api'
import EwalletTransactions from '@/components/anggota/EwalletTransactions'

const fmt = (n) => `Rp ${new Intl.NumberFormat('id-ID').format(Number(n) || 0)}`

const FILTER = [
  { value: 'all', label: 'Semua' },
  { value: 'topup', label: 'Topup' },
  { value: 'bayar', label: 'Pembayaran' },
]

/**
 * Riwayat lengkap mutasi E-Wallet Cooperation.
 * Diakses dari kartu saldo di halaman PPOB dan menu E-Wallet.
 */
export default function RiwayatEwalletPage() {
  const [filter, setFilter] = useState('all')

  // Saldo diambil dari query yang sama dengan halaman E-Wallet (cache React Query)
  const { data: summary } = useQuery({
    queryKey: ['anggota-ewallet'],
    queryFn: () => api.get('/anggota/ewallet').then(res => res.data?.data ?? {}),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['anggota-ewallet-riwayat'],
    queryFn: () => api.get('/anggota/ewallet/riwayat').then(res => res.data?.data ?? []),
  })

  const transaksi = (data ?? []).filter(item => filter === 'all' || item.tipe === filter)

  return (
    <div className="min-h-screen bg-emerald-50/40" style={{ paddingBottom: '90px' }}>
      <header className="member-profile-header">
        <div className="member-profile-top">
          <Link to="/anggota/ewallet" className="rounded-full bg-white/20 p-2 hover:bg-white/30" aria-label="Kembali">
            <ArrowLeft size={19} />
          </Link>
          <h1>Riwayat E-Wallet</h1>
          <span className="w-[35px]" />
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Wallet className="h-6 w-6" />
          </div>
          <p className="text-xs opacity-90">Saldo saat ini</p>
          <p className="text-2xl font-black">{isLoading ? '...' : fmt(summary?.saldo)}</p>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="mb-4 flex gap-2">
          {FILTER.map(item => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`flex-1 rounded-xl border-2 py-2 text-xs font-bold transition ${
                filter === item.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-100 bg-white text-gray-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <EwalletTransactions
          transactions={transaksi}
          loading={isLoading}
          emptyText={filter === 'all' ? 'Belum ada mutasi E-Wallet.' : 'Tidak ada mutasi pada filter ini.'}
        />

        <Link
          to="/anggota/ewallet"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 py-3 font-bold text-white shadow-lg"
        >
          <PlusCircle className="h-4 w-4" /> Top Up Saldo
        </Link>
      </div>
    </div>
  )
}
