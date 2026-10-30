import { useState } from 'react'
import { AlertCircle, ArrowLeft, Banknote, Clock3, Landmark, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  useWithdrawalRequests,
  useWithdrawalSubmit,
  useWithdrawalSummary,
} from '@/hooks/useMemberData'

const formatRupiah = value => `Rp ${Number(value || 0).toLocaleString('id-ID')}`

const formatStatus = status => {
  if (!status) return 'Status belum tersedia'
  const value = String(status).toLowerCase().replace(/[_-]+/g, ' ')
  const labels = {
    pending: 'Menunggu diproses',
    diajukan: 'Menunggu diproses',
    diproses: 'Sedang diproses',
    disetujui: 'Disetujui',
    approved: 'Disetujui',
    ditolak: 'Ditolak',
    rejected: 'Ditolak',
    selesai: 'Selesai',
    dicairkan: 'Dana dicairkan',
    completed: 'Selesai',
    batal: 'Dibatalkan',
    cancelled: 'Dibatalkan',
  }
  return labels[value] || value.replace(/\b\w/g, character => character.toUpperCase())
}

const getRequestStatus = request => (
  request.status_pengajuan || request.status || request.status_pencairan || request.status_verifikasi
)

const statusStyle = status => {
  const value = String(status || '').toLowerCase()
  if (value.includes('tolak') || value.includes('reject') || value.includes('batal') || value.includes('cancel')) {
    return 'bg-rose-50 text-rose-700'
  }
  if (value.includes('setuju') || value.includes('approved') || value.includes('selesai') || value.includes('cair') || value.includes('complete')) {
    return 'bg-emerald-50 text-emerald-700'
  }
  return 'bg-amber-50 text-amber-700'
}

