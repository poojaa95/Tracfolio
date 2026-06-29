import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, FileText,
  MessageSquare, Code2, BarChart3, X,
  LogOut, Settings, ChevronUp
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
  { label: 'Applications', icon: Briefcase, path: ROUTES.APPLICATIONS },
  { label: 'Resumes', icon: FileText, path: ROUTES.RESUMES },
  { label: 'Interview Questions', icon: MessageSquare, path: ROUTES.QUESTIONS },
  { label: 'LeetCode', icon: Code2, path: ROUTES.LEETCODE },
  { label: 'Analytics', icon: BarChart3, path: ROUTES.ANALYTICS },
]

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user?.name?.charAt(0).toUpperCase()

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-gray-200
        flex flex-col transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Tracfolio</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ROUTES.DASHBOARD}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
              transition-colors duration-150
              ${isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User profile at bottom */}
      <div className="p-3 border-t border-gray-200 flex-shrink-0" ref={profileRef}>
        {/* Profile popover */}
        {profileMenuOpen && (
          <div className="mb-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1 animate-slide-up">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Settings
                <span className="ml-auto text-xs text-gray-400">Soon</span>
              </button>
              <button
                onClick={() => { setProfileMenuOpen(false); logout() }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Profile button */}
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.name}
              className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-700 text-xs font-semibold">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <ChevronUp className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar