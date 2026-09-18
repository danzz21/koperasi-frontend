import { Outlet, NavLink } from 'react-router-dom'
import { CalendarCheck, HandCoins, Home, Smartphone, UserRound, Wallet } from 'lucide-react'

const navItems = [
  { to: '/anggota/dashboard', icon: Home, label: 'Beranda' },
  { to: '/anggota/simpanan', icon: Wallet, label: 'Simpan' },
  { to: '/anggota/pinjaman', icon: HandCoins, label: 'Pinjam' },
  { to: '/anggota/cicilan', icon: CalendarCheck, label: 'Cicilan' },
  { to: '/anggota/ppob', icon: Smartphone, label: 'PPOB' },
  { to: '/anggota/profil', icon: UserRound, label: 'Profil' },
]

export default function AnggotaLayout() {
  return (
    <div className="min-h-screen bg-emerald-50/30" style={{ paddingBottom: '80px' }}>
      <Outlet />
      <BottomNav />
    </div>
  )
}

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <item.icon size={18} strokeWidth={2.2} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
