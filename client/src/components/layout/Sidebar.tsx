import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: 'home',      label: 'Home',  to: '/' },
  { icon: 'analytics', label: 'Data',  to: '/dashboard' },
  { icon: 'insights',  label: 'Alpha', to: '/portfolio' },
  { icon: 'science',   label: 'Sim',   to: '/scenarios' },
  { icon: 'forum',     label: 'Chat',  to: '/chat' },
]

export function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-20 flex flex-col items-center py-8 z-40 bg-[#131313] border-r border-[#474747]/15">
      <div className="flex flex-col gap-8 items-center w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'group flex flex-col items-center gap-1 cursor-pointer w-full py-4 transition-all duration-100 ease-linear',
                isActive
                  ? 'bg-[#1F1F1F] text-[#0F62FE] border-r-2 border-[#0F62FE]'
                  : 'text-[#C6C6C6] opacity-50 hover:opacity-100 hover:bg-[#1B1B1B]'
              )}
            >
              <span
                className="material-symbols-outlined"
                style={
                  isActive
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {item.icon}
              </span>
              <span className="font-['Inter'] font-light text-[9px] tracking-widest uppercase">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>

      <div className="mt-auto flex flex-col gap-6 items-center w-full">
        <span className="material-symbols-outlined text-[#474747] hover:text-[#0F62FE] cursor-pointer transition-colors">
          menu_book
        </span>
        <span className="material-symbols-outlined text-[#474747] hover:text-[#0F62FE] cursor-pointer transition-colors">
          contact_support
        </span>
        <div className="w-8 h-8 bg-[#2A2A2A] flex items-center justify-center">
          <span className="text-[8px] font-bold text-[#C6C6C6]">001</span>
        </div>
      </div>
    </aside>
  )
}
