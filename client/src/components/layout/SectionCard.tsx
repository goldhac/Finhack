import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  title: string
  children: ReactNode
  className?: string
  action?: ReactNode
}

export function SectionCard({ title, children, className, action }: SectionCardProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-[#0F62FE]" />
          <h3 className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-white uppercase">
            {title}
          </h3>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="relative w-full">
        {children}
      </div>
    </div>
  )
}
