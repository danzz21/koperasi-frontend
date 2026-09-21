import { useCallback, useEffect, useRef, useState } from 'react'
import api from '@/lib/api'
import useAuthStore from '@/store/authStore'

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

let gisLoader = null

/** Muat script Google Identity Services sekali saja. */
function loadGoogleIdentityServices() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Login Google hanya tersedia di browser.'))
  }

  if (window.google?.accounts?.id) return Promise.resolve(window.google)

  if (gisLoader) return gisLoader

  gisLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google)
      } else {
        gisLoader = null
        reject(new Error('Google Sign-In gagal dimuat.'))
      }
    }
    script.onerror = () => {
      gisLoader = null
      reject(new Error('Gagal mengunduh Google Sign-In. Periksa koneksi internet.'))
    }
    document.head.appendChild(script)
  })

  return gisLoader
}

/**
 * Login Google memakai Google Identity Services (ID token).
 *
 * Server Laravel memverifikasi ID token lewat endpoint tokeninfo Google,
 * jadi tidak ada client secret di frontend.
 */
export function useGoogleSignIn({ onSuccess, onError } = {}) {
  const applyAuth = useAuthStore((state) => state.applyAuth)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  const callbacksRef = useRef({ onSuccess, onError })
  callbacksRef.current = { onSuccess, onError }

  const sendCredentialToBackend = useCallback(async (response) => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await api.post('/auth/google', { credential: response?.credential })

      applyAuth(data)
      callbacksRef.current.onSuccess?.(data.user)

      return data.user
    } catch (err) {
      const message = err?.response?.data?.message || 'Login Google gagal. Coba lagi.'
      setError(message)
      callbacksRef.current.onError?.(new Error(message))
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [applyAuth])

  /** Render tombol resmi Google ke dalam elemen yang diberikan. */
  const renderButton = useCallback(async (element, options = {}) => {
    if (!element) return false

    if (!clientId) {
      setError('Login Google belum dikonfigurasi (VITE_GOOGLE_CLIENT_ID kosong).')
      return false
    }

    try {
      const google = await loadGoogleIdentityServices()

      google.accounts.id.initialize({
        client_id: clientId,
        callback: sendCredentialToBackend,
        ux_mode: 'popup',
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      google.accounts.id.renderButton(element, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        logo_alignment: 'left',
        locale: 'id',
        width: 336,
        ...options,
      })

      setReady(true)
      setError(null)

      return true
    } catch (err) {
      setError(err?.message || 'Google Sign-In tidak dapat dimuat.')
      return false
    }
  }, [clientId, sendCredentialToBackend])

  /** Buang pesan error saat komponen dilepas. */
  useEffect(() => () => setError(null), [])

  return {
    renderButton,
    loading,
    error,
    ready,
    clientId,
    configured: !!clientId,
  }
}

export default useGoogleSignIn
