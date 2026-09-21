import { useEffect, useState } from 'react'

const STORAGE_KEY = 'koperasi_pwa_dismissed_at'
const DISMISS_DAYS = 7

/**
 * Hook prompt instalasi PWA.
 * Menangkap event beforeinstallprompt lalu menyimpannya agar bisa
 * dipicu dari tombol/banner kustom (misal di BottomNav atau halaman Profil).
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true,
  )

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    const onInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return 'unavailable'
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
    return outcome // 'accepted' | 'dismissed'
  }

  return { deferredPrompt, isInstalled, promptInstall, canInstall: !!deferredPrompt && !isInstalled }
}

/** Cek apakah banner "Install Aplikasi" boleh ditampilkan (belum di-dismiss 7 hari). */
export function shouldShowInstallBanner(canInstall) {
  if (!canInstall) return false
  try {
    const dismissedAt = Number(localStorage.getItem(STORAGE_KEY) || 0)
    return Date.now() - dismissedAt > DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return true
  }
}

/** Tandai banner install sebagai di-dismiss hari ini. */
export function dismissInstallBanner() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    // abaikan — storage penuh / private mode
  }
}