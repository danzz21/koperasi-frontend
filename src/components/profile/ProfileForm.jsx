import { useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Save, ShieldCheck } from 'lucide-react'

/** Struktur nilai awal form profil. */
const emptyValues = {
  nama_lengkap: '',
  nomor_ktp: '',
  nomor_hp: '',
  nomor_hp_keluarga: '',
  jenis_kelamin: '',
  tgl_lahir: '',
  pekerjaan: '',
  alamat: '',
  no_rek: '',
  atasnama_rekening: '',
  jenis_bank: '',
  password: '',
  password_confirmation: '',
}

const BANKS = ['BCA', 'BRI', 'BNI', 'Mandiri', 'BSI', 'BJB', 'CIMB Niaga', 'Permata', 'Danamon', 'BTN']

/** Ambil hanya field profil dari sumber apa pun (API/JSON). */
function pickProfile(source) {
  const result = {}

  Object.keys(emptyValues).forEach((key) => {
    const value = source?.[key]

    if (value !== null && value !== undefined) {
      result[key] = String(value)
    }
  })

  // Normalisasi format tanggal agar cocok dengan input type="date"
  if (result.tgl_lahir) {
    result.tgl_lahir = result.tgl_lahir.slice(0, 10)
  }

  return result
}

/**
 * Form data anggota — dipakai halaman onboarding (pasca-login Google) dan
 * halaman edit profil supaya isian & validasinya konsisten.
 */
export default function ProfileForm({
  initialValues,
  requiredFields = [],
  missingFields = [],
  onSubmit,
  submitLabel = 'Simpan',
  passwordHint = 'Biarkan kosong bila tidak ingin mengubah password.',
  banner = null,
}) {
  const initial = useMemo(() => ({ ...emptyValues, ...pickProfile(initialValues) }), [initialValues])

  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [saving, setSaving] = useState(false)

  const isRequired = (field) => requiredFields.includes(field)
  const isMissing = (field) => missingFields.includes(field)

  const setField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setErrors({})
    setMessage(null)

    const payload = { ...form }

    if (!payload.password) {
      delete payload.password
      delete payload.password_confirmation
    }

    try {
      await onSubmit(payload)
      setForm((prev) => ({ ...prev, password: '', password_confirmation: '' }))
    } catch (err) {
      const data = err?.response?.data

      if (data?.errors) {
        setErrors(data.errors)
      }

      setMessage(data?.message || err?.message || 'Gagal menyimpan data. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  const fieldClass = (field) =>
    `input-field ${isMissing(field) ? 'border-amber-300 bg-amber-50/40' : ''}`

  const errorText = (field) =>
    errors[field]?.[0] ? (
      <p className="mt-1 text-xs font-semibold text-rose-600">{errors[field][0]}</p>
    ) : null

  const label = (field, text) => (
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
      {text}
      {isRequired(field) && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {banner}

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* ── Data Diri ── */}
      <section className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900">Data Diri</h3>

        <div>
          {label('nama_lengkap', 'Nama Lengkap')}
          <input
            type="text"
            value={form.nama_lengkap}
            onChange={setField('nama_lengkap')}
            className={fieldClass('nama_lengkap')}
            placeholder="Sesuai KTP"
          />
          {errorText('nama_lengkap')}
        </div>

        <div>
          {label('nomor_ktp', 'Nomor KTP (16 digit)')}
          <input
            type="text"
            inputMode="numeric"
            maxLength={16}
            value={form.nomor_ktp}
            onChange={(e) => setForm((prev) => ({ ...prev, nomor_ktp: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
            className={fieldClass('nomor_ktp')}
            placeholder="3271xxxxxxxxxxxx"
          />
          {errorText('nomor_ktp')}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            {label('jenis_kelamin', 'Jenis Kelamin')}
            <select
              value={form.jenis_kelamin}
              onChange={setField('jenis_kelamin')}
              className={fieldClass('jenis_kelamin')}
            >
              <option value="">Pilih</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
            {errorText('jenis_kelamin')}
          </div>

          <div>
            {label('tgl_lahir', 'Tanggal Lahir')}
            <input
              type="date"
              value={form.tgl_lahir}
              onChange={setField('tgl_lahir')}
              className={fieldClass('tgl_lahir')}
            />
            {errorText('tgl_lahir')}
          </div>
        </div>

        <div>
          {label('pekerjaan', 'Pekerjaan')}
          <input
            type="text"
            value={form.pekerjaan}
            onChange={setField('pekerjaan')}
            className={fieldClass('pekerjaan')}
            placeholder="Contoh: Wiraswasta"
          />
          {errorText('pekerjaan')}
        </div>

        <div>
          {label('alamat', 'Alamat Lengkap')}
          <textarea
            rows={3}
            value={form.alamat}
            onChange={setField('alamat')}
            className={fieldClass('alamat')}
            placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota"
          />
          {errorText('alamat')}
        </div>
      </section>

      {/* ── Kontak ── */}
      <section className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900">Kontak</h3>

        <div>
          {label('nomor_hp', 'Nomor HP / WhatsApp')}
          <input
            type="tel"
            value={form.nomor_hp}
            onChange={setField('nomor_hp')}
            className={fieldClass('nomor_hp')}
            placeholder="081234567890"
          />
          {errorText('nomor_hp')}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Nomor HP Keluarga (opsional)
          </label>
          <input
            type="tel"
            value={form.nomor_hp_keluarga}
            onChange={setField('nomor_hp_keluarga')}
            className="input-field"
            placeholder="Kontak darurat"
          />
          {errorText('nomor_hp_keluarga')}
        </div>
      </section>

      {/* ── Data Rekening ── */}
      <section className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900">
          Data Rekening <span className="text-xs font-semibold text-gray-400">(opsional)</span>
        </h3>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Nomor Rekening
          </label>
          <input
            type="text"
            value={form.no_rek}
            onChange={setField('no_rek')}
            className="input-field"
            placeholder="Nomor rekening bank"
          />
          {errorText('no_rek')}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Atas Nama
          </label>
          <input
            type="text"
            value={form.atasnama_rekening}
            onChange={setField('atasnama_rekening')}
            className="input-field"
            placeholder="Nama pemilik rekening"
          />
          {errorText('atasnama_rekening')}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Bank
          </label>
          <input
            type="text"
            list="daftar-bank"
            value={form.jenis_bank}
            onChange={setField('jenis_bank')}
            className="input-field"
            placeholder="Contoh: BSI"
          />
          <datalist id="daftar-bank">
            {BANKS.map((bank) => (
              <option key={bank} value={bank} />
            ))}
          </datalist>
          {errorText('jenis_bank')}
        </div>
      </section>

      {/* ── Keamanan ── */}
      <section className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-gray-900">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Password
        </h3>

        <p className="text-xs text-gray-500">{passwordHint}</p>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Password Baru
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={setField('password')}
            className="input-field"
            placeholder="Minimal 8 karakter"
          />
          {errorText('password')}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Ulangi Password Baru
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={form.password_confirmation}
            onChange={setField('password_confirmation')}
            className="input-field"
            placeholder="Ulangi password"
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {saving ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Menyimpan...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            {submitLabel}
          </>
        )}
      </button>

      {!saving && (
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Data hanya digunakan untuk keperluan administrasi koperasi.
        </p>
      )}
    </form>
  )
}
