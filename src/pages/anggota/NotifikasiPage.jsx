import { Bell, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MemberHeader from '@/components/anggota/MemberHeader'
import { useMarkNotificationRead, useNotifications } from '@/hooks/useNotificationData'

export default function NotifikasiPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useNotifications()
  const markRead = useMarkNotificationRead()
  const notifications = data?.data?.data || []

  const openNotification = async notification => {
    if (!notification.read_at) {
      await markRead.mutateAsync(notification.id)
    }
    if (notification.data?.url) navigate(notification.data.url)
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: '90px' }}>
      <MemberHeader title="Notifikasi" icon={Bell} back />
      <div className="space-y-3 px-4 py-4">
        {isLoading && <p className="text-center text-sm text-gray-500">Memuat notifikasi...</p>}
        {isError && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">Notifikasi belum dapat dimuat.</p>}
        {!isLoading && !isError && notifications.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            <CheckCheck className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
            Belum ada notifikasi.
          </div>
        )}
        {notifications.map(notification => (
          <button
            type="button"
            key={notification.id}
            onClick={() => openNotification(notification)}
            className={`w-full rounded-2xl border p-4 text-left shadow-sm ${notification.read_at ? 'border-gray-100 bg-white' : 'border-emerald-200 bg-emerald-50'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-gray-900">{notification.data?.title || 'Informasi koperasi'}</p>
                <p className="mt-1 text-sm text-gray-600">{notification.data?.message || ''}</p>
                <p className="mt-2 text-xs text-gray-400">{notification.created_at ? new Date(notification.created_at).toLocaleString('id-ID') : ''}</p>
              </div>
              {!notification.read_at && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-600" aria-label="Belum dibaca" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
