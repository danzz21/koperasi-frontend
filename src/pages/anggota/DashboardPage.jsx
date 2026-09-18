import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Wallet, HandCoins, Home, Zap, PiggyBank, Receipt, Gift, Handshake, FileText, TrendingUp, Smartphone, AlertCircle } from 'lucide-react'
import MemberHeader from '@/components/anggota/MemberHeader'

export default function DashboardPage() {
  const navigate = useNavigate()
  // Fetch dashboard data
  const { data: dashboard = {}, isLoading } = useQuery({
    queryKey: ['anggota-dashboard'],
    queryFn: () => api.get('/anggota/dashboard').then(r => r.data?.data || {}),
  })

  const menuItems = [
    { label: 'Sim. Pokok', icon: Home, color: '#10b981', path: '/anggota/simpanan' },
    { label: 'Sim. Wajib', icon: Receipt, color: '#06b6d4', path: '/anggota/simpanan' },
    { label: 'Sim. Sukarela', icon: Gift, color: '#8b5cf6', path: '/anggota/simpanan' },
    { label: 'Al-Qordh', icon: Handshake, color: '#f59e0b', path: '/anggota/pinjaman' },
    { label: 'Murobahah', icon: FileText, color: '#ef4444', path: '/anggota/pinjaman' },
    { label: 'Mudhorobah', icon: TrendingUp, color: '#3b82f6', path: '/anggota/pinjaman' },
  ]

  const digitalServices = [
    { label: 'PPOB', icon: AlertCircle, color: '#8b5cf6', path: '/anggota/ppob' },
    { label: 'Isi Pulsa', icon: Smartphone, color: '#10b981', path: '/anggota/ppob' },
    { label: 'Token PLN', icon: Zap, color: '#f59e0b', path: '/anggota/ppob' },
    { label: 'E-Wallet', icon: Wallet, color: '#3b82f6', path: '/anggota/ppob' },
    { label: 'Bayar Wajib', icon: PiggyBank, color: '#10b981', path: '/anggota/cicilan' },
    { label: 'Riwayat Bayar', icon: Receipt, color: '#64748b', path: '/anggota/cicilan' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const totalSimpanan = dashboard.total_saldo || 0
  const totalPinjaman = dashboard.total_pinjaman || 0
  const simPokok = dashboard.sim_pokok || 0
  const simWajib = dashboard.sim_wajib || 0
  const simSukarela = dashboard.sim_sukarela || 0

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: '90px' }}>

      {/* Header Profil */}
      <MemberHeader notification />

      {/* Summary Cards */}
      <div className="p-4 space-y-3">

        {/* Card Simpanan */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-bold opacity-90 flex items-center gap-2">
                <Wallet className="w-4 h-4" /> TOTAL SIMPANAN
              </p>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-3">Rp {new Intl.NumberFormat('id-ID').format(totalSimpanan)}</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white/15 rounded-lg p-2">
              <div className="opacity-80">Pokok</div>
              <div className="font-bold">Rp {new Intl.NumberFormat('id-ID').format(simPokok)}</div>
            </div>
            <div className="bg-white/15 rounded-lg p-2">
              <div className="opacity-80">Wajib</div>
              <div className="font-bold">Rp {new Intl.NumberFormat('id-ID').format(simWajib)}</div>
            </div>
            <div className="bg-white/15 rounded-lg p-2">
              <div className="opacity-80">Sukarela</div>
              <div className="font-bold">Rp {new Intl.NumberFormat('id-ID').format(simSukarela)}</div>
            </div>
          </div>
        </div>

        {/* Card Pinjaman */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-700 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-bold opacity-90 flex items-center gap-2">
                <HandCoins className="w-4 h-4" /> TOTAL PINJAMAN
              </p>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold">Rp {new Intl.NumberFormat('id-ID').format(totalPinjaman)}</div>
          <div className="mt-3 p-2 bg-white/15 rounded-lg text-xs">
            <div className="opacity-80">Sisa Kewajiban</div>
            <div className="font-bold">Rp {new Intl.NumberFormat('id-ID').format(dashboard.sisa_kewajiban || 0)}</div>
          </div>
        </div>

      </div>

      {/* Layanan Simpanan & Pinjaman */}
      <div className="px-4 py-3">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <i className="fas fa-th text-emerald-600"></i> Layanan Koperasi
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition active:scale-95"
            >
              <div className="flex justify-center mb-2">
                <item.icon className="w-6 h-6" style={{ color: item.color }} />
              </div>
              <p className="text-xs font-bold text-gray-900">{item.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Layanan Digital */}
      <div className="px-4 py-2">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Layanan Digital & Pembayaran</h3>
        <div className="grid grid-cols-3 gap-3">
          {digitalServices.map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition active:scale-95"
            >
              <div className="flex justify-center mb-2">
                <item.icon className="w-6 h-6" style={{ color: item.color }} />
              </div>
              <p className="text-xs font-bold text-gray-900">{item.label}</p>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
