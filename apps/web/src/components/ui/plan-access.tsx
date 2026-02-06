import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Lock, Crown, Sparkles, Check, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { PlanType, PLAN_FEATURES } from '@/types/premier'

// E-3: プラン判定ユーティリティ
export type FeatureKey = 'seminar' | 'archive' | 'tools' | 'community' | 'databook' | 'newsletter' | 'site-visit' | 'qualification'

export function canAccessFeature(planType: PlanType | null, feature: FeatureKey, isReformCompany: boolean = false): boolean {
  // リフォーム産業新聞社は全てアクセス可能
  if (isReformCompany) return true

  if (!planType) return false

  const features = PLAN_FEATURES[planType] || []
  return features.includes(feature)
}

export function getRequiredPlan(feature: FeatureKey): PlanType {
  if (PLAN_FEATURES.STANDARD.includes(feature)) {
    return 'STANDARD'
  }
  return 'EXPERT'
}

// E-1: ExpertOnlyBadge コンポーネント
interface ExpertOnlyBadgeProps {
  className?: string
  size?: 'sm' | 'md'
}

export function ExpertOnlyBadge({ className = '', size = 'md' }: ExpertOnlyBadgeProps) {
  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-xs px-2.5 py-1'

  return (
    <Badge
      variant="expert"
      className={`${sizeClasses} inline-flex items-center gap-1 ${className}`}
    >
      <Crown className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      エキスパート限定
    </Badge>
  )
}

// E-4: UpgradeModal コンポーネント
interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  featureName?: string
}

export function UpgradeModal({ open, onOpenChange, featureName }: UpgradeModalProps) {
  const expertFeatures = [
    'オンラインコミュニティ参加',
    'データブックダウンロード',
    '編集長ニュースレター',
    '視察会 2名まで無料',
    '資格受講権 1名分無料',
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            エキスパートプランにアップグレード
          </DialogTitle>
          <DialogDescription>
            {featureName
              ? `「${featureName}」はエキスパートプラン限定の機能です。`
              : 'より多くの機能をご利用いただけます。'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">エキスパートプランの特典</h4>
            <ul className="space-y-2">
              {expertFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-purple-800">
                  <Check className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              ¥220,000<span className="text-sm font-normal text-slate-500">/年（税込）</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ※ 既存購読者は22,000円引き
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            onClick={() => {
              // 請求・支払いページへ遷移
              window.location.href = '/dashboard/billing'
            }}
          >
            アップグレードする
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            あとで検討する
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// E-2: LockedFeatureCard コンポーネント
interface LockedFeatureCardProps {
  title: string
  description: string
  featureName?: string
  className?: string
  compact?: boolean
}

export function LockedFeatureCard({
  title,
  description,
  featureName,
  className = '',
  compact = false
}: LockedFeatureCardProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  if (compact) {
    return (
      <>
        <div className={`bg-slate-50 border border-slate-200 rounded-lg p-4 ${className}`}>
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
              <Lock className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-slate-700 truncate">{title}</h4>
                <ExpertOnlyBadge size="sm" />
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">{description}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="flex-shrink-0 text-purple-600 border-purple-200 hover:bg-purple-50"
              onClick={() => setShowUpgradeModal(true)}
            >
              詳細
            </Button>
          </div>
        </div>
        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
          featureName={featureName || title}
        />
      </>
    )
  }

  return (
    <>
      <div className={`bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6 text-center ${className}`}>
        <div className="mx-auto h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-slate-400" />
        </div>

        <ExpertOnlyBadge className="mb-3" />

        <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">{description}</p>

        <Button
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          onClick={() => setShowUpgradeModal(true)}
        >
          <Crown className="h-4 w-4 mr-2" />
          エキスパートプランで利用可能
        </Button>
      </div>
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        featureName={featureName || title}
      />
    </>
  )
}

// フック: useFeatureAccess
export function useFeatureAccess() {
  const { planType, user } = useAuth()
  const isReformCompany = user?.organization?.type === 'REFORM_COMPANY'

  return {
    canAccess: (feature: FeatureKey) => canAccessFeature(planType, feature, isReformCompany),
    isExpert: planType === 'EXPERT',
    isStandard: planType === 'STANDARD',
    isReformCompany,
    planType,
  }
}
