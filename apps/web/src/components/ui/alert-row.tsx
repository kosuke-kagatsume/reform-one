import * as React from 'react'
import { cn } from '@/lib/utils'

type AlertLevel = 'none' | 'warning' | 'danger' | 'inactive'

interface AlertRowProps extends React.HTMLAttributes<HTMLDivElement> {
  alertLevel?: AlertLevel
  children: React.ReactNode
}

const alertStyles: Record<AlertLevel, string> = {
  none: 'bg-white hover:bg-slate-50',
  warning: 'bg-amber-50 hover:bg-amber-100/70',
  danger: 'bg-red-50 hover:bg-red-100/70',
  inactive: 'bg-slate-100 opacity-60',
}

export function AlertRow({
  alertLevel = 'none',
  children,
  className,
  ...props
}: AlertRowProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 p-4 transition-colors duration-200',
        alertStyles[alertLevel],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface AlertTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  alertLevel?: AlertLevel
  children: React.ReactNode
}

const alertTableStyles: Record<AlertLevel, string> = {
  none: 'hover:bg-slate-50',
  warning: 'bg-amber-50 hover:bg-amber-100/70',
  danger: 'bg-red-50 hover:bg-red-100/70',
  inactive: 'bg-slate-100 opacity-60',
}

export function AlertTableRow({
  alertLevel = 'none',
  children,
  className,
  ...props
}: AlertTableRowProps) {
  return (
    <tr
      className={cn(
        'border-b transition-colors',
        alertTableStyles[alertLevel],
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

export function getAlertLevelFromDays(
  daysSinceLogin: number | null,
  warningThreshold: number = 30,
  dangerThreshold: number = 60
): AlertLevel {
  if (daysSinceLogin === null) return 'danger'
  if (daysSinceLogin >= dangerThreshold) return 'danger'
  if (daysSinceLogin >= warningThreshold) return 'warning'
  return 'none'
}

export function getAlertLevelFromCount(
  count: number,
  warningThreshold: number = 1,
  dangerThreshold: number = 0
): AlertLevel {
  if (count <= dangerThreshold) return 'danger'
  if (count <= warningThreshold) return 'warning'
  return 'none'
}

export function formatDaysSinceLogin(
  lastLoginAt: Date | string | null,
  registeredAt?: Date | string | null
): { text: string; days: number | null } {
  if (!lastLoginAt) {
    if (registeredAt) {
      const days = Math.floor(
        (Date.now() - new Date(registeredAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      return { text: `登録から${days}日未ログイン`, days: null }
    }
    return { text: '未ログイン', days: null }
  }

  const days = Math.floor(
    (Date.now() - new Date(lastLoginAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  if (days === 0) return { text: '今日', days: 0 }
  if (days === 1) return { text: '昨日', days: 1 }
  return { text: `${days}日前`, days }
}
