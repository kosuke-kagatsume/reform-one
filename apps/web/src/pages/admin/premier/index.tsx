import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import {
  Building,
  Users,
  Calendar,
  Video,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  AlertTriangle,
  Wrench,
  FolderOpen,
  Search,
  RefreshCw
} from 'lucide-react'

interface DashboardAlerts {
  expiringSubscriptions: number
  unpublishedUpcomingSeminars: number
  unpaidInvoices: number
  pendingInquiries: number
}

interface DashboardStats {
  totalOrganizations: number
  activeSubscriptions: number
  upcomingSeminars: number
  totalArchives: number
  communityCategories: number
  totalMembers: number
  totalTools: number
  alerts: DashboardAlerts
  lastUpdatedAt: string
}

export default function PremierAdminDashboard() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    activeSubscriptions: 0,
    upcomingSeminars: 0,
    totalArchives: 0,
    communityCategories: 0,
    totalMembers: 0,
    totalTools: 0,
    alerts: {
      expiringSubscriptions: 0,
      unpublishedUpcomingSeminars: 0,
      unpaidInvoices: 0,
      pendingInquiries: 0
    },
    lastUpdatedAt: ''
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    if (!isLoading && isAuthenticated && !isReformCompany) {
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, isReformCompany, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) {
      fetchStats()
    }
  }, [isAuthenticated, isReformCompany])

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/admin/premier/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatLastUpdated = (isoString: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const getTotalAlerts = () => {
    if (!stats.alerts) return 0
    return stats.alerts.expiringSubscriptions +
           stats.alerts.unpublishedUpcomingSeminars +
           stats.alerts.unpaidInvoices +
           stats.alerts.pendingInquiries
  }

  if (isLoading || loading) {
    return (
      <PremierAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </PremierAdminLayout>
    )
  }

  const statCards = [
    {
      title: '契約組織数',
      subtitle: '全期間',
      value: stats.totalOrganizations,
      icon: Building,
      color: 'blue',
      href: '/admin/premier/organizations'
    },
    {
      title: '有効契約数',
      subtitle: '期限内',
      value: stats.activeSubscriptions,
      icon: CheckCircle,
      color: 'green',
      href: '/admin/premier/organizations'
    },
    {
      title: '開催予定セミナー',
      subtitle: '今後の予定',
      value: stats.upcomingSeminars,
      icon: Calendar,
      color: 'purple',
      href: '/admin/premier/seminars'
    },
    {
      title: '公開中アーカイブ',
      subtitle: '本数',
      value: stats.totalArchives,
      icon: Video,
      color: 'orange',
      href: '/admin/premier/archives'
    },
    {
      title: 'コミュニティ数',
      subtitle: 'グループ数',
      value: stats.communityCategories,
      icon: MessageSquare,
      color: 'teal',
      href: '/admin/premier/community'
    },
    {
      title: '登録会員数',
      subtitle: '全組織合計',
      value: stats.totalMembers,
      icon: Users,
      color: 'slate',
      href: '/admin/premier/members'
    }
  ]

  const alertItems = [
    {
      label: '契約期限が近い組織（30日以内）',
      count: stats.alerts?.expiringSubscriptions || 0,
      href: '/admin/premier/organizations?filter=expiring',
      severity: 'warning'
    },
    {
      label: '未公開セミナー（開催7日以内）',
      count: stats.alerts?.unpublishedUpcomingSeminars || 0,
      href: '/admin/premier/seminars?filter=unpublished',
      severity: 'error'
    },
    {
      label: '未入金/請求未発行',
      count: stats.alerts?.unpaidInvoices || 0,
      href: '/admin/premier/organizations?filter=unpaid',
      severity: 'warning'
    },
    {
      label: '未対応の問い合わせ',
      count: stats.alerts?.pendingInquiries || 0,
      href: '/admin/premier/inquiries',
      severity: 'info'
    }
  ]

  return (
    <PremierAdminLayout>
      <div className="space-y-6">
        {/* ヘッダー：タイトル + 最終更新時刻 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">プレミア購読 管理ダッシュボード</h1>
            <p className="text-slate-600">契約組織・セミナー・アーカイブ・コミュニティの管理</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {stats.lastUpdatedAt && (
              <span>最終更新: {formatLastUpdated(stats.lastUpdatedAt)}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchStats(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* 運営アラート（要対応セクション） */}
        {getTotalAlerts() > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                要対応（{getTotalAlerts()}件）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alertItems.map((item) => (
                  item.count > 0 && (
                    <Link key={item.label} href={item.href}>
                      <div className={`flex items-center justify-between p-3 rounded-lg bg-white border hover:shadow-sm transition-shadow cursor-pointer ${
                        item.severity === 'error' ? 'border-red-200' :
                        item.severity === 'warning' ? 'border-amber-200' : 'border-slate-200'
                      }`}>
                        <span className="text-sm text-slate-700">{item.label}</span>
                        <Badge variant={item.severity === 'error' ? 'destructive' : 'secondary'}>
                          {item.count}件
                        </Badge>
                      </div>
                    </Link>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                          <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-sm font-medium text-slate-700">{stat.title}</p>
                          <p className="text-xs text-slate-500">{stat.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-xs text-slate-400 group-hover:text-blue-500 transition-colors">一覧へ</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* クイックアクション */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">クイックアクション</CardTitle>
              <CardDescription>よく使う操作</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button className="justify-start" variant="outline" asChild>
                  <Link href="/admin/premier/seminars/new">
                    <Calendar className="mr-2 h-4 w-4" />
                    新規セミナー
                  </Link>
                </Button>
                <Button className="justify-start" variant="outline" asChild>
                  <Link href="/admin/premier/archives/new">
                    <Video className="mr-2 h-4 w-4" />
                    新規アーカイブ
                  </Link>
                </Button>
                <Button className="justify-start" variant="outline" asChild>
                  <Link href="/admin/premier/organizations/new">
                    <Building className="mr-2 h-4 w-4" />
                    新規契約組織
                  </Link>
                </Button>
                <Button className="justify-start" variant="outline" asChild>
                  <Link href="/admin/premier/tools">
                    <Wrench className="mr-2 h-4 w-4" />
                    新規ツール追加
                  </Link>
                </Button>
                <Button className="justify-start" variant="outline" asChild>
                  <Link href="/admin/premier/categories">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    カテゴリ追加
                  </Link>
                </Button>
                <Button className="justify-start" variant="outline" asChild>
                  <Link href="/admin/premier/members">
                    <Search className="mr-2 h-4 w-4" />
                    会員検索
                  </Link>
                </Button>
                <Button className="justify-start" variant="outline" asChild>
                  <Link href="/admin/premier/databooks">
                    <FileText className="mr-2 h-4 w-4" />
                    データブック
                  </Link>
                </Button>
                <Button className="justify-start" variant="outline" asChild>
                  <Link href="/admin/premier/newsletters">
                    <Mail className="mr-2 h-4 w-4" />
                    ニュースレター
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* システム情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">プラン情報</CardTitle>
              <CardDescription>プレミア購読サービスの料金（税込・年額）</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">スタンダードコース</p>
                    <p className="text-sm text-slate-500">セミナー参加 + アーカイブ視聴 + ツール利用</p>
                  </div>
                  <div className="text-right">
                    <Badge>¥110,000/年</Badge>
                    <p className="text-xs text-slate-500 mt-1">電子版購読者 ¥88,000</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">エキスパートコース</p>
                    <p className="text-sm text-slate-500">全機能 + コミュニティ + データブック</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-600">¥220,000/年</Badge>
                    <p className="text-xs text-slate-500 mt-1">電子版購読者 ¥198,000</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  ※ 既存電子版購読者は22,000円（税込）割引適用
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PremierAdminLayout>
  )
}
