import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { HandCoins, AlertCircle } from 'lucide-react'
import MemberHeader from '@/components/anggota/MemberHeader'

const filters = [
  { id: 'semua', label: 'Semua', icon: 'fa-list' },
  { id: 'alqordh', label: 'Al-Qordh', icon: 'fa-handshake' },
  { id: 'murabahah', label: 'Murabahah', icon: 'fa-file-invoice-dollar' },
  { id: 'mudharabah', label: 'Mudharabah', icon: 'fa-chart-line' }
]

const filterTypes = {
  alqordh: 'qard',
  murabahah: 'murabahah',
  mudharabah: 'mudharabah',
}

const getStatusColor = (status) => {
  const colors = {
    aktif: 'bg-emerald-100 text-emerald-700',
    lunas: 'bg-gray-100 text-gray-700',
    ditolak: 'bg-red-100 text-red-700',
  }
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700'
}

export default function PinjamanPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('semua')

  const { data: pinjaman = [], isLoading, isError } = useQuery({
    queryKey: ['anggota-pinjaman'],
    queryFn: () => api.get('/anggota/pinjaman').then(r => r.data?.data || []),
  })

  const filteredPinjaman = activeFilter === 'semua'
    ? pinjaman
    : pinjaman.filter(p => p.tipe?.toLowerCase() === filterTypes[activeFilter])

  if (isLoading) return <div className="p-6 text-center text-emerald-700">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: '90px' }}>

      {/* Header */}
      <MemberHeader title="Pinjaman" icon={HandCoins} />

      {/* Filter Tabs */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeFilter === f.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              <i className={`fas ${f.icon} mr-1`} aria-hidden="true"></i>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-2 space-y-3">

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
            Data pinjaman belum dapat dimuat. Pastikan MySQL di Laragon sudah menyala, lalu refresh halaman.
          </div>
        )}

        {/* Info Banner */}
        {pinjaman.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-900">Total Pinjaman Aktif</p>
              <p className="text-emerald-700">
                Rp {new Intl.NumberFormat('id-ID').format(
                  pinjaman.reduce((sum, p) => sum + (p.sisa_pinjaman || 0), 0)
                )}
              </p>
            </div>
          </div>
        )}

        {/* Pinjaman Cards */}
        {filteredPinjaman.length > 0 ? (
          <div className="space-y-2 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory' }}>
            {filteredPinjaman.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-full"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.tipe || 'Pinjaman'}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {item.id_pinjaman || '-'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(item.status)}`}>
                    {item.status || 'Aktif'}
                  </span>
                </div>

                {/* Amount */}
                <div className="mb-3">
                  <p className="text-2xl font-bold text-gray-900">
                    Rp {new Intl.NumberFormat('id-ID').format(item.nominal || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Nominal Pinjaman</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Sisa Pinjaman</p>
                    <p className="text-sm font-bold text-gray-900">
                      Rp {new Intl.NumberFormat('id-ID').format(item.sisa_pinjaman || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Angsuran Bulanan</p>
                    <p className="text-sm font-bold text-gray-900">
                      Rp {new Intl.NumberFormat('id-ID').format(item.angsuran || 0)}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-gray-700">Progres Pelunasan</span>
                    <span className="text-xs font-bold text-emerald-600">
                      {Math.round(((item.nominal - (item.sisa_pinjaman || 0)) / (item.nominal || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{
                        width: `${Math.round(((item.nominal - (item.sisa_pinjaman || 0)) / (item.nominal || 1)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-emerald-700">
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <HandCoins className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">Tidak ada pinjaman</p>
          </div>
        )}

      </div>

    </div>
  )
}
