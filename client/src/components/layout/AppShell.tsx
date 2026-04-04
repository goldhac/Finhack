import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#131313] text-[#E2E2E2] font-sans selection:bg-[#0F62FE]/30 selection:text-white relative">
      {/* Side Navigation Shell */}
      <Sidebar />

      {/* Main Content Canvas */}
      <main className="ml-20 pt-24 px-12 pb-16 min-h-screen">
        {children}
      </main>

      {/* Footer Shell */}
      <Footer />
    </div>
  )
}
