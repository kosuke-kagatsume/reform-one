import * as React from 'react'
import { Badge } from './badge'
import { cn } from '@/lib/utils'

type StatusType =
  | 'unused'      // 未使用
  | 'unwatched'   // 未視聴
  | 'dormant'     // 休眠
  | 'unlogged'    // 未ログイン
  | 'active'      // 有効
  | 'expired'     // 期限切れ
  | 'pending'     // 未契約
  | 'expert'      // Expert限定
  | 'standard'    // Standard
  | 'hidden'      // 非公開
  | 'published'   // 公開中
  | 'roleUnset'   // 役割未設定

interface StatusBadgeProps {
  status: StatusType
  className?: string
  showIcon?: boolean
}

const statusConfig: Record<StatusType, {
  label: string
  variant: 'unused' | 'dormant' | 'warning' | 'success' | 'expert' | 'standard' | 'secondary' | 'destructive' | 'default'
}> = {
  unused: { label: '未使用', variant: 'unused' },
  unwatched: { label: '未視聴', variant: 'unused' },
  dormant: { label: '休眠', variant: 'dormant' },
  unlogged: { label: '未ログイン', variant: 'dormant' },
  active: { label: '有効', variant: 'success' },
  expired: { label: '期限切れ', variant: 'destructive' },
  pending: { label: '未契約', variant: 'warning' },
  expert: { label: 'Expert限定', variant: 'expert' },
  standard: { label: 'Standard', variant: 'standard' },
  hidden: { label: '非公開', variant: 'secondary' },
  published: { label: '公開中', variant: 'success' },
  roleUnset: { label: '役割未設定', variant: 'warning' },
}

export function StatusBadge({ status, className, showIcon }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  )
}

interface DaysAgoBadgeProps {
  days: number | null
  warningThreshold?: number
  dangerThreshold?: number
  className?: string
}

export function DaysAgoBadge({
  days,
  warningThreshold = 30,
  dangerThreshold = 60,
  className,
}: DaysAgoBadgeProps) {
  if (days === null) {
    return <Badge variant="dormant" className={className}>未ログイン</Badge>
  }

  const variant =
    days >= dangerThreshold ? 'unused' :
    days >= warningThreshold ? 'dormant' :
    'secondary'

  const label = `${days}日間ログインなし`

  return <Badge variant={variant} className={className}>{label}</Badge>
}

interface ViewCountBadgeProps {
  count: number
  className?: string
}

export function ViewCountBadge({ count, className }: ViewCountBadgeProps) {
  if (count === 0) {
    return <Badge variant="unused" className={className}>未視聴</Badge>
  }
  return null
}

interface UsageCountBadgeProps {
  count: number
  className?: string
}

export function UsageCountBadge({ count, className }: UsageCountBadgeProps) {
  if (count === 0) {
    return <Badge variant="unused" className={className}>未利用</Badge>
  }
  return null
}

interface PlanBadgeProps {
  plan: 'STANDARD' | 'EXPERT' | string
  className?: string
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const variant = plan === 'EXPERT' ? 'expert' : 'standard'
  const label = plan === 'EXPERT' ? 'Expert' : 'Standard'

  return <Badge variant={variant} className={className}>{label}</Badge>
}

interface RoleBadgeProps {
  role: string | null | undefined
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  if (!role) {
    return <Badge variant="warning" className={className}>役割未設定</Badge>
  }
  return <Badge variant="secondary" className={className}>{role}</Badge>
}

interface ContractStatusBadgeProps {
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED' | string
  className?: string
}

export function ContractStatusBadge({ status, className }: ContractStatusBadgeProps) {
  const config: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
    ACTIVE: { label: '有効', variant: 'success' },
    PENDING: { label: '未契約', variant: 'warning' },
    EXPIRED: { label: '期限切れ', variant: 'destructive' },
    CANCELLED: { label: '解約済', variant: 'secondary' },
  }

  const { label, variant } = config[status] || { label: status, variant: 'secondary' as const }

  return <Badge variant={variant} className={className}>{label}</Badge>
}
