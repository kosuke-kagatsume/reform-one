import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

type StatCardVariant = 'default' | 'warning' | 'danger' | 'success'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  description?: string
  icon?: LucideIcon
  iconColor?: string
  variant?: StatCardVariant
  href?: string
  onClick?: () => void
  hoverHint?: string
  /** Simple badge text displayed in the card */
  cta?: string
  /** Action button with onClick handler */
  ctaAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const variantStyles: Record<StatCardVariant, string> = {
  default: 'bg-white border-slate-200',
  warning: 'bg-amber-50 border-amber-200',
  danger: 'bg-red-50 border-red-200',
  success: 'bg-green-50 border-green-200',
}

const variantIconBg: Record<StatCardVariant, string> = {
  default: 'bg-slate-100',
  warning: 'bg-amber-100',
  danger: 'bg-red-100',
  success: 'bg-green-100',
}

export function StatCard({
  title,
  value,
  subtitle,
  description,
  icon: Icon,
  iconColor,
  variant = 'default',
  href,
  onClick,
  hoverHint,
  cta,
  ctaAction,
  className,
}: StatCardProps) {
  const isClickable = href || onClick

  const ctaBadgeStyles: Record<StatCardVariant, string> = {
    default: 'bg-slate-100 text-slate-700',
    warning: 'bg-amber-200 text-amber-800',
    danger: 'bg-red-200 text-red-800',
    success: 'bg-green-200 text-green-800',
  }

  const cardContent = (
    <>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={cn(
            'p-2 rounded-lg',
            variantIconBg[variant]
          )}>
            <Icon className={cn('h-5 w-5', iconColor || 'text-slate-600')} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{value}</span>
            {subtitle && (
              <span className="text-sm text-slate-500">{subtitle}</span>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-0.5">{title}</p>
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
        </div>
        {cta && (
          <span className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            ctaBadgeStyles[variant]
          )}>
            {cta}
          </span>
        )}
      </div>
      {ctaAction && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            ctaAction.onClick()
          }}
          className="mt-3 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {ctaAction.label}
        </button>
      )}
      {isClickable && hoverHint && (
        <div className="absolute inset-x-0 bottom-0 h-0 overflow-hidden group-hover:h-6 transition-all duration-200 bg-slate-100/80 flex items-center justify-center">
          <span className="text-xs text-slate-600">{hoverHint}</span>
        </div>
      )}
    </>
  )

  const baseStyles = cn(
    'relative rounded-lg border p-4 shadow-sm transition-all duration-200',
    variantStyles[variant],
    isClickable && 'cursor-pointer hover:shadow-md hover:border-slate-300 group',
    className
  )

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        {cardContent}
      </Link>
    )
  }

  if (onClick) {
    return (
      <div onClick={onClick} className={baseStyles}>
        {cardContent}
      </div>
    )
  }

  return <div className={baseStyles}>{cardContent}</div>
}

interface StatCardGridProps {
  children: React.ReactNode
  className?: string
}

export function StatCardGrid({ children, className }: StatCardGridProps) {
  return (
    <div className={cn(
      'grid gap-4 sm:grid-cols-2 lg:grid-cols-4',
      className
    )}>
      {children}
    </div>
  )
}
