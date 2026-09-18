import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { PiggyBank, ArrowRight, TrendingUp } from 'lucide-react'
import MemberHeader from '@/components/anggota/MemberHeader'

const tabs = [
  { id: 'pokok', label: 'Pokok', icon: 'fa-landmark' },
  { id: 'wajib', label: 'Wajib', icon: 'fa-calendar-check' },
  { id: 'sukarela', label: 'Sukarela', icon: 'fa-hand-holding-heart' }
]

export default function SimpananPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pokok')

  const { data: simpanan = {}, isLoading } = useQuery({
    queryKey: ['anggota-simpanan'],
    queryFn: () => api.get('/anggota/simpanan').then(r => r.data?.data || {}),
  })

  const tabData = {
    pokok: {
      title: 'Simpanan Pokok',
      amount: simpanan.sim_pokok || 0,
      icon: 'fa-landmark',
      description: 'Simpanan wajib saat menjadi anggota koperasi',
      details: [
        { label: 'Total Simpanan', value: `Rp ${new Intl.NumberFormat('id-ID').format(simpanan.sim_pokok || 0)}` },
        { label: 'Tanggal Pembukaan', value: simpanan.tgl_sim_pokok || '-' },
        { label: 'Status', value: 'Aktif', color: 'text-emerald-600' }
      ]
    },
    wajib: {
      title: 'Simpanan Wajib',
      amount: simpanan.sim_wajib || 0,
      icon: 'fa-calendar-check',
      description: 'Simpanan wajib setiap bulan untuk semua anggota',
      details: [
        { label: 'Total Simpanan', value: `Rp ${new Intl.NumberFormat('id-ID').format(simpanan.sim_wajib || 0)}` },
        { label: 'Target Bulanan', value: `Rp ${new Intl.NumberFormat('id-ID').format(simpanan.target_wajib || 0)}` },
        { label: 'Tercapai Bulan Ini', value: `${Math.round((simpanan.sim_wajib / (simpanan.target_wajib || 1)) * 100)}%`, color: 'text-cyan-600' }
      ]
    },
    sukarela: {
      title: 'Simpanan Sukarela',
      amount: simpanan.sim_sukarela || 0,
      icon: 'fa-hand-holding-heart',
      description: 'Simpanan yang dapat diambil kapan saja sesuai keinginan',
      details: [
        { label: 'Total Simpanan', value: `Rp ${new Intl.NumberFormat('id-ID').format(simpanan.sim_sukarela || 0)}` },
        { label: 'Bunga Bulanan', value: `${simpanan.bunga_sukarela || 0}%` },
        { label: 'Dapat Diambil', value: 'Ya', color: 'text-emerald-600' }
      ]
    }
  }

  const current = tabData[activeTab]

  if (isLoading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: '90px' }}>

      {/* Header */}
      <MemberHeader title="Simpanan" icon={PiggyBank} />

      {/* Tab Navigation */}
      <div className="px-4 py-3 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              <i className={`fas ${tab.icon} mr-2`} aria-hidden="true"></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Current Tab Content */}
        <div className="space-y-3">
          {/* Main Amount Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-5 text-white shadow-lg">
            <div className="text-sm opacity-90 mb-2 flex items-center gap-2">
              <i className={`fas ${current.icon} text-2xl`} aria-hidden="true"></i>
              {current.title}
            </div>
            <div className="text-3xl font-bold mb-2">
              Rp {new Intl.NumberFormat('id-ID').format(current.amount)}
            </div>
            <p className="text-sm opacity-80">{current.description}</p>
          </div>

          {/* Info Cards */}
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            {current.details.map((detail, idx) => (
              <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <span className="text-sm text-gray-600">{detail.label}</span>
                <span className={`font-semibold ${detail.color || 'text-gray-900'}`}>
                  {detail.value}
                </span>
              </div>
            ))}
          </div>

          {/* Action Card */}
          <button
            onClick={() => navigate(`/anggota/payment/simpanan/${activeTab}`)}
            className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border-l-4 border-emerald-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Ingin Menambah Simpanan?</p>
                <p className="text-xs text-gray-500 mt-1">Setor simpanan melalui aplikasi ini</p>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-600" />
            </div>
          </button>

          {/* Benefits */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Keuntungan
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                Mendapat bunga setiap bulan
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                Aman dan terjamin
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                Flexible sesuai kebutuhan
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  )
}
