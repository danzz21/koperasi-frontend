import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, CreditCard, FileText, Smartphone, User } from 'lucide-react'

const BottomNav = () => {
  const navItems = [
    { path: '/anggota/dashboard', icon: Home, label: 'Home' },
    { path: '/anggota/simpanan', icon: CreditCard, label: 'Simpanan' },
    { path: '/anggota/cicilan', icon: FileText, label: 'Cicilan' },
    { path: '/anggota/ppob', icon: Smartphone, label: 'PPOB' },
    { path: '/anggota/profil', icon: User, label: 'Profil' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-full h-full
              ${isActive ? 'text-blue-600' : 'text-gray-500'}
              transition-colors duration-200
            `}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav