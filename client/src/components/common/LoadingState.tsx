import { cn } from '@/lib/utils'

interface LoadingStateProps {
  rows?: number
  className?: string
}

export function LoadingState({ rows = 3, className }: LoadingStateProps) {
  return (
    <div
      className={cn('w-full space-y-4 py-4', className)}
      aria-label="Loading"
      role="status"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-3 dark-skeleton',
            i === 0 ? 'w-3/4' : i % 2 === 0 ? 'w-full' : 'w-5/6'
          )}
        />
      ))}
    </div>
  )
}
