'use client'

import { Crown, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

interface UpgradeBannerProps {
  /** バナーのバリアント */
  variant?: 'inline' | 'floating' | 'card'
  /** 閉じるボタンを表示するか */
  dismissible?: boolean
  /** カスタムメッセージ */
  message?: string
  /** クラス名 */
  className?: string
}

export function UpgradeBanner({
  variant = 'inline',
  dismissible = false,
  message,
  className = ''
}: UpgradeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const { planType, isReformCompany } = useAuth()

  // すでにエキスパートプランまたはリフォーム産業新聞社なら非表示
  if (planType === 'EXPERT' || isReformCompany || isDismissed) {
    return null
  }

  const defaultMessage = 'エキスパートプランにアップグレードして、すべての機能をご利用ください'

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-lg p-4 max-w-sm">
          {dismissible && (
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-2 right-2 text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="flex items-start gap-3">
            <Crown className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-2">{message || defaultMessage}</p>
              <Button asChild size="sm" variant="secondary" className="bg-white text-purple-700 hover:bg-purple-50">
                <Link href="/dashboard/billing?upgrade=expert">
                  アップグレード
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 ${className}`}>
        {dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-3 right-3 text-purple-400 hover:text-purple-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 mb-1">エキスパートプラン</h3>
            <p className="text-sm text-purple-700">{message || defaultMessage}</p>
          </div>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 flex-shrink-0">
            <Link href="/dashboard/billing?upgrade=expert">
              アップグレード
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // inline variant (default)
  return (
    <div className={`bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-purple-600" />
          <span className="text-sm text-purple-700">{message || defaultMessage}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
            <Link href="/dashboard/billing?upgrade=expert">
              アップグレード
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
          {dismissible && (
            <button
              onClick={() => setIsDismissed(true)}
              className="text-purple-400 hover:text-purple-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
