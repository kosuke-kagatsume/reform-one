import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  Building,
  CreditCard,
  Activity,
  Download,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  BookOpen,
  Package
} from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  // Mock data
  const stats = [
    {
      name: 'アクティブユーザー',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      name: '登録組織',
      value: '48',
      change: '+4.2%',
      trend: 'up',
      icon: Building,
      color: 'green'
    },
    {
      name: '月次収益',
      value: '¥4.2M',
      change: '+8.1%',
      trend: 'up',
      icon: CreditCard,
      color: 'purple'
    },
    {
      name: 'API使用率',
      value: '72%',
      change: '-2.3%',
      trend: 'down',
      icon: Activity,
      color: 'orange'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'user_joined',
      title: '新規ユーザー登録',
      description: 'tanaka@reform.co.jp が組織に参加しました',
      time: '5分前',
      status: 'success'
    },
    {
      id: 2,
      type: 'payment',
      title: '支払い完了',
      description: 'プレミアムプランの請求が完了しました',
      time: '1時間前',
      status: 'success'
    },
    {
      id: 3,
      type: 'security',
      title: 'セキュリティアラート',
      description: '異常なログイン試行を検出しました',
      time: '3時間前',
      status: 'warning'
    },
    {
      id: 4,
      type: 'system',
      title: 'システム更新',
      description: 'v2.1.0へのアップデートが利用可能です',
      time: '5時間前',
      status: 'info'
    }
  ]

  const services = [
    {
      name: '電子版',
      icon: FileText,
      status: 'active',
      users: 892,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      name: '建材トレンド',
      icon: Package,
      status: 'active',
      users: 456,
      color: 'bg-green-100 text-green-600'
    },
    {
      name: '研修プログラム',
      icon: BookOpen,
      status: 'active',
      users: 234,
      color: 'bg-purple-100 text-purple-600'
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">ダッシュボード</h2>
            <p className="text-slate-600">全体的な利用状況とパフォーマンスを確認</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            レポートをダウンロード
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>{stat.name}</CardDescription>
                  <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${
                        stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-slate-500">前月比</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Services Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>サービス利用状況</CardTitle>
              <CardDescription>各サービスの利用者数とステータス</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${service.color}`}>
                        <service.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-slate-500">{service.users} アクティブユーザー</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      稼働中
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
              <CardDescription>よく使う機能へのショートカット</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/dashboard/users/invite">
                  <Users className="h-4 w-4 mr-2" />
                  ユーザーを招待
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/dashboard/billing">
                  <CreditCard className="h-4 w-4 mr-2" />
                  請求書を確認
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/dashboard/reports">
                  <FileText className="h-4 w-4 mr-2" />
                  レポート作成
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/dashboard/security">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  セキュリティ設定
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>最近のアクティビティ</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/activity">
                  すべて表示
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="mt-0.5">
                    {activity.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {activity.status === 'warning' && (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    {activity.status === 'info' && (
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-sm text-slate-500">{activity.description}</p>
                  </div>
                  <div className="flex items-center text-sm text-slate-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}