import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
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
  RefreshCw,
  Building,
  Zap,
  XCircle
} from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  status: string
  createdAt: string
  paidAt: string | null
  dueDate: string | null
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
  const { user, isLoading, isAuthenticated } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [canceling, setCanceling] = useState(false)

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  if (!subscription) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">請求・支払い</h2>
            <p className="text-slate-600">サブスクリプションと請求情報を管理</p>
          </div>

          <Card>
            <CardContent className="py-12 text-center">
              <Receipt className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">
                アクティブな契約がありません
              </h3>
              <p className="text-slate-500 mb-4">
                プレミア購読に加入してセミナーやアーカイブにアクセスしましょう
              </p>
              <Button asChild>
                <a href="/pricing">プランを選択</a>
              </Button>
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">請求・支払い</h2>
            <p className="text-slate-600">サブスクリプションと請求情報を管理</p>
          </div>
          {subscription.status === 'ACTIVE' && !subscription.cancelAt && (
            <Button variant="outline" onClick={() => setCancelDialogOpen(true)}>
              契約を解約
            </Button>
          )}
        </div>

        {/* Current Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>現在のプラン</CardTitle>
                  <CardDescription>サブスクリプションの詳細</CardDescription>
                </div>
                {getStatusBadge(subscription.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {getPlanName(subscription.planType)}
                      </h3>
                      <p className="text-sm text-slate-600">
                        ¥{subscription.finalPrice.toLocaleString()} / 年
                        {subscription.discountPercent > 0 && (
                          <span className="ml-2 text-red-500">
                            ({subscription.discountPercent}% OFF)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">契約期間終了</p>
                    <p className="font-semibold">
                      {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-600">組織</span>
                    </div>
                    <p className="font-semibold">{user?.organization.name}</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-600">残り日数</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {daysRemaining}
                      <span className="text-sm text-slate-500 ml-1">日</span>
                    </p>
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
                          それまでは引き続きサービスをご利用いただけます。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>支払い方法</CardTitle>
              <CardDescription>登録済みの支払い方法</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">
                        {getPaymentMethodName(subscription.paymentMethod)}
                      </span>
                    </div>
                    <Badge variant="outline">デフォルト</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">
                      {subscription.autoRenewal ? '自動更新が有効です' : '自動更新は無効です'}
                    </p>
                    <p className="text-xs mt-1">
                      {subscription.autoRenewal
                        ? `${formatDate(subscription.currentPeriodEnd)} に自動的に更新されます`
                        : '契約期間終了後、手動で更新が必要です'}
                    </p>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Invoices */}
        {subscription.invoices.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>請求履歴</CardTitle>
                  <CardDescription>過去の請求書と支払い状況</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                        請求書番号
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                        発行日
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                        金額
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                        ステータス
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                        支払い日
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscription.invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="font-medium text-sm">
                              {invoice.invoiceNumber}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{formatDate(invoice.createdAt)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">
                            ¥{invoice.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {getInvoiceStatusBadge(invoice.status)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">
                            {invoice.paidAt ? formatDate(invoice.paidAt) : '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
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
                即時解約します。サービスは直ちに利用できなくなります。
                返金はございません。
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
    </DashboardLayout>
  )
}
