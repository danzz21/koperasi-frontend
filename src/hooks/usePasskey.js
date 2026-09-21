import { useCallback, useState } from 'react'
import api from '@/lib/api'
import useAuthStore from '@/store/authStore'
import {
  credentialToPayload,
  describePasskeyError,
  isWebAuthnSupported,
  prepareCreationOptions,
  prepareRequestOptions,
} from '@/lib/webauthn'

/** Ubah error axios/DOMException menjadi Error dengan pesan yang ramah. */
function toFriendlyError(err) {
  const message = err?.response?.data?.message || describePasskeyError(err)

  return new Error(message)
}

/**
 * Passkey (WebAuthn) di sisi frontend.
 *
 * - login()    → masuk pakai sidik jari / Face ID (perangkat harus sudah terdaftar)
 * - register() → daftarkan perangkat ini (butuh sudah login)
 * - list() / remove() → kelola perangkat di halaman Profil
 */
export function usePasskey() {
  const applyAuth = useAuthStore((state) => state.applyAuth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async ({ username } = {}) => {
    if (!isWebAuthnSupported()) {
      throw new Error('Perangkat atau browser ini belum mendukung login biometrik.')
    }

    setLoading(true)
    setError(null)

    try {
      const { data } = await api.post(
        '/auth/passkey/login/options',
        username ? { username } : {},
      )

      const credential = await navigator.credentials.get({
        publicKey: prepareRequestOptions(data.options),
      })

      if (!credential) throw new Error('Login biometrik dibatalkan.')

      const { data: result } = await api.post('/auth/passkey/login/verify', {
        ceremony_id: data.ceremony_id,
        credential: credentialToPayload(credential),
      })

      applyAuth(result)

      return result.user
    } catch (err) {
      const friendly = toFriendlyError(err)
      setError(friendly.message)
      throw friendly
    } finally {
      setLoading(false)
    }
  }, [applyAuth])

  const register = useCallback(async ({ deviceName } = {}) => {
    if (!isWebAuthnSupported()) {
      throw new Error('Perangkat atau browser ini belum mendukung login biometrik.')
    }

    setLoading(true)
    setError(null)

    try {
      const { data } = await api.post('/auth/passkey/register/options')

      const credential = await navigator.credentials.create({
        publicKey: prepareCreationOptions(data.options),
      })

      if (!credential) throw new Error('Pendaftaran biometrik dibatalkan.')

      const { data: result } = await api.post('/auth/passkey/register/verify', {
        device_name: deviceName,
        credential: credentialToPayload(credential),
      })

      return result.passkey
    } catch (err) {
      const friendly = toFriendlyError(err)
      setError(friendly.message)
      throw friendly
    } finally {
      setLoading(false)
    }
  }, [])

  const list = useCallback(async () => {
    const { data } = await api.get('/auth/passkey')

    return data?.data ?? []
  }, [])

  const remove = useCallback(async (id) => {
    const { data } = await api.delete(`/auth/passkey/${id}`)

    return data
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    login,
    register,
    list,
    listDevices: list,
    remove,
    removeDevice: remove,
    clearError,
    loading,
    error,
    supported: isWebAuthnSupported(),
  }
}

export default usePasskey
