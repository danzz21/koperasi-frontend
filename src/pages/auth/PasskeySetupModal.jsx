import { useState } from 'react'
import { AlertCircle, Fingerprint, ShieldCheck } from 'lucide-react'
import { usePasskey } from '@/hooks/usePasskey'

/**
 * Modal aktivasi passkey (sidik jari / Face ID) dari halaman Profil.
 * Memerlukan sesi login karena passkey ditautkan ke akun yang aktif.
 */
export default function PasskeySetupModal({ onClose, userName, onRegistered }) {
  const { register, loading, error, supported } = usePasskey()

  const [step, setStep] = useState('intro') // intro | success | error
  const [deviceName, setDeviceName] = useState('')
  const [message, setMessage] = useState(null)

  const handleSetup = async () => {
    setMessage(null)

    try {
      await register({ deviceName: deviceName.trim() || undefined })
      setStep('success')
      onRegistered?.()
    } catch (err) {
      setMessage(err?.message || 'Terjadi kesalahan. Coba lagi.')
      setStep('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span className="font-black text-gray-800">Aktifkan Sidik Jari</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-emerald-50 p-3">
          <Fingerprint className="h-5 w-5 text-emerald-600" />
          <p className="text-xs text-emerald-700">
            Login tanpa password, pakai sidik jari / Face ID / PIN perangkat
          </p>
        </div>

        <div className="space-y-4 text-sm text-gray-600">
          {!supported && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-amber-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-xs">
                Browser atau perangkat ini belum mendukung passkey. Gunakan browser terbaru
                (Chrome, Safari, Edge) di perangkat yang punya sidik jari / Face ID.
              </p>
            </div>
          )}

          {step === 'intro' && (
            <>
              <p className="text-gray-700">
                Daftarkan perangkat ini untuk <strong>{userName || 'akun Anda'}</strong> agar bisa
                masuk tanpa mengetik password.
              </p>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Nama perangkat (opsional)
                </label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Contoh: HP Andi"
                  className="input-field"
                />
              </div>

              <p className="text-gray-500">
                Kamu tetap bisa menggunakan password atau Google.
              </p>

              <button
                type="button"
                onClick={handleSetup}
                disabled={loading || !supported}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Fingerprint className="h-4 w-4" />
                )}
                Aktifkan sekarang
              </button>

              {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
            </>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="rounded-full bg-emerald-100 p-3">
                <ShieldCheck className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="font-bold text-gray-800">Selesai</p>
              <p className="text-gray-500">
                Perangkat berhasil didaftarkan. Lain kali cukup tekan tombol
                &ldquo;Masuk dengan sidik jari / Face ID&rdquo; di halaman login.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow"
              >
                Tutup
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="font-bold text-gray-800">Gagal</p>
              <p className="text-gray-500">{message || 'Terjadi kesalahan. Coba lagi.'}</p>
              <button
                type="button"
                onClick={handleSetup}
                disabled={loading}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow disabled:opacity-50"
              >
                Coba lagi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
