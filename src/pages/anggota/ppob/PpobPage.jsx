import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import useAuthStore from '@/store/authStore'

const menuLayanan = [
  { to: '/anggota/ppob/pulsa',   icon: 'fa-sim-card',          label: 'Isi Pulsa',     cls: 'from-emerald-500 to-teal-600'    },
  { to: '/anggota/ppob/data',    icon: 'fa-wifi',              label: 'Paket Data',    cls: 'from-blue-500 to-indigo-600'     },
  { to: '/anggota/ppob/listrik', icon: 'fa-bolt',              label: 'Token Listrik', cls: 'from-amber-500 to-orange-600'    },
  { to: '/anggota/ppob/ewallet', icon: 'fa-wallet',            label: 'Top Up E-Wallet',cls: 'from-purple-500 to-violet-600'  },
]

const menuPembayaran = [
  { to: '/anggota/payment/simpanan/wajib', icon: 'fa-piggy-bank',         label: 'Simpanan Wajib',  cls: 'from-emerald-500 to-teal-600'   },
  { to: '/anggota/payment/simpanan/sukarela', icon: 'fa-hand-holding-heart', label: 'Sim. Sukarela',  cls: 'from-cyan-500 to-blue-600'    },
  { to: '/anggota/cicilan',                         icon: 'fa-file-invoice-dollar', label: 'Bayar Cicilan',  cls: 'from-amber-500 to-orange-600'  },
  { to: '/anggota/payment/riwayat',                 icon: 'fa-receipt',            label: 'Riwayat Bayar',  cls: 'from-slate-500 to-slate-600'    },
]

const statusConfig = {
  success: { cls: 'badge-success', label: 'Berhasil' },
  pending: { cls: 'badge-pending', label: 'Pending'  },
  failed:  { cls: 'badge-failed',  label: 'Gagal'    },
}

const jenisIcon = {
  pulsa:         'fa-sim-card',
  paket_data:    'fa-wifi',
  token_listrik: 'fa-bolt',
  ewallet:       'fa-wallet',
}

export default function PpobPage() {
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['ppob-index'],
    queryFn: () => api.get('/anggota/ppob').then(r => r.data),
  })

  return (
    <div>
      {/* Header */}
      <div className="header-mobile px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/anggota/dashboard" className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <i className="fas fa-arrow-left"></i>
            </Link>
            <div>
              <p className="font-bold text-base">PPOB & Layanan Digital</p>
              <p className="text-white/70 text-xs">Pulsa · Data · Listrik · E-Wallet</p>
            </div>
          </div>
          <Link to="/anggota/ppob/riwayat" className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <i className="fas fa-history"></i>
          </Link>
        </div>
      </div>

      {/* Balance Card */}
      <div className="mx-4 mt-4 p-5 rounded-3xl text-white relative overflow-hidden shadow-xl"
           style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full"></div>
        <div className="relative z-10">
          <p className="text-white/60 text-xs mb-1">Total Transaksi Bulan Ini</p>
          <p className="text-2xl font-black">
            Rp {(data?.total_bulan ?? 0).toLocaleString('id-ID')}
          </p>
          <p className="text-white/50 text-xs mt-1">{new Date().toLocaleDateString('id-ID',{month:'long',year:'numeric'})} · {user?.nama ?? ''}</p>
        </div>
        <span className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
          <i className="fas fa-lock mr-1" aria-hidden="true"></i> SIMULASI
        </span>
      </div>

      {/* Menu Layanan */}
      <div className="mx-4 mt-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Layanan PPOB</p>
        <div className="grid grid-cols-4 gap-3">
          {menuLayanan.map(item => (
            <Link key={item.to} to={item.to}
                  className="flex flex-col items-center gap-2 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.cls} flex items-center justify-center text-white text-xl`}>
                <i className={`fas ${item.icon}`}></i>
              </div>
              <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Banner Simulasi */}
      <div className="mx-4 mt-4 rounded-2xl p-4 text-white flex items-center gap-3"
           style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
        <i className="fas fa-bullhorn text-2xl" aria-hidden="true"></i>
        <div>
          <p className="font-bold text-sm">Mode Simulasi Aktif</p>
          <p className="text-xs opacity-85">Semua transaksi adalah simulasi demo. Payment gateway belum terhubung.</p>
        </div>
      </div>

      {/* Menu Pembayaran Koperasi */}
      <div className="mx-4 mt-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pembayaran Koperasi</p>
        <div className="grid grid-cols-4 gap-3">
          {menuPembayaran.map(item => (
            <Link key={item.to} to={item.to}
                  className="flex flex-col items-center gap-2 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 active:scale-95 transition-transform">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.cls} flex items-center justify-center text-white text-xl`}>
                <i className={`fas ${item.icon}`}></i>
              </div>
              <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Riwayat Terbaru */}
      <div className="mx-4 mt-5 mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Transaksi Terbaru</p>

        {isLoading ? (
          <div className="flex justify-center py-6"><div className="spinner"></div></div>
        ) : data?.riwayat?.length ? (
          <div className="space-y-2">
            {data.riwayat.map(r => (
              <div key={r.id_transaksi} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 bg-gradient-to-br ${
                  r.jenis_produk === 'pulsa' ? 'from-emerald-500 to-teal-600'
                  : r.jenis_produk === 'paket_data' ? 'from-blue-500 to-indigo-600'
                  : r.jenis_produk === 'token_listrik' ? 'from-amber-500 to-orange-600'
                  : 'from-purple-500 to-violet-600'
                }`}>
                  <i className={`fas ${jenisIcon[r.jenis_produk] ?? 'fa-receipt'} text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{r.nama_produk}</p>
                  <p className="text-xs text-gray-500">{r.nomor_tujuan}</p>
                  <span className={`badge ${statusConfig[r.status]?.cls ?? 'badge-pending'} mt-0.5`}>
                    {statusConfig[r.status]?.label ?? r.status}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-800">Rp {r.harga.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            ))}
            <Link to="/anggota/ppob/riwayat" className="block text-center text-sm font-bold text-emerald-600 py-2">
              Lihat Semua Riwayat →
            </Link>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <i className="fas fa-receipt text-3xl opacity-20 block mb-2"></i>
            <p className="text-sm font-semibold">Belum ada transaksi</p>
          </div>
        )}
      </div>
    </div>
  )
}
