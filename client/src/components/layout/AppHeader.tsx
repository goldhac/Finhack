import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/',          label: 'Home' },
  { to: '/dashboard', label: 'Analytics' },
  { to: '/portfolio', label: 'Strategy' },
  { to: '/scenarios', label: 'Scenarios' },
  { to: '/chat',      label: 'Analyst' },
]

export function AppHeader() {
  const { pathname } = useLocation()

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-12 h-16 border-none bg-gradient-to-b from-[#131313] to-transparent">
      <div className="flex items-center gap-12">
        <Link to="/" className="font-['Space_Grotesk'] text-2xl font-black tracking-[-0.04em] text-white">
          ChainPulse
        </Link>
        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "font-['Space_Grotesk'] tracking-tighter uppercase font-bold text-sm transition-colors duration-100",
                  isActive
                    ? 'text-white border-b-2 border-[#0F62FE] pb-1'
                    : 'text-[#C6C6C6] hover:text-white'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex gap-4 items-center">
          <span className="material-symbols-outlined text-[#C6C6C6] hover:text-white transition-all duration-100 cursor-pointer">
            notifications_active
          </span>
          <span className="material-symbols-outlined text-[#C6C6C6] hover:text-white transition-all duration-100 cursor-pointer">
            settings
          </span>
        </div>
        <Link
          to="/dashboard"
          className="bg-[#0052dd] text-white font-['Space_Grotesk'] text-xs font-bold uppercase tracking-widest px-6 py-2 hover:bg-[#0F62FE] transition-all duration-100 active:scale-95"
        >
          Open Terminal
        </Link>
      </div>
    </header>
  )
}
