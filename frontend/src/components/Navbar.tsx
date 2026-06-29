import { useState, useRef, useEffect } from 'react'
import { Menu, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface NavbarProps {
  onMenuClick: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Empty space on desktop */}
      <div className="hidden lg:block" />

      {/* Right side — user menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {user?.profile_picture ? (
            <img
                src={user.profile_picture}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover"
                referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-brand-700 text-xs font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="hidden sm:block text-sm font-medium text-gray-700">
            {user?.name}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50 animate-fade-in">
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  logout()
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar