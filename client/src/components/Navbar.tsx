import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, QrCode, LayoutDashboard, LogOut, ChevronDown, Zap } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const { user, isLoading: authLoading, logout } = useAuth()
  const { pathname } = useLocation()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => pathname === path

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <QrCode className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
              QR<span className="text-brand-600 dark:text-brand-400">io</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/gerador-qr-code" active={isActive('/gerador-qr-code')}>Gerador</NavLink>
            <NavLink to="/gerador-qr-code-pix" active={isActive('/gerador-qr-code-pix')}>Pix</NavLink>
            <NavLink to="/gerador-qr-code-whatsapp" active={isActive('/gerador-qr-code-whatsapp')}>WhatsApp</NavLink>
            <NavLink to="/gerador-qr-code-wifi" active={isActive('/gerador-qr-code-wifi')}>Wi-Fi</NavLink>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Alternar tema"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {authLoading ? (
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-brand-700 dark:text-brand-400">
                      {user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      <p className="text-xs font-medium text-brand-600 dark:text-brand-400 capitalize mt-0.5">
                        Plano {user.plan}
                      </p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Meus QR Codes
                    </Link>
                    {user.plan !== 'pro' && (
                      <Link
                        to="/assinar-pro"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors font-medium"
                      >
                        <Zap className="w-4 h-4" />
                        Assinar Pro
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setShowUserMenu(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  Entrar
                </button>
                <Link
                  to="/gerador-qr-code"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
                >
                  Criar QR Code
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  )
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
      }`}
    >
      {children}
    </Link>
  )
}
