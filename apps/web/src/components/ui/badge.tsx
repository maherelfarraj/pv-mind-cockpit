import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const intentClasses = {
  active: 'bg-emerald-500/15 text-emerald-200',
  review: 'bg-amber-500/15 text-amber-200',
  draft: 'bg-slate-500/20 text-slate-200',
  high: 'bg-rose-500/15 text-rose-200',
  medium: 'bg-amber-500/15 text-amber-200',
  low: 'bg-sky-500/15 text-sky-200'
} as const

export function Badge({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', className)} {...props}>{children}</span>
}

export function IntentBadge({ intent, className, children }: HTMLAttributes<HTMLSpanElement> & { intent: keyof typeof intentClasses }) {
  return <Badge className={cn(intentClasses[intent], className)}>{children}</Badge>
}
