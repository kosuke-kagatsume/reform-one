'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'
import { PlanType } from '@/types/premier'
import { LockedFeatureCard } from './locked-feature-card'

interface PlanGateProps {
  /** 必要なプランタイプ */
  requiredPlan: PlanType
  /** 必要な機能キー（PLAN_FEATURESで定義） */
  feature?: string
  /** 許可されたときに表示するコンテンツ */
  children: ReactNode
  /** ロック時に表示するカスタムコンポーネント */
  fallback?: ReactNode
  /** ロック時のタイトル */
  lockedTitle?: string
  /** ロック時の説明 */
  lockedDescription?: string
  /** ロック時の機能名 */
  featureName?: string
  /** アップグレードボタンを表示するか */
  showUpgradeButton?: boolean
}

export function PlanGate({
  requiredPlan,
  feature,
  children,
  fallback,
  lockedTitle = 'この機能はご利用いただけません',
  lockedDescription,
  featureName,
  showUpgradeButton = true
}: PlanGateProps) {
  const { planType, isReformCompany, hasFeature } = useAuth()

  // リフォーム産業新聞社は全機能アクセス可能
  if (isReformCompany) {
    return <>{children}</>
  }

  // 機能キーでチェック
  if (feature && hasFeature(feature)) {
    return <>{children}</>
  }

  // プランタイプでチェック
  if (requiredPlan === 'STANDARD') {
    // スタンダード以上が必要
    if (planType === 'STANDARD' || planType === 'EXPERT') {
      return <>{children}</>
    }
  } else if (requiredPlan === 'EXPERT') {
    // エキスパートが必要
    if (planType === 'EXPERT') {
      return <>{children}</>
    }
  }

  // カスタムfallbackがあればそれを表示
  if (fallback) {
    return <>{fallback}</>
  }

  // デフォルトのロックカード
  return (
    <LockedFeatureCard
      title={lockedTitle}
      description={lockedDescription}
      featureName={featureName}
      showUpgradeButton={showUpgradeButton}
    />
  )
}

/**
 * エキスパートプラン限定のゲート（ショートハンド）
 */
export function ExpertGate({
  children,
  fallback,
  lockedTitle,
  lockedDescription,
  featureName,
  showUpgradeButton = true
}: Omit<PlanGateProps, 'requiredPlan' | 'feature'>) {
  return (
    <PlanGate
      requiredPlan="EXPERT"
      lockedTitle={lockedTitle}
      lockedDescription={lockedDescription}
      featureName={featureName}
      showUpgradeButton={showUpgradeButton}
      fallback={fallback}
    >
      {children}
    </PlanGate>
  )
}
