import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, HandCoins, LoaderCircle } from 'lucide-react'
import MemberHeader from '@/components/anggota/MemberHeader'
import { useLoanPage } from '@/hooks/useLoanPage'

const filters = [
  { id: 'semua', label: 'Semua', icon: 'fa-list' },
  { id: 'alqordh', label: 'Al-Qordh', icon: 'fa-handshake' },
  { id: 'murabahah', label: 'Murabahah', icon: 'fa-file-invoice-dollar' },
  { id: 'mudharabah', label: 'Mudharabah', icon: 'fa-chart-line' }
]

const getStatusColor = (status) => {
  const colors = {
    aktif: 'bg-emerald-100 text-emerald-700',
    disetujui: 'bg-sky-100 text-sky-700',
    lunas: 'bg-gray-100 text-gray-700',
    ditolak: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
    menunggu: 'bg-amber-100 text-amber-700',
  }
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700'
}

export default function PinjamanPage() {
  const navigate = useNavigate()
  const {
    activeFilter,
    setActiveFilter,
    tipe,
    setTipe,
    nominal,
    setNominal,
    tenor,
    setTenor,
    keterangan,
    setKeterangan,
    applicationError,
    applicationSuccess,
    isSubmitting,
    pinjaman: filteredPinjaman,
    isLoading,
    isError,
    submitApplication,
  } = useLoanPage()

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: '90px' }}>

      {/* Header */}
      <MemberHeader title="Pinjaman" icon={HandCoins} />

      <div className="px-4 pt-4">
        {applicationSuccess && (
          <div className="mb-3 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">{applicationSuccess.message}</p>
              <p className="mt-1 text-xs">
                Status pengajuan: <span className="font-bold">{applicationSuccess.data?.status || 'Menunggu persetujuan'}</span>
              </p>
              {applicationSuccess.data?.id_pengajuan && (
                <p className="mt-1 text-xs">ID pengajuan: {applicationSuccess.data.id_pengajuan}</p>
              )}
            </div>
          </div>
        )}
        {applicationError && (
          <div className="mb-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{applicationError}</span>
          </div>
        )}

        <form onSubmit={submitApplication} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
            <HandCoins className="h-5 w-5 text-emerald-600" />
            Ajukan Pinjaman
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Isi detail pengajuan. Pengajuan akan berstatus menunggu sampai ditinjau pengurus.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="pinjaman-tipe" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                Jenis Pinjaman
              </label>
              <select
                id="pinjaman-tipe"
                value={tipe}
                onChange={event => setTipe(event.target.value)}
                className="input-field"
                required
              >
                <option value="qard">Al-Qordh (Qard)</option>
                <option value="murabahah">Murabahah</option>
                <option value="mudharabah">Mudharabah</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pinjaman-nominal" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Nominal (Rp)
                </label>
                <input
                  id="pinjaman-nominal"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="60"
                  step="1"
                  value={nominal}
                  onChange={event => setNominal(event.target.value)}
                  placeholder="Contoh: 1000000"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label htmlFor="pinjaman-tenor" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Tenor (bulan)
                </label>
                <input
                  id="pinjaman-tenor"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={tenor}
                  onChange={event => setTenor(event.target.value)}
                  placeholder="Contoh: 12"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="pinjaman-keterangan" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                Keterangan <span className="font-normal normal-case tracking-normal">(opsional)</span>
              </label>
              <textarea
                id="pinjaman-keterangan"
                value={keterangan}
                onChange={event => setKeterangan(event.target.value)}
                rows="3"
                className="input-field resize-y"
                placeholder="Jelaskan tujuan pengajuan pinjaman"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Mengirim pengajuan...</>
              : 'Kirim Pengajuan'}
          </button>
        </form>
      </div>

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

        {isLoading && (
          <div className="py-8 text-center text-emerald-700">Memuat data pinjaman...</div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
            Data pinjaman belum dapat dimuat. Pastikan MySQL di Laragon sudah menyala, lalu refresh halaman.
          </div>
        )}

        {/* Info Banner */}
        {!isLoading && pinjaman.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-900">Total Pinjaman Aktif</p>
              <p className="text-emerald-700">
                Rp {new Intl.NumberFormat('id-ID').format(
                  pinjaman.filter(p => p.status === 'aktif').reduce((sum, p) => sum + Number(p.sisa_pinjaman || 0), 0)
                )}
              </p>
            </div>
          </div>
        )}

        {/* Pinjaman Cards */}
        {!isLoading && (filteredPinjaman.length > 0 ? (
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
                <button
                  type="button"
                  onClick={() => item.status === 'aktif' && navigate('/anggota/cicilan')}
                  disabled={item.status !== 'aktif'}
                  className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-600"
                >
                  {item.status === 'aktif'
                    ? 'Lihat Jadwal Cicilan'
                    : item.status === 'disetujui'
                      ? 'Menunggu Pencairan'
                      : item.status === 'pending'
                        ? 'Menunggu Persetujuan'
                        : 'Tidak ada tindakan'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <HandCoins className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">Tidak ada pinjaman</p>
          </div>
        ))}

      </div>

    </div>
  )
}