export default function PengunduranDiriPage() {
  const navigate = useNavigate()
  const [confirmed, setConfirmed] = useState(false)
  const [message, setMessage] = useState('')

  const summaryQuery = useWithdrawalSummary()
  const requestsQuery = useWithdrawalRequests()

  const submitRequest = useWithdrawalSubmit({
    onSuccess: () => {
      setMessage('Pengajuan berhasil dikirim. Status pengajuan akan diperbarui di bawah.')
      setConfirmed(false)
    },
    onError: error => {
      const validation = error.response?.data?.errors
      const details = validation ? Object.values(validation).flat().join(' ') : ''
      setMessage(details || error.response?.data?.message || 'Pengajuan gagal dikirim. Silakan coba lagi.')
    },
  })

  const summary = summaryQuery.data || {}
  const rekening = summary.rekening || {}
  const requests = Array.isArray(requestsQuery.data) ? requestsQuery.data : []
  const loanFlag = summary.ada_pinjaman_aktif
  const adaPinjamanAktif = loanFlag === true || loanFlag === 1 || ['true', '1', 'yes'].includes(String(loanFlag).toLowerCase())
  const isLoading = summaryQuery.isLoading || requestsQuery.isLoading
  const hasError = summaryQuery.isError || requestsQuery.isError

  if (isLoading) {
    return <div className="p-6 text-center text-sm text-gray-500">Memuat informasi pengunduran diri...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="rounded-b-3xl bg-gradient-to-br from-emerald-600 to-teal-700 px-4 pb-6 pt-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
            aria-label="Kembali"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold">Pengunduran Diri</h1>
            <p className="text-xs text-white/80">Pengajuan pencairan simpanan anggota</p>
          </div>
        </div>
      </header>

      <main className="space-y-4 px-4 py-4">
        {hasError && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>Informasi pengajuan belum dapat dimuat. Periksa koneksi lalu muat ulang halaman.</span>
          </div>
        )}

        <section className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-white/85">
            <Banknote size={17} /> Estimasi pencairan bersih
          </p>
          <p className="mt-2 text-3xl font-extrabold">{formatRupiah(summary.jumlah_pencairan)}</p>
          <div className="mt-5 space-y-3 border-t border-white/20 pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-white/80">Total simpanan</span>
              <span className="font-semibold">{formatRupiah(summary.total_simpanan)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/80">Biaya administrasi</span>
              <span className="font-semibold">− {formatRupiah(summary.biaya_admin)}</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
            <Landmark className="h-5 w-5 text-indigo-600" /> Rekening tujuan pencairan
          </h2>
          <div className="space-y-3">
            {[
              ['Bank', rekening.jenis_bank],
              ['Nomor rekening', rekening.nomor_rekening],
              ['Atas nama', rekening.atasnama_rekening],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-t border-gray-100 pt-3 first:border-0 first:pt-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="max-w-[60%] break-words text-right text-sm font-semibold text-gray-900">{value || '-'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={`flex items-start gap-3 rounded-2xl border p-4 ${adaPinjamanAktif ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
          {adaPinjamanAktif
            ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            : <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}
          <div>
            <h2 className={`font-bold ${adaPinjamanAktif ? 'text-rose-800' : 'text-emerald-800'}`}>
              {adaPinjamanAktif ? 'Belum memenuhi syarat pengajuan' : 'Memenuhi syarat pengajuan'}
            </h2>
            <p className={`mt-1 text-sm ${adaPinjamanAktif ? 'text-rose-700' : 'text-emerald-700'}`}>
              {adaPinjamanAktif
                ? 'Masih ada pinjaman aktif. Selesaikan kewajiban pinjaman terlebih dahulu sebelum mengajukan pengunduran diri.'
                : 'Tidak ada pinjaman aktif yang menghalangi pengajuan pencairan simpanan.'}
            </p>
          </div>
        </section>

        <form
          onSubmit={event => {
            event.preventDefault()
            setMessage('')
            submitRequest.mutate()
          }}
          className="space-y-3 rounded-2xl bg-white p-4 shadow-sm"
        >
          <label className="flex items-start gap-3 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={event => setConfirmed(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
              disabled={adaPinjamanAktif}
            />
            <span>Saya telah memeriksa jumlah pencairan dan rekening tujuan di atas, serta memahami pengajuan ini akan diproses oleh koperasi.</span>
          </label>
          <button
            type="submit"
            disabled={!confirmed || adaPinjamanAktif || submitRequest.isPending || summaryQuery.isError}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {submitRequest.isPending ? 'Mengirim pengajuan...' : 'Ajukan Pengunduran Diri'}
          </button>
          {message && (
            <p role="status" className={`text-sm ${submitRequest.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
              {message}
            </p>
          )}
        </form>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
            <Clock3 className="h-5 w-5 text-cyan-600" /> Status pengajuan
          </h2>
          {requestsQuery.isError ? (
            <p className="text-sm text-gray-500">Status pengajuan tidak dapat dimuat saat ini.</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada pengajuan pengunduran diri.</p>
          ) : (
            <ul className="space-y-3">
              {requests.map((request, index) => {
                const status = getRequestStatus(request)
                const date = request.created_at || request.tanggal_pengajuan || request.tgl_pengajuan
                return (
                  <li key={request.id || request.uuid || index} className="rounded-xl border border-gray-100 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        Pengajuan {request.nomor_pengajuan ? `#${request.nomor_pengajuan}` : `ke-${requests.length - index}`}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle(status)}`}>
                        {formatStatus(status)}
                      </span>
                    </div>
                    {date && <p className="mt-2 text-xs text-gray-500">Diajukan {new Date(date).toLocaleDateString('id-ID')}</p>}
                    {(request.jumlah_pencairan != null || request.total_simpanan != null) && (
                      <p className="mt-2 text-sm text-gray-600">
                        Jumlah pencairan: <span className="font-semibold text-gray-900">{formatRupiah(request.jumlah_pencairan ?? request.total_simpanan)}</span>
                      </p>
                    )}
                    {request.catatan && <p className="mt-2 text-xs text-gray-500">{request.catatan}</p>}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
