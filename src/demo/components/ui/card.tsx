import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-black/8 bg-white/72 shadow-[0_18px_48px_rgba(194,188,210,0.18)] backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  )
}
