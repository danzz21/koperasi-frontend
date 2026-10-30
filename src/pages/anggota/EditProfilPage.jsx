import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import ProfileForm from '@/components/profile/ProfileForm'
import { useProfile, useProfileUpdate } from '@/hooks/useMemberData'

const REQUIRED_FIELDS = [
  'nama_lengkap',
  'nomor_ktp',
  'nomor_hp',
  'jenis_kelamin',
  'tgl_lahir',
  'pekerjaan',
  'alamat',
]

/** Halaman edit profil anggota (setelah onboarding selesai). */
export default function EditProfilPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  const { data: profil, isLoading } = useProfile()
  const updateMutation = useProfileUpdate({
    onSuccess: ({ user }) => {
      if (user) setUser(user)
      navigate('/anggota/profil', { replace: true })
    },
  })

  const handleSubmit = payload => updateMutation.mutateAsync(payload)

  if (isLoading) {
    return <div className="p-6 text-center text-sm text-gray-500">Memuat data...</div>
  }

  return (
    <div className="min-h-screen bg-emerald-50/40" style={{ paddingBottom: '90px' }}>
      <header className="member-profile-header">
        <div className="member-profile-top">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full bg-white/20 p-2 hover:bg-white/30"
            aria-label="Kembali"
          >
            <ChevronLeft size={19} />
          </button>
          <h1>Edit Profil</h1>
          <span className="w-[35px]" />
        </div>
      </header>

      <div className="px-4 py-4">
        <ProfileForm
          initialValues={profil}
          requiredFields={REQUIRED_FIELDS}
          onSubmit={handleSubmit}
          submitLabel="Simpan Perubahan"
        />
      </div>
    </div>
  )
}
