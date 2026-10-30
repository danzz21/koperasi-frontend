import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register, requestPasswordReset } from '@/services/authService'

const registrationDefaults = {
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
  nama_lengkap: '',
  nomor_ktp: '',
  nomor_hp: '',
  nomor_hp_keluarga: '',
  jenis_kelamin: 'L',
  pekerjaan: '',
  alamat: '',
  no_rek: '',
  atasnama_rekening: '',
  jenis_bank: '',
}

export function useRegistrationForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(registrationDefaults)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = event => {
    setFormData(current => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await register(formData)
      setSuccess('Registrasi berhasil! Silakan tunggu verifikasi admin.')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      const responseData = err.response?.data
      const errors = responseData?.errors
      const errorMessages = errors
        ? Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n')
        : responseData?.message || 'Registrasi gagal'
      setError(errorMessages)
    } finally {
      setLoading(false)
    }
  }

  return { formData, loading, error, success, handleChange, handleSubmit }
}

export function useForgotPasswordForm() {
  const [formData, setFormData] = useState({ username: '', nomor_hp: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async event => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await requestPasswordReset(formData)
      setSuccess(`Password baru: ${response.data.data.new_password}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal reset password')
    } finally {
      setLoading(false)
    }
  }

  return { formData, setFormData, loading, error, success, handleSubmit }
}
