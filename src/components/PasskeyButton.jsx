import { Fingerprint } from 'lucide-react'
import { usePasskey } from '@/hooks/usePasskey'

/**
 * Tombol masuk memakai passkey (sidik jari / Face ID / PIN perangkat).
 *
 * `username` opsional: bila diisi, browser hanya menawarkan passkey milik
 * akun tersebut. Bila kosong, browser menampilkan semua passkey tersimpan
 * di perangkat (discoverable credential).
 */
export default function PasskeyButton({ username, onSuccess, onError, className = '' }) {
  const { login, loading, error, supported } = usePasskey()

  // Sembunyikan tombol bila browser/perangkat tidak mendukung WebAuthn
  if (!supported) return null

  const handleClick = async () => {
    try {
      const user = await login({ username })
      onSuccess?.(user)
    } catch (err) {
      onError?.(err)
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600" />
            Menunggu verifikasi...
          </>
        ) : (
          <>
            <Fingerprint className="h-5 w-5 flex-shrink-0 text-emerald-600" />
            Masuk dengan sidik jari / Face ID
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-center text-xs font-semibold text-rose-600">{error}</p>
      )}
    </div>
  )
}
