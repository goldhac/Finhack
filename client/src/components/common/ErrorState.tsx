import { cn } from '@/lib/utils'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  message = 'Connection fault detected. Retry sequence.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12 text-center',
        className,
      )}
      role="alert"
    >
      <span className="material-symbols-outlined text-4xl text-[#FFB4AB]">
        error_outline
      </span>
      <p className="text-sm text-[#C6C6C6] font-mono max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F62FE] border-b border-[#0F62FE]/30 pb-1 hover:border-[#0F62FE] transition-colors"
        >
          RETRY_SEQUENCE
        </button>
      )}
    </div>
  )
}
