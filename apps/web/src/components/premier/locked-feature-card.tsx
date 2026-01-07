import { Lock, Crown, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface LockedFeatureCardProps {
  title: string
  description?: string
  featureName?: string
  className?: string
  showUpgradeButton?: boolean
}

export function LockedFeatureCard({
  title,
  description,
  featureName,
  className = '',
  showUpgradeButton = true
}: LockedFeatureCardProps) {
  return (
    <Card className={`border-dashed border-slate-300 bg-slate-50/50 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-slate-500 mb-4 max-w-md">{description}</p>
        )}
        <div className="flex items-center gap-2 text-purple-600 mb-4">
          <Crown className="h-4 w-4" />
          <span className="text-sm font-medium">
            {featureName ? `${featureName}はエキスパートプラン限定です` : 'エキスパートプラン限定機能'}
          </span>
        </div>
        {showUpgradeButton && (
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/dashboard/billing?upgrade=expert">
              エキスパートプランにアップグレード
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
