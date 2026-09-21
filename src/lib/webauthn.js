/**
 * Helper WebAuthn (passkey) untuk browser.
 *
 * Server mengirim data biner (challenge, credential id, user id) sebagai
 * base64url, sedangkan WebAuthn API membutuhkan ArrayBuffer — dan sebaliknya
 * saat mengirim hasil kredensial kembali ke server.
 */

/** ArrayBuffer → base64url (tanpa padding). */
export function bufferToB64url(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''

  // Diproses bertahap agar aman untuk data besar
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** base64url → ArrayBuffer. */
export function b64urlToBuffer(value) {
  const normalized = String(value).replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes.buffer
}

/** Ubah opsi registrasi dari server menjadi PublicKeyCredentialCreationOptions. */
export function prepareCreationOptions(options) {
  return {
    ...options,
    challenge: b64urlToBuffer(options.challenge),
    user: { ...options.user, id: b64urlToBuffer(options.user.id) },
    excludeCredentials: (options.excludeCredentials || []).map((credential) => ({
      ...credential,
      id: b64urlToBuffer(credential.id),
    })),
  }
}

/** Ubah opsi login dari server menjadi PublicKeyCredentialRequestOptions. */
export function prepareRequestOptions(options) {
  return {
    ...options,
    challenge: b64urlToBuffer(options.challenge),
    allowCredentials: (options.allowCredentials || []).map((credential) => ({
      ...credential,
      id: b64urlToBuffer(credential.id),
    })),
  }
}

/** Serialisasi PublicKeyCredential menjadi JSON yang bisa dikirim ke server. */
export function credentialToPayload(credential) {
  const response = credential.response || {}
  const payload = {
    id: credential.id,
    rawId: bufferToB64url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: bufferToB64url(response.clientDataJSON),
    },
  }

  if (response.attestationObject) {
    payload.response.attestationObject = bufferToB64url(response.attestationObject)
  }

  if (response.authenticatorData) {
    payload.response.authenticatorData = bufferToB64url(response.authenticatorData)
  }

  if (response.signature) {
    payload.response.signature = bufferToB64url(response.signature)
  }

  if (response.userHandle) {
    payload.response.userHandle = bufferToB64url(response.userHandle)
  }

  if (typeof credential.getClientExtensionResults === 'function') {
    payload.clientExtensionResults = credential.getClientExtensionResults()
  }

  return payload
}

export function isWebAuthnSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.credentials
  )
}

/** Ubah DOMException / error lain menjadi pesan berbahasa Indonesia. */
export function describePasskeyError(error) {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
        return 'Verifikasi dibatalkan atau waktu habis. Coba lagi dan pastikan sidik jari / Face ID / PIN perangkat aktif.'
      case 'InvalidStateError':
        return 'Perangkat ini sudah terdaftar. Gunakan tombol masuk biometrik.'
      case 'NotSupportedError':
        return 'Perangkat atau browser ini belum mendukung passkey.'
      case 'SecurityError':
        return 'Passkey memerlukan koneksi aman (HTTPS atau localhost).'
      case 'AbortError':
        return 'Proses dibatalkan. Coba lagi.'
      default:
        return error.message || 'Login biometrik gagal.'
    }
  }

  return error?.message || 'Terjadi kesalahan. Coba lagi.'
}
