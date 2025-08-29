import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Download,
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Receipt,
  RefreshCw,
  ArrowUpRight,
  Users,
  Package,
  Zap
} from 'lucide-react'

export default function BillingManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState('current')

  // Mock data
  const currentPlan = {
    name: 'プレミアムプラン',
    price: 100000,
    billingCycle: '年額',
    nextBillingDate: '2025-01-15',
    users: 48,
    maxUsers: 50,
    status: 'active'
  }

  const invoices = [
    {
      id: 'INV-2024-012',
      date: '2024-12-01',
      amount: 100000,
      status: 'paid',
      description: 'プレミアムプラン（年額）'
    },
    {
      id: 'INV-2024-011',
      date: '2024-11-01',
      amount: 5000,
      status: 'paid',
      description: '追加ユーザー（5名）'
    },
    {
      id: 'INV-2024-010',
      date: '2024-10-01',
      amount: 100000,
      status: 'paid',
      description: 'プレミアムプラン（年額）'
    },
    {
      id: 'INV-2024-009',
      date: '2024-09-01',
      amount: 3000,
      status: 'paid',
      description: '追加ストレージ'
    }
  ]

  const paymentMethod = {
    type: 'bank_transfer',
    name: '銀行振込',
    details: '三菱UFJ銀行 ****1234',
    isDefault: true
  }

  const usageStats = [
    { name: 'アクティブユーザー', current: 48, limit: 50, percentage: 96 },
    { name: 'ストレージ', current: 85, limit: 100, percentage: 85 },
    { name: 'API呼び出し', current: 45000, limit: 100000, percentage: 45 },
    { name: '月間レポート', current: 150, limit: 200, percentage: 75 }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">請求・支払い</h2>
            <p className="text-slate-600">サブスクリプションと請求情報を管理</p>
          </div>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            プランを変更
          </Button>
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
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  アクティブ
                </Badge>
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
                      <h3 className="font-semibold text-lg">{currentPlan.name}</h3>
                      <p className="text-sm text-slate-600">
                        ¥{currentPlan.price.toLocaleString()} / {currentPlan.billingCycle}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">次回請求日</p>
                    <p className="font-semibold">{currentPlan.nextBillingDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-600">ユーザー数</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {currentPlan.users} <span className="text-sm text-slate-500">/ {currentPlan.maxUsers}</span>
                    </p>
                    <div className="mt-2 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(currentPlan.users / currentPlan.maxUsers) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-600">契約期間</span>
                    </div>
                    <p className="text-lg font-semibold">2024年1月 - 2025年1月</p>
                    <p className="text-sm text-slate-500 mt-1">残り17日</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    追加ユーザーを購入
                  </Button>
                  <Button variant="outline" className="flex-1">
                    追加ストレージを購入
                  </Button>
                </div>
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
                      <span className="font-medium">{paymentMethod.name}</span>
                    </div>
                    {paymentMethod.isDefault && (
                      <Badge variant="outline">デフォルト</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{paymentMethod.details}</p>
                </div>

                <Button variant="outline" className="w-full">
                  支払い方法を追加
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">自動更新が有効です</p>
                    <p className="text-xs mt-1">2025年1月15日に自動的に更新されます</p>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>使用状況</CardTitle>
            <CardDescription>現在の使用量と制限</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {usageStats.map((stat) => (
                <div key={stat.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">{stat.name}</span>
                    <span className="text-sm font-medium">{stat.percentage}%</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-lg font-bold">{stat.current.toLocaleString()}</span>
                    <span className="text-sm text-slate-500"> / {stat.limit.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        stat.percentage > 90 ? 'bg-red-500' : 
                        stat.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>請求履歴</CardTitle>
                <CardDescription>過去の請求書と支払い状況</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                すべてエクスポート
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">請求書番号</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">日付</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">説明</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">金額</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">ステータス</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-sm">{invoice.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{invoice.date}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{invoice.description}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">¥{invoice.amount.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          支払済み
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          ダウンロード
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}