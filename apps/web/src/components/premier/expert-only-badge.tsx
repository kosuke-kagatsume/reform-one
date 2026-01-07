import { Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ExpertOnlyBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ExpertOnlyBadge({ className = '', size = 'md' }: ExpertOnlyBadgeProps) {
  const sizeStyles = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  }

  return (
    <Badge
      variant="secondary"
      className={`bg-purple-100 text-purple-700 hover:bg-purple-100 ${sizeStyles[size]} ${className}`}
    >
      <Crown className={`${iconSizes[size]} mr-1`} />
      エキスパート限定
    </Badge>
  )
}
