import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import {
  CreditCard,
  Download,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt,
  Building,
  Zap,
  XCircle,
  Shield,
  ExternalLink,
  Mail,
  Info,
  Lock
} from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  status: string
  createdAt: string
  paidAt: string | null
  dueDate: string | null
  receiptUrl?: string
}

interface Subscription {
  id: string
  planType: string
  status: string
  paymentMethod: string
  basePrice: number
  discountPercent: number
  finalPrice: number
  autoRenewal: boolean
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAt: string | null
  invoices: Invoice[]
}

export default function BillingManagement() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [planChangeDialogOpen, setPlanChangeDialogOpen] = useState(false)
  const [changingPlan, setChangingPlan] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSubscription()
    }
  }, [isAuthenticated, user])

  const fetchSubscription = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/billing/subscription?organizationId=${user.organization.id}`)
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async (immediate: boolean) => {
    if (!subscription || !user) return
    setCanceling(true)

    try {
      const res = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          userId: user.id,
          immediate
        })
      })

      if (res.ok) {
        const data = await res.json()
        alert(data.message)
        setCancelDialogOpen(false)
        fetchSubscription()
      } else {
        const data = await res.json()
        alert(data.error || '解約に失敗しました')
      }
    } catch (error) {
      console.error('Cancel error:', error)
      alert('解約に失敗しました')
    } finally {
      setCanceling(false)
    }
  }

  const handlePlanChange = async (newPlan: 'EXPERT' | 'STANDARD') => {
    if (!subscription || !user) return
    setChangingPlan(true)

    try {
      const res = await fetch('/api/billing/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          userId: user.id,
          newPlan
        })
      })

      if (res.ok) {
        const data = await res.json()
        alert(data.message)
        setPlanChangeDialogOpen(false)
        fetchSubscription()
      } else {
        const data = await res.json()
        alert(data.error || 'プラン変更に失敗しました')
      }
    } catch (error) {
      console.error('Plan change error:', error)
      alert('プラン変更に失敗しました')
    } finally {
      setChangingPlan(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP').format(price)
  }

  const getPlanName = (planType: string) => {
    return planType === 'EXPERT' ? 'エキスパートプラン' : 'スタンダードプラン'
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'CARD':
        return 'クレジットカード'
      case 'BANK_TRANSFER':
        return '銀行振込'
      case 'CONVENIENCE_STORE':
        return 'コンビニ決済'
      default:
        return method
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            アクティブ
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            支払い待ち
          </Badge>
        )
      case 'CANCELLED':
        return (
          <Badge className="bg-slate-100 text-slate-700">
            <XCircle className="h-3 w-3 mr-1" />
            解約済み
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            支払済み
          </Badge>
        )
      case 'open':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            未払い
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  // 空状態（12-2, 12-3）
  if (!subscription) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* タイトル（12-1） */}
          <div>
            <h2 className="text-2xl font-bold">請求・支払い</h2>
            <p className="text-slate-600">契約内容・支払状況・請求履歴を確認</p>
          </div>

          {/* 管理者限定表示（12-7） */}
          {!isAdmin && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <Lock className="h-5 w-5" />
                  <span>※ 契約・請求情報は管理者のみ閲覧・操作できます</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 空状態3ブロック（12-2） */}
          <Card>
            <CardContent className="py-12">
              <div className="text-center max-w-md mx-auto">
                {/* ブロック1: 状態 */}
                <Receipt className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  契約情報がありません
                </h3>

                {/* ブロック2: 補足 */}
                <p className="text-slate-500 mb-6">
                  プレミア購読に加入すると、セミナー・アーカイブ・データブックなど
                  すべてのコンテンツにアクセスできます。
                </p>

                {/* ブロック3: 行動導線（12-3） */}
                <Button asChild size="lg">
                  <Link href="/pricing">
                    契約手続きへ
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                </Button>

                {/* 注意文（12-3） */}
                <p className="text-xs text-slate-400 mt-4">
                  ※ 契約手続きは組織の管理者のみ行えます
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 外部決済明示（12-4） */}
          <Card className="bg-slate-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-slate-500" />
                <div className="text-sm text-slate-600">
                  <span className="font-medium">安全な決済サービスを利用しています</span>
                  <span className="ml-2">（Stripe による決済処理）</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 問い合わせ導線（12-8） */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4" />
                  <span>契約・請求に関するお問い合わせ</span>
                </div>
                <Button variant="link" asChild className="p-0 h-auto">
                  <a href="mailto:premium@the-reform.co.jp">
                    premium@the-reform.co.jp
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const daysRemaining = Math.ceil(
    (new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー（12-1） */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">請求・支払い</h2>
            <p className="text-slate-600">契約内容・支払状況・請求履歴を確認</p>
          </div>
          {subscription.status === 'ACTIVE' && !subscription.cancelAt && isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => setPlanChangeDialogOpen(true)}
              >
                コースを変更
              </Button>
              <Button variant="outline" onClick={() => setCancelDialogOpen(true)}>
                契約を解約
              </Button>
            </div>
          )}
        </div>

        {/* 管理者限定明示（12-7） */}
        {!isAdmin && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Lock className="h-5 w-5" />
                <span>※ 契約・請求情報は管理者のみ変更できます（閲覧のみ可能）</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 契約情報（12-5, 12-9レイアウト最適化） */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 現在のプラン */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">現在のプラン</CardTitle>
                {getStatusBadge(subscription.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {getPlanName(subscription.planType)}
                    </h3>
                    <p className="text-sm text-slate-600">
                      ¥{formatPrice(subscription.finalPrice)} / 年
                      {subscription.discountPercent > 0 && (
                        <span className="ml-2 text-red-500">
                          ({subscription.discountPercent}% OFF)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* 契約情報プレースホルダ（12-5） */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">状況</p>
                  <p className="font-medium text-sm">
                    {subscription.status === 'ACTIVE' ? 'アクティブ' : subscription.status}
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">開始日</p>
                  <p className="font-medium text-sm">{formatDate(subscription.currentPeriodStart)}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">更新日</p>
                  <p className="font-medium text-sm">{formatDate(subscription.currentPeriodEnd)}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">支払方法</p>
                  <p className="font-medium text-sm">{getPaymentMethodName(subscription.paymentMethod)}</p>
                </div>
              </div>

              {subscription.cancelAt && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">解約予定</p>
                      <p className="text-sm text-yellow-700">
                        この契約は {formatDate(subscription.cancelAt)} に解約されます。
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* サイドカード */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-1">契約残り日数</p>
                  <p className="text-4xl font-bold text-blue-600">{daysRemaining}</p>
                  <p className="text-sm text-slate-500">日</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium">自動更新</span>
                </div>
                <Badge variant={subscription.autoRenewal ? 'default' : 'outline'}>
                  {subscription.autoRenewal ? '有効' : '無効'}
                </Badge>
                <p className="text-xs text-slate-500 mt-2">
                  {subscription.autoRenewal
                    ? `${formatDate(subscription.currentPeriodEnd)} に自動更新`
                    : '手動で更新が必要です'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 外部決済明示（12-4） */}
        <Card className="bg-slate-50">
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div className="text-sm text-slate-600">
                <span className="font-medium text-green-700">安全な決済サービスを利用</span>
                <span className="ml-2">- Stripe による決済処理で、カード情報は当社サーバーに保存されません</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 請求履歴（12-6） */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">請求履歴</CardTitle>
                <CardDescription>過去の請求書と支払い状況</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {subscription.invoices.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p>請求履歴はありません</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">請求書番号</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">発行日</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">金額</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">ステータス</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">領収書</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscription.invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="font-medium text-sm">{invoice.invoiceNumber}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{formatDate(invoice.createdAt)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">¥{formatPrice(invoice.amount)}</span>
                        </td>
                        <td className="py-3 px-4">
                          {getInvoiceStatusBadge(invoice.status)}
                        </td>
                        <td className="py-3 px-4">
                          {invoice.status === 'paid' && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={invoice.receiptUrl || '#'} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1" />
                                領収書
                              </a>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 問い合わせ導線（12-8） */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4" />
                <span>契約・請求に関するお問い合わせ</span>
              </div>
              <Button variant="link" asChild className="p-0 h-auto">
                <a href="mailto:premium@the-reform.co.jp">
                  premium@the-reform.co.jp
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>契約を解約しますか？</DialogTitle>
            <DialogDescription>
              解約方法を選択してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">契約期間終了時に解約</h4>
              <p className="text-sm text-slate-600">
                {formatDate(subscription.currentPeriodEnd)} まで引き続きサービスをご利用いただけます。
              </p>
              <Button
                className="mt-3"
                variant="outline"
                onClick={() => handleCancelSubscription(false)}
                disabled={canceling}
              >
                契約期間終了時に解約
              </Button>
            </div>
            <div className="p-4 border border-red-200 rounded-lg">
              <h4 className="font-medium mb-2 text-red-700">今すぐ解約</h4>
              <p className="text-sm text-slate-600">
                即時解約します。サービスは直ちに利用できなくなります。返金はございません。
              </p>
              <Button
                className="mt-3"
                variant="destructive"
                onClick={() => handleCancelSubscription(true)}
                disabled={canceling}
              >
                今すぐ解約
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Change Dialog */}
      <Dialog open={planChangeDialogOpen} onOpenChange={setPlanChangeDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>コースを変更</DialogTitle>
            <DialogDescription>
              現在のコース: {getPlanName(subscription?.planType || '')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {subscription?.planType === 'STANDARD' ? (
              // スタンダード→エキスパートへのアップグレード
              <div className="p-4 border-2 border-purple-200 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-800">エキスパートコースにアップグレード</h4>
                </div>
                <p className="text-sm text-purple-700 mb-3">
                  全機能 + コミュニティ + データブックが利用可能になります
                </p>
                <div className="bg-white p-3 rounded-lg mb-3">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">差額のお支払い</span>
                    <br />
                    残り契約期間に応じた差額（¥110,000の日割り相当）をお支払いいただきます。
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-700 mb-3">
                  <CheckCircle className="h-4 w-4" />
                  <span>即時反映されます</span>
                </div>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => handlePlanChange('EXPERT')}
                  disabled={changingPlan}
                >
                  {changingPlan ? '処理中...' : 'エキスパートにアップグレード'}
                </Button>
              </div>
            ) : (
              // エキスパート→スタンダードへのダウングレード
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-5 w-5 text-slate-600" />
                  <h4 className="font-semibold">スタンダードコースに変更</h4>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  コミュニティ・データブックは利用できなくなります
                </p>
                <div className="bg-amber-50 p-3 rounded-lg mb-3 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    <span className="font-medium">次回更新時に反映</span>
                    <br />
                    現在の契約期間終了後（{formatDate(subscription?.currentPeriodEnd || '')}）に変更が反映されます。
                    それまでは引き続きエキスパートコースをご利用いただけます。
                  </p>
                </div>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handlePlanChange('STANDARD')}
                  disabled={changingPlan}
                >
                  {changingPlan ? '処理中...' : '次回更新時にスタンダードに変更'}
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanChangeDialogOpen(false)}>
              キャンセル
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
