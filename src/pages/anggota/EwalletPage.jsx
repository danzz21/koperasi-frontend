import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle, ArrowDownToLine, ArrowLeft, ArrowRightLeft, CheckCircle2,
  LoaderCircle, PlusCircle, Upload, Wallet,
} from 'lucide-react'
import api from '@/lib/api'
import EwalletTransactions from '@/components/anggota/EwalletTransactions'

const fmt = (n) => `Rp ${new Intl.NumberFormat('id-ID').format(Number(n) || 0)}`

const NOMINAT_CEPAT = [20000, 50000, 100000, 200000, 500000, 1000000]

/** Metode yang diproses otomatis lewat payment gateway (butuh MIDTRANS_SERVER_KEY). */
const METODE_OTOMATIS = [
  { value: 'midtrans_qris', label: 'QRIS (semua e-wallet & m-banking)' },
  { value: 'va_bca', label: 'Virtual Account BCA' },
  { value: 'va_bni', label: 'Virtual Account BNI' },
  { value: 'va_bri', label: 'Virtual Account BRI' },
  { value: 'va_mandiri', label: 'Virtual Account Mandiri' },
]

/** Transfer manual ke rekening koperasi, diverifikasi admin. */
const METODE_MANUAL = [
  { value: 'transfer_bca', label: 'Transfer Bank BCA' },
  { value: 'transfer_bsi', label: 'Transfer Bank BSI' },
  { value: 'transfer_bri', label: 'Transfer Bank BRI' },
  { value: 'transfer_mandiri', label: 'Transfer Bank Mandiri' },
  { value: 'transfer_bni', label: 'Transfer Bank BNI' },
  { value: 'tunai', label: 'Setor Tunai di Kantor' },
]

const refresh = queryClient => {
  queryClient.invalidateQueries({ queryKey: ['anggota-ewallet'] })
  queryClient.invalidateQueries({ queryKey: ['anggota-ewallet-riwayat'] })
  queryClient.invalidateQueries({ queryKey: ['anggota-saldo-simpanan'] })
  queryClient.invalidateQueries({ queryKey: ['simpanan'] })
  queryClient.invalidateQueries({ queryKey: ['ppob-index'] })
}

/**
 * Halaman E-Wallet Koperasi.
 *
 * Tiga cara mengisi saldo:
 * 1. Pindahkan dari saldo simpanan sendiri (instan, tanpa admin)
 * 2. Topup otomatis via QRIS / Virtual Account (Midtrans, saldo masuk lewat webhook)
 * 3. Transfer manual ke rekening koperasi + unggah bukti (verifikasi admin)
 */
