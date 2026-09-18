import { Bell, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

const avatarColors = ['#10b981', '#06b6d4', '#0ea5e9', '#8b5cf6', '#f59e0b']

export default function MemberHeader({ title, icon: Icon, back = false, notification = false }) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const name = user?.nama || user?.nama_lengkap || 'Anggota'
  const firstLetter = name.charAt(0).toUpperCase()
  const color = avatarColors[(user?.id || 1) % avatarColors.length]

  return (
    <header className="member-header">
      <div className="member-header-content">
        {back ? (
          <button
            type="button"
            className="member-header-action"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
          >
            <ChevronLeft size={21} />
          </button>
        ) : Icon ? (
          <Icon size={21} strokeWidth={2.2} />
        ) : (
          <div
            className="member-avatar"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          >
            {firstLetter}
          </div>
        )}

        <div className={back || Icon ? 'member-header-title' : 'member-profile-copy'}>
          <h1>{title || name}</h1>
          {!back && !Icon && <p>ID: {user?.username || user?.nomor_anggota || '-'}</p>}
        </div>

        <button
          type="button"
          className="member-header-action"
          aria-label="Notifikasi"
          onClick={() => notification && navigate('/anggota/cicilan')}
        >
          <Bell size={19} />
        </button>
      </div>
    </header>
  )
}
