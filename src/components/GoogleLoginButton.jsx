import { useEffect, useRef } from 'react'
import { useGoogleSignIn } from '@/hooks/useGoogleSignIn'

/**
 * Tombol login Google resmi (Google Identity Services).
 * Backend menerima ID token dan memverifikasinya ke Google.
 */
export default function GoogleLoginButton({ onSuccess, onError, text }) {
  const containerRef = useRef(null)
  const { renderButton, loading, error, ready, configured } = useGoogleSignIn({ onSuccess, onError })

  useEffect(() => {
    renderButton(containerRef.current, text ? { text } : undefined).catch(() => {
      // Pesan error sudah disimpan di state hook dan ditampilkan di bawah tombol
    })
  }, [renderButton, text])

  return (
    <div>
      <div className="relative flex min-h-[44px] items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
        <div ref={containerRef} className="w-full [&>div]:!w-full [&_iframe]:!w-full" />

        {!ready && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-white text-sm font-bold text-gray-500">
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />
                Memproses...
              </>
            ) : (
              <>
                <span className="text-base font-black text-emerald-600">G</span>
                {configured ? 'Menyiapkan Google...' : 'Google belum dikonfigurasi'}
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-center text-xs font-semibold text-amber-600">{error}</p>
      )}
    </div>
  )
}