export default function EwalletPage() {
  const queryClient = useQueryClient()

  const [nominal, setNominal] = useState('')
  const [metode, setMetode] = useState('transfer_bca')
  const [pindahNominal, setPindahNominal] = useState('')
  const [pindahJenis, setPindahJenis] = useState('sukarela')
  const [bukti, setBukti] = useState(null)
  const [hasil, setHasil] = useState(null)
  const [sukses, setSukses] = useState(null)
  const [error, setError] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['anggota-ewallet'],
    queryFn: () => api.get('/anggota/ewallet').then(res => res.data?.data ?? {}),
  })

  const pesanError = err => {
    const errors = err?.response?.data?.errors
    setError(errors ? Object.values(errors).flat().join(' ') : err?.response?.data?.message || err?.message || 'Gagal memproses.')
  }

  const topup = useMutation({
    mutationFn: payload => api.post('/anggota/ewallet/topup', payload),
    onSuccess: res => {
      setSukses(res.data?.message)
      setError(null)
      setHasil(res.data?.data ?? null)
      setNominal('')
      refresh(queryClient)
    },
    onError: pesanError,
  })

  const pindah = useMutation({
    mutationFn: payload => api.post('/anggota/ewallet/pindah', payload),
    onSuccess: res => {
      setSukses(res.data?.message)
      setError(null)
      setPindahNominal('')
      refresh(queryClient)
    },
    onError: pesanError,
  })

  const unggahBukti = useMutation({
    mutationFn: form => {
      const payload = new FormData()
      payload.append('id', hasil.id)
      payload.append('bukti', form)

      return api.post('/anggota/ewallet/bukti', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: res => {
      setSukses(res.data?.message)
      setError(null)
      setBukti(null)
      refresh(queryClient)
    },
    onError: pesanError,
  })

  const saldo = data?.saldo ?? 0
  const pending = data?.topup_pending ?? 0
  const tersedia = data?.simpanan_tersedia ?? {}
  const gatewayAktif = !!data?.gateway_aktif
  const rekening = data?.rekening ?? {}
  const totalSimpanan = Number(tersedia.sukarela || 0) + Number(tersedia.pokok || 0)

  const kirimTopup = event => {
    event.preventDefault()
    setSukses(null)
    setError(null)
    setHasil(null)
    topup.mutate({ nominal: Number(nominal), metode })
  }

  const kirimPindah = event => {
    event.preventDefault()
    setSukses(null)
    setError(null)
    pindah.mutate({ nominal: Number(pindahNominal), jenis: pindahJenis })
  }

  return (
    <div className="min-h-screen bg-emerald-50/40" style={{ paddingBottom: '90px' }}>
      <header className="member-profile-header">
        <div className="member-profile-top">
          <Link to="/anggota/ppob" className="rounded-full bg-white/20 p-2 hover:bg-white/30" aria-label="Kembali">
            <ArrowLeft size={19} />
          </Link>
          <h1>E-Wallet Koperasi</h1>
          <span className="w-[35px]" />
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Wallet className="h-7 w-7" />
          </div>
          <h2 className="!text-lg">Saldo Tersedia</h2>
          <p className="mt-1 text-3xl font-black">{isLoading ? '...' : fmt(saldo)}</p>
          <p className="mt-1 text-sm opacity-90">Dipakai untuk bayar PPOB tanpa biaya admin</p>
        </div>
      </header>

      <div className="space-y-4 px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Topup</p>
            <p className="mt-1 text-sm font-extrabold text-emerald-600">{fmt(data?.total_topup)}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Bayar</p>
            <p className="mt-1 text-sm font-extrabold text-rose-600">{fmt(data?.total_pembayaran)}</p>
          </div>
        </div>

        {pending > 0 && (
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
            <LoaderCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-xs font-semibold">
              {pending} permintaan topup menunggu verifikasi admin. Saldo bertambah setelah
              disetujui di Dashboard PPOB.
            </p>
          </div>
        )}

        {sukses && (
          <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{sukses}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ═══ 1. Pindahkan dari simpanan sendiri ═══ */}
        {totalSimpanan > 0 && (
          <form onSubmit={kirimPindah} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <ArrowRightLeft className="h-4 w-4 text-emerald-600" />
              Pindahkan dari Simpanan
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Saldo dipindah seketika dari simpanan kamu ke E-Wallet, tanpa menunggu admin.
              Tersedia {fmt(totalSimpanan)}.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Dari Simpanan
                </label>
                <select
                  value={pindahJenis}
                  onChange={e => setPindahJenis(e.target.value)}
                  className="input-field"
                >
                  <option value="sukarela">Sukarela ({fmt(tersedia.sukarela)})</option>
                  <option value="pokok">Pokok ({fmt(tersedia.pokok)})</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={10000}
                  step={1000}
                  max={Number(tersedia[pindahJenis] || 0)}
                  value={pindahNominal}
                  onChange={e => setPindahNominal(e.target.value)}
                  placeholder="Min. 10.000"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pindah.isPending || !pindahNominal}
              className="btn-primary mt-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {pindah.isPending ? (
                <><LoaderCircle className="h-4 w-4 animate-spin" /> Memindahkan...</>
              ) : (
                <><ArrowRightLeft className="h-4 w-4" /> Pindahkan ke E-Wallet</>
              )}
            </button>
          </form>
        )}

        {/* ═══ 2. Topup otomatis (QRIS / Virtual Account) ═══ */}
        {gatewayAktif && (
          <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-violet-800">
              <Wallet className="h-4 w-4" />
              Topup Otomatis (QRIS / Virtual Account)
            </h3>
            <p className="mt-1 text-xs text-violet-700">
              Bayar dengan QRIS (DANA, GoPay, OVO, m-banking) atau Virtual Account. Saldo masuk
              otomatis setelah pembayaran terkonfirmasi.
            </p>

            <div className="mt-3 space-y-2">
              {METODE_OTOMATIS.map(item => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => { setMetode(item.value); setHasil(null); setSukses(null) }}
                  className={`flex w-full items-center justify-between rounded-xl border-2 px-3 py-2.5 text-left text-xs font-bold transition ${
                    metode === item.value
                      ? 'border-violet-500 bg-white text-violet-700'
                      : 'border-violet-100 bg-white/70 text-gray-600'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.value === 'midtrans_qris' ? (
                    <span className="text-[10px] font-semibold text-violet-500">QRIS</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        )}

        {!gatewayAktif && (
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Topup otomatis belum aktif karena payment gateway belum dikonfigurasi. Gunakan
              transfer manual di bawah atau pindahkan saldo dari simpanan.
            </span>
          </div>
        )}


        {/* ═══ 3. Transfer manual + unggah bukti ═══ */}
        <form onSubmit={kirimTopup} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <PlusCircle className="h-4 w-4 text-emerald-600" />
            Topup via Transfer Manual
          </h3>

          <p className="mb-2 mt-3 text-xs font-bold uppercase tracking-wider text-gray-500">Pilih Nominal</p>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {NOMINAT_CEPAT.map(value => (
              <button
                key={value}
                type="button"
                onClick={() => { setNominal(String(value)); setHasil(null) }}
                className={`rounded-xl border-2 px-2 py-2 text-xs font-bold transition ${
                  Number(nominal) === value
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}
              >
                {value >= 1000000 ? `${value / 1000000} Jt` : `${value / 1000} Ribu`}
              </button>
            ))}
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
              Nominal (Rp)
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={10000}
              max={10000000}
              step={1000}
              value={nominal}
              onChange={e => setNominal(e.target.value)}
              placeholder="Minimal Rp 10.000"
              className="input-field"
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
              Bank Pengirim
            </label>
            <select
              value={metode}
              onChange={e => { setMetode(e.target.value); setHasil(null) }}
              className="input-field"
            >
              {METODE_MANUAL.map(item => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={topup.isPending || !nominal}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {topup.isPending ? (
              <><LoaderCircle className="h-4 w-4 animate-spin" /> Memproses...</>
            ) : (
              <><ArrowDownToLine className="h-4 w-4" /> Kirim Permintaan Topup</>
            )}
          </button>
        </form>


        {/* ═══ Panel instruksi pembayaran ═══ */}
        {hasil && (
          <div className="space-y-3 rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <CheckCircle2 className="h-4 w-4 text-violet-600" />
              Selesaikan Pembayaran
            </h3>

            {hasil.payment_url && (
              <a
                href={hasil.payment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow"
              >
                <Wallet className="h-4 w-4" /> Bayar Sekarang
              </a>
            )}

            {hasil.qris_string && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 text-center">
                <p className="text-[11px] font-bold uppercase text-gray-500">QRIS</p>
                <p className="mt-1 break-all font-mono text-[10px] text-gray-600">{hasil.qris_string}</p>
              </div>
            )}

            {!hasil.payment_url && (
              <div className="space-y-1 rounded-xl bg-gray-50 p-3 text-xs">
                <p className="font-bold text-gray-700">Transfer ke rekening koperasi:</p>
                <p className="text-gray-600">
                  {rekening.bank} · <span className="font-mono font-bold">{rekening.nomor}</span>
                </p>
                <p className="text-gray-500">a.n. {rekening.atas}</p>
                {hasil.kode_va && (
                  <p className="pt-1 text-gray-600">
                    Tulis kode VA di berita transfer:{' '}
                    <span className="font-mono font-bold text-violet-700">{hasil.kode_va}</span>
                  </p>
                )}
                <p className="pt-1 font-bold text-gray-700">Nominal: {fmt(hasil.nominal)}</p>
                <p className="text-[11px] text-gray-400">Ref: {hasil.ref_id}</p>
              </div>
            )}

            {!hasil.payment_url && (
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="mb-2 text-xs font-bold text-gray-700">Unggah bukti transfer</p>
                <input
                  type="file"
                  accept="image/png,image/jpeg,application/pdf"
                  onChange={e => setBukti(e.target.files?.[0] ?? null)}
                  className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-emerald-700"
                />
                <button
                  type="button"
                  onClick={() => bukti && unggahBukti.mutate(bukti)}
                  disabled={!bukti || unggahBukti.isPending}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                >
                  {unggahBukti.isPending ? (
                    <><LoaderCircle className="h-4 w-4 animate-spin" /> Mengunggah...</>
                  ) : (
                    <><Upload className="h-4 w-4" /> Kirim Bukti</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ Riwayat mutasi ═══ */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Riwayat Mutasi</p>
            <Link to="/anggota/ppob/riwayat-ewallet" className="text-xs font-bold text-emerald-600">
              Lihat semua →
            </Link>
          </div>
          <EwalletTransactions transactions={data?.riwayat_singkat} loading={isLoading} />
        </div>

      </div>
    </div>
  )
}
