import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Download, Share, X } from 'lucide-react'
import { dismissInstallBanner, shouldShowInstallBanner, useInstallPrompt } from '@/hooks/useInstallPrompt'

function isIosDevice() {
  if (typeof navigator === 'undefined') return false

  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

/**
 * Banner "Install Aplikasi".
 *
 * - Android/Chrome/Edge: memakai event beforeinstallprompt (tombol Install)
 * - iOS/Safari: tidak ada prompt otomatis → tampilkan petunjuk Bagikan →
 *   Tambah ke Layar Utama
 * - Otomatis disembunyikan bila app sudah berjalan standalone / ditutup user
 *   (tidak muncul lagi 7 hari).
 */
export default function InstallBanner() {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt()
  const { pathname } = useLocation()

  const [hidden, setHidden] = useState(false)
  const [busy, setBusy] = useState(false)

  const ios = isIosDevice()
  const supported = canInstall || ios
  const show = supported && !isInstalled && !hidden && shouldShowInstallBanner(supported)

  if (!show) return null

  // Di halaman anggota ada BottomNav, jadi banner digeser ke atasnya
  const isMemberArea = pathname?.startsWith('/anggota')

  const handleInstall = async () => {
    setBusy(true)

    try {
      await promptInstall()
    } finally {
      setBusy(false)
      setHidden(true)
    }
  }

  const handleClose = () => {
    dismissInstallBanner()
    setHidden(true)
  }

  return (
    <div
      className={`fixed left-3 right-3 z-50 sm:left-auto sm:right-4 sm:w-80 ${
        isMemberArea ? 'bottom-[4.75rem]' : 'bottom-4'
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white/95 p-3 shadow-xl backdrop-blur">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-sm font-black text-amber-300">
          KS
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">Install K-Samara</p>
          <p className="truncate text-xs text-gray-500">
            {ios ? 'Bagikan → Tambah ke Layar Utama' : 'Akses cepat dari layar utama HP'}
          </p>
        </div>

        {canInstall ? (
          <button
            onClick={handleInstall}
            disabled={busy}
            className="flex shrink-0 items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {busy ? '...' : 'Install'}
          </button>
        ) : (
          <span className="flex shrink-0 items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            <Share className="h-3.5 w-3.5" />
            Bagikan
          </span>
        )}

        <button
          onClick={handleClose}
          aria-label="Tutup"
          className="shrink-0 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
