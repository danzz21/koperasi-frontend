import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import MemberHeader from '@/components/anggota/MemberHeader'

const getStatusBadge = (status) => {
  const badges = {
    terbayar: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'fa-circle-check', label: 'Terbayar' },
    belumbayar: { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'fa-clock', label: 'Belum Bayar' },
    denda: { bg: 'bg-red-100', text: 'text-red-700', icon: 'fa-circle-xmark', label: 'Denda' },
  }
  return badges[status?.toLowerCase()] || badges.belumbayar
}

export default function CicilanPage() {
  const navigate = useNavigate()
  const { data: cicilan = [], isLoading } = useQuery({
    queryKey: ['anggota-cicilan'],
    queryFn: () => api.get('/anggota/cicilan').then(r => r.data?.data || []),
  })

  const stats = {
    terbayar: cicilan.filter(c => c.status === 'terbayar').length,
    belumbayar: cicilan.filter(c => c.status === 'belumbayar').length,
    totalCicilan: cicilan.length,
  }

  if (isLoading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: '90px' }}>

      {/* Header */}
      <MemberHeader title="Riwayat Cicilan" icon={Calendar} />

      {/* Stats */}
      <div className="px-4 py-4 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-2xl font-bold text-indigo-600">{stats.terbayar}</p>
          <p className="text-xs text-gray-600 mt-1">Terbayar</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.belumbayar}</p>
          <p className="text-xs text-gray-600 mt-1">Belum Bayar</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.totalCicilan}</p>
          <p className="text-xs text-gray-600 mt-1">Total</p>
        </div>
      </div>

      {/* Info Banner */}
      {cicilan.some(c => c.status === 'belumbayar') && (
        <div className="px-4 py-2">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Ada cicilan yang belum dibayar</p>
              <p className="text-amber-700 text-xs mt-1">
                Total: Rp {new Intl.NumberFormat('id-ID').format(
                  cicilan
                    .filter(c => c.status === 'belumbayar')
                    .reduce((sum, c) => sum + (c.nominal || 0), 0)
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cicilan List */}
      <div className="px-4 py-3 space-y-2">
        {cicilan.length > 0 ? (
          cicilan.map((item, idx) => {
            const badge = getStatusBadge(item.status)
            return (
              <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{item.tipe_pinjaman || 'Cicilan'}</p>
                    <p className="text-xs text-gray-500 mt-1">Cicilan ke: {item.cicilan_ke || '-'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${badge.bg} ${badge.text}`}>
                    <i className={`fas ${badge.icon} mr-1`} aria-hidden="true"></i>
                    {badge.label}
                  </span>
                </div>

                {/* Amount */}
                <div className="mb-3 pb-3 border-b border-gray-100">
                  <p className="text-xs text-gray-600 mb-1">Nominal Cicilan</p>
                  <p className="text-xl font-bold text-gray-900">
                    Rp {new Intl.NumberFormat('id-ID').format(item.nominal || 0)}
                  </p>
                </div>

                {/* Date & Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Jatuh Tempo</p>
                    <p className="font-semibold text-gray-900">{item.tgl_tempo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Tanggal Bayar</p>
                    <p className="font-semibold text-gray-900">{item.tgl_bayar || 'Belum dibayar'}</p>
                  </div>
                </div>

                {/* Action */}
                {item.status === 'belumbayar' && (
                  <button
                    onClick={() => navigate(`/anggota/payment/cicilan/${item.tipe_pinjaman || 'qard'}/${item.id}`)}
                    className="w-full mt-3 bg-indigo-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700"
                  >
                    Bayar Cicilan
                  </button>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">Tidak ada cicilan</p>
          </div>
        )}
      </div>

    </div>
  )
}
