import api from '@/lib/api'

export const login = credentials => api.post('/auth/login', credentials).then(response => response.data)
export const logout = () => api.post('/auth/logout')
export const getCurrentUser = () => api.get('/auth/me').then(response => response.data)
export const register = payload => api.post('/auth/register', payload)
export const requestPasswordReset = payload => api.post('/auth/forgot-password', payload)
export const signInWithGoogle = credential => api.post('/auth/google', { credential }).then(response => response.data)

export const getPasskeyLoginOptions = payload => api.post('/auth/passkey/login/options', payload)
export const verifyPasskeyLogin = payload => api.post('/auth/passkey/login/verify', payload)
export const getPasskeyRegistrationOptions = () => api.post('/auth/passkey/register/options')
export const verifyPasskeyRegistration = payload => api.post('/auth/passkey/register/verify', payload)
export const getPasskeys = () => api.get('/auth/passkey').then(response => response.data?.data ?? [])
export const deletePasskey = id => api.delete(`/auth/passkey/${id}`).then(response => response.data)
