import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  LayoutDashboard, TrendingUp, History, Shield, LogOut,
  Moon, Sun, Menu, X, CreditCard, ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/predict',   icon: TrendingUp,      label: 'Predict Score' },
  { to: '/history',   icon: History,         label: 'History' },
]

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const { dark, toggleTheme }     = useTheme()
  const navigate  = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-full' : 'w-64'} flex flex-col h-full`}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <CreditCard size={18} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold gradient-text">CreditIQ</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
               ${isActive
                 ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                 : 'text-gray-400 hover:text-white hover:bg-white/5'}`
            }
          >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
               ${isActive ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'}`
            }
          >
            <Shield size={18} />
            <span className="font-medium">Admin Panel</span>
          </NavLink>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/5 space-y-2">
        <div className="px-4 py-3 glass rounded-xl">
          <p className="text-xs text-gray-500">Logged in as</p>
          <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
          <p className="text-xs text-blue-400 capitalize">{user?.role}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 glass rounded-xl text-gray-400 hover:text-white transition-all text-sm">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 glass rounded-xl text-gray-400 hover:text-red-400 transition-all text-sm">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex glass border-r border-white/5">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 glass">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 glass border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <CreditCard size={16} className="text-white" />
            </div>
            <span className="font-display font-bold gradient-text">CreditIQ</span>
          </div>
          <button onClick={() => setOpen(true)} className="p-2 glass rounded-lg text-gray-400 hover:text-white">
            <Menu size={20} />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
