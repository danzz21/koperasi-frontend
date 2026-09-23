import { Navigate, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ClipboardList, LogOut, Sparkles } from 'lucide-react'
import api from '@/lib/api'
import useAuthStore from '@/store/authStore'
import ProfileForm from '@/components/profile/ProfileForm'

const REQUIRED_FIELDS = [
  'nama_lengkap',
  'nomor_ktp',
  'nomor_hp',
  'jenis_kelamin',
  'tgl_lahir',
  'pekerjaan',
  'alamat',
]

const FIELD_LABELS = {
  nama_lengkap: 'Nama lengkap',
  nomor_ktp: 'Nomor KTP',
  nomor_hp: 'Nomor HP',
  jenis_kelamin: 'Jenis kelamin',
  tgl_lahir: 'Tanggal lahir',
  pekerjaan: 'Pekerjaan',
  alamat: 'Alamat',
}

/**
 * Onboarding anggota (mis. habis login Google).
 *
 * Semua fitur anggota diblokir backend selama data belum lengkap, jadi halaman
 * ini adalah satu-satunya yang bisa diakses sampai form disubmit.
 */
export default function OnboardingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, setUser, logout } = useAuthStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['anggota-onboarding'],
    queryFn: () => api.get('/anggota/onboarding').then((res) => res.data),
    retry: 0,
  })

  // Sudah lengkap (mis. state localStorage kedaluwarsa) → langsung ke dasbor
  if (data && data.needs_onboarding === false) {
    return <Navigate to="/anggota/dashboard" replace />
  }

  // Bukan anggota → tidak berhak di halaman ini
  if (user && user.role !== 'anggota') {
    return <Navigate to="/login" replace />
  }

  const missingFields = data?.missing_fields ?? REQUIRED_FIELDS

  const handleSubmit = async (payload) => {
    const { data: result } = await api.post('/anggota/onboarding', payload)

    setUser(result.user)
    queryClient.setQueryData(['anggota-onboarding'], (prev) => ({
      ...prev,
      user: result.user,
      needs_onboarding: false,
    }))
    queryClient.invalidateQueries({ queryKey: ['anggota-profil'] })

    navigate('/anggota/dashboard', { replace: true })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50/40">
        <div className="spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-emerald-50/40 p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <p className="font-bold text-gray-800">Gagal memuat data</p>
        <p className="text-sm text-gray-500">
          {error?.response?.data?.message || 'Coba muat ulang halaman ini.'}
        </p>
        <button onClick={handleLogout} className="btn-outline max-w-xs">
          Keluar
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-emerald-50/40 pb-10">
      {/* Header */}
      <header className="member-profile-header">
        <div className="member-profile-top">
          <h1>Lengkapi Data</h1>
          <button
            onClick={handleLogout}
            className="rounded-full bg-white/20 p-2 hover:bg-white/30"
            title="Keluar"
          >
            <LogOut size={19} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h2 className="!text-lg">Halo, {data?.user?.nama || user?.nama || 'Anggota'} 👋</h2>
          <p className="mt-1 max-w-xs text-sm">
            Sebelum memakai fitur koperasi, lengkapi data keanggotaan Anda terlebih dahulu.
          </p>
        </div>
      </header>

      <div className="px-4 py-4">
        {/* Info kelengkapan */}
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
            <Sparkles className="h-4 w-4" />
            {missingFields.length} data masih perlu diisi
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {missingFields.map((field) => (
              <li
                key={field}
                className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-700"
              >
                {FIELD_LABELS[field] || field}
              </li>
            ))}
          </ul>
        </div>

        <ProfileForm
          initialValues={data?.profile}
          requiredFields={REQUIRED_FIELDS}
          missingFields={missingFields}
          onSubmit={handleSubmit}
          submitLabel="Simpan & Lanjutkan"
          passwordHint="Buat password agar Anda juga bisa masuk tanpa akun Google."
        />

        <p className="mt-4 text-center text-xs text-gray-400">
          Nomor anggota Anda: <strong>{data?.profile?.nomor_anggota}</strong>
        </p>
      </div>
    </div>
  )
}
