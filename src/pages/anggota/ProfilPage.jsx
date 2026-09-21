import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import api from '@/lib/api'
import { usePasskey } from '@/hooks/usePasskey'
import PasskeySetupModal from '@/pages/auth/PasskeySetupModal'
import {
  Edit2,
  Fingerprint,
  Landmark,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react'

export default function ProfilPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { listDevices, removeDevice, supported: passkeySupported } = usePasskey()
  const [showPasskeyModal, setShowPasskeyModal] = useState(false)

  const { data: passkeys = [], refetch: refetchPasskeys } = useQuery({
    queryKey: ['anggota-passkeys'],
    queryFn: listDevices,
    enabled: passkeySupported,
  })

  const handleRemovePasskey = async (id) => {
    if (!confirm('Hapus perangkat ini? Kamu tidak bisa lagi login biometrik dari perangkat tersebut.')) {
      return
    }

    try {
      await removeDevice(id)
      refetchPasskeys()
    } catch {
      alert('Gagal menghapus perangkat. Coba lagi.')
    }
  }

  const { data: profil = {}, isLoading } = useQuery({
    queryKey: ['anggota-profil'],
    queryFn: () => api.get('/anggota/profil').then(r => r.data?.data || {}),
  })

  const handleLogout = async () => {
    if (confirm('Yakin ingin logout?')) {
      await logout()
      navigate('/login')
    }
  }

  if (isLoading) return <div className="p-6 text-center">Loading...</div>

  const firstLetter = (profil.nama_lengkap || user?.nama || 'A').charAt(0).toUpperCase()
  const colors = ['#10b981', '#06b6d4', '#0ea5e9', '#8b5cf6', '#f59e0b']
  const bgColor = colors[(profil.id || 1) % colors.length]

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: '90px' }}>

      {/* Header */}
      <header className="member-profile-header">
        <div className="member-profile-top">
          <h1>Profil Saya</h1>
          <button
            onClick={handleLogout}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full"
            title="Logout"
          >
            <LogOut size={19} />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div
            className="member-profile-avatar"
            style={{ backgroundColor: bgColor }}
          >
            {firstLetter}
          </div>
          <h2>{profil.nama_lengkap || user?.nama}</h2>
          <p className="text-sm opacity-90">ID: {profil.nomor_anggota || user?.username}</p>
        </div>
      </header>

      {/* Edit Button */}
      <div className="px-4 py-3">
        <button
          onClick={() => navigate('/anggota/profil/edit')}
          className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700"
        >
          <Edit2 className="w-5 h-5" />
          Edit Profil
        </button>
      </div>

      {/* Keamanan — passkey (sidik jari / Face ID) */}
      <div className="px-4 py-2">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Keamanan
          </h3>

          <p className="text-sm text-gray-600">
            Masuk tanpa mengetik password memakai sidik jari / Face ID / PIN perangkat.
          </p>

          <button
            type="button"
            onClick={() => setShowPasskeyModal(true)}
            disabled={!passkeySupported}
            className="mt-3 w-full bg-white border border-emerald-200 text-emerald-700 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Fingerprint className="w-5 h-5" />
            Aktifkan di perangkat ini
          </button>

          {!passkeySupported && (
            <p className="mt-2 text-xs text-amber-600">
              Browser/perangkat ini belum mendukung passkey.
            </p>
          )}

          {passkeys.length > 0 && (
            <ul className="mt-4 space-y-2">
              {passkeys.map((device) => (
                <li
                  key={device.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {device.device_name || 'Perangkat'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Terakhir dipakai:{' '}
                      {device.last_used_at
                        ? new Date(device.last_used_at).toLocaleString('id-ID')
                        : '-'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePasskey(device.id)}
                    title="Hapus perangkat"
                    className="shrink-0 rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {passkeySupported && passkeys.length === 0 && (
            <p className="mt-3 text-xs text-gray-400">Belum ada perangkat terdaftar.</p>
          )}
        </div>
      </div>

      {/* Data Pribadi */}
      <div className="px-4 py-2 space-y-3">

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Data Pribadi
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Nama Lengkap</span>
              <span className="font-semibold text-gray-900">{profil.nama_lengkap || '-'}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="text-sm text-gray-600">No. KTP</span>
              <span className="font-semibold text-gray-900">{profil.no_ktp || '-'}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="text-sm text-gray-600">Jenis Kelamin</span>
              <span className="font-semibold text-gray-900">{profil.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan' || '-'}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="text-sm text-gray-600">Tanggal Lahir</span>
              <span className="font-semibold text-gray-900">{profil.tgl_lahir || '-'}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="text-sm text-gray-600">Pekerjaan</span>
              <span className="font-semibold text-gray-900">{profil.pekerjaan || '-'}</span>
            </div>
          </div>
        </div>

        {/* Data Kontak */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-cyan-600" />
            Data Kontak
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-cyan-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">No. HP</p>
                <p className="font-semibold text-gray-900">{profil.no_hp || '-'}</p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-start gap-3">
              <Mail className="w-4 h-4 text-cyan-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">Email</p>
                <p className="font-semibold text-gray-900 break-all">{profil.email || '-'}</p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-cyan-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">Alamat</p>
                <p className="font-semibold text-gray-900">{profil.alamat || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Keuangan */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-600" />
            Data Rekening
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">No. Rekening</span>
              <span className="font-semibold text-gray-900">{profil.no_rek || '-'}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="text-sm text-gray-600">Atas Nama</span>
              <span className="font-semibold text-gray-900">{profil.atasnama_rekening || '-'}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="text-sm text-gray-600">Jenis Bank</span>
              <span className="font-semibold text-gray-900">{profil.jenis_bank || '-'}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="font-semibold text-emerald-600">Aktif</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="text-sm text-gray-600">Tanggal Bergabung</span>
              <span className="font-semibold text-gray-900">{profil.tgl_bergabung || '-'}</span>
            </div>
          </div>
        </div>

      </div>

      {showPasskeyModal && (
        <PasskeySetupModal
          userName={profil.nama_lengkap || user?.nama}
          onClose={() => setShowPasskeyModal(false)}
          onRegistered={refetchPasskeys}
        />
      )}

    </div>
  )
}
