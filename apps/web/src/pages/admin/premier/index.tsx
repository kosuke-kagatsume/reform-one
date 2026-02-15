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
  ChevronRight,
  CheckCircle,
  Mail,
  AlertTriangle,
  Search,
  RefreshCw,
  Plus,
  MapPin,
  Monitor,
  Newspaper
} from 'lucide-react'

interface DashboardDetails {
  organizations: {
    total: number
    active: number
    canceled: number
  }
  expiringSubscriptions: {
    within30Days: number
    within60Days: number
  }
  seminars: {
    upcoming: number
    nextSeminar: { id: string; title: string; scheduledAt: string } | null
    totalParticipants: number
    participantsDiff: number
  }
  archives: {
    total: number
    unpublished: number
    draft: number
  }
  communities: {
    total: number
    active: number
    inactive: number
  }
  members: {
    total: number
    active: number
    inactive: number
  }
  plans: {
    standard: { active: number }
    expert: { active: number }
    newThisMonth: number
    canceledThisMonth: number
  }
  // B: 追加統計
  siteVisits: {
    upcoming: number
    totalParticipants: number
  }
  onlineSiteVisits: {
    upcoming: number
    totalParticipants: number
  }
  digitalNewspaper: {
    total: number
    published: number
  }
}

interface DashboardAlerts {
  expiringSubscriptions: number
  unpublishedUpcomingSeminars: number
  unpaidInvoices: number
  pendingInquiries: number
}

interface DashboardStats {
  totalOrganizations: number
  activeSubscriptions: number
  canceledSubscriptions: number
  upcomingSeminars: number
  totalArchives: number
  communityCategories: number
  totalMembers: number
  totalTools: number
  details: DashboardDetails
  alerts: DashboardAlerts
  lastUpdatedAt: string
}

export default function PremierAdminDashboard() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
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

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }

  const getTotalAlerts = () => {
    if (!stats?.alerts) return 0
    return stats.alerts.expiringSubscriptions +
           stats.alerts.unpublishedUpcomingSeminars +
           stats.alerts.unpaidInvoices +
           stats.alerts.pendingInquiries
  }

  if (isLoading || loading || !stats) {
    return (
      <PremierAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </PremierAdminLayout>
    )
  }

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

  // クイックアクション（よく使う順に並べ替え）
  const quickActions = [
    { label: '新規セミナー', href: '/admin/premier/seminars/new', icon: Calendar },
    { label: '新規アーカイブ', href: '/admin/premier/archives/new', icon: Video },
    { label: '新規視察会', href: '/admin/premier/site-visits/new', icon: MapPin },
    { label: '新規オンライン見学会', href: '/admin/premier/online-site-visits/new', icon: Monitor },
    { label: 'ニュースレター', href: '/admin/premier/newsletters', icon: Mail },
    { label: '電子版新聞', href: '/admin/premier/digital-newspaper', icon: Newspaper },
    { label: '新規契約組織', href: '/admin/premier/organizations/new', icon: Building },
    { label: '会員検索', href: '/admin/premier/members', icon: Search },
  ]

  return (
    <PremierAdminLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
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

        {/* 運営アラート */}
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

        {/* 統計カード - 改善版 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 契約組織数（累計） */}
          <Link href="/admin/premier/organizations">
            <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.details.organizations.total}</p>
                      <p className="text-sm font-medium text-slate-700">契約組織数（累計）</p>
                      <p className="text-xs text-slate-500">※解約済みを含む累計</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 有効契約数 - 更新期限内訳付き */}
          <Card className="hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
                  <p className="text-sm font-medium text-slate-700">有効契約数</p>
                  <div className="mt-2 space-y-1">
                    {stats.details.expiringSubscriptions.within30Days > 0 && (
                      <Link href="/admin/premier/organizations?filter=expiring30">
                        <p className="text-xs text-red-600 hover:underline cursor-pointer">
                          更新期限30日以内: {stats.details.expiringSubscriptions.within30Days}件
                        </p>
                      </Link>
                    )}
                    {stats.details.expiringSubscriptions.within60Days > 0 && (
                      <Link href="/admin/premier/organizations?filter=expiring60">
                        <p className="text-xs text-orange-500 hover:underline cursor-pointer">
                          60日以内: {stats.details.expiringSubscriptions.within60Days}件
                        </p>
                      </Link>
                    )}
                  </div>
                  {(stats.details.expiringSubscriptions.within30Days > 0 || stats.details.expiringSubscriptions.within60Days > 0) && (
                    <Link href="/admin/premier/organizations?filter=expiring">
                      <p className="text-xs text-blue-600 hover:underline mt-1 cursor-pointer">
                        更新対象を確認 →
                      </p>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 開催予定セミナー - 改善版 */}
          <Card className="hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    {stats.details.seminars.upcoming === 0 ? (
                      <>
                        <p className="text-2xl font-bold text-red-600">0</p>
                        <p className="text-sm font-medium text-slate-700">開催予定セミナー</p>
                        <p className="text-xs text-red-500">※次回未設定</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold">{stats.details.seminars.upcoming}</p>
                        <p className="text-sm font-medium text-slate-700">開催予定セミナー</p>
                        {stats.details.seminars.nextSeminar && (
                          <p className="text-xs text-slate-500">
                            次回: {formatDate(stats.details.seminars.nextSeminar.scheduledAt)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {stats.details.seminars.upcoming === 0 ? (
                  <Button size="sm" asChild>
                    <Link href="/admin/premier/seminars/new">
                      <Plus className="h-4 w-4 mr-1" />
                      作成
                    </Link>
                  </Button>
                ) : (
                  <Link href="/admin/premier/seminars">
                    <ChevronRight className="h-5 w-5 text-slate-400 hover:text-blue-500" />
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 公開中アーカイブ - 内訳付き */}
          <Link href="/admin/premier/archives">
            <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-orange-100">
                      <Video className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.details.archives.total}</p>
                      <p className="text-sm font-medium text-slate-700">公開中アーカイブ</p>
                      <p className="text-xs text-slate-500">本数</p>
                      {(stats.details.archives.unpublished > 0 || stats.details.archives.draft > 0) && (
                        <p className="text-xs text-slate-400 mt-1">
                          非公開: {stats.details.archives.unpublished}本 / 下書き: {stats.details.archives.draft}本
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* コミュニティ - アクティブ/非アクティブ */}
          <Link href="/admin/premier/community">
            <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-teal-100">
                      <MessageSquare className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.details.communities.total}</p>
                      <p className="text-sm font-medium text-slate-700">コミュニティ数</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-green-600">
                          アクティブ: {stats.details.communities.active}件
                        </span>
                        {stats.details.communities.inactive > 0 && (
                          <span className="text-xs text-orange-500">
                            30日投稿なし: {stats.details.communities.inactive}件
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 登録会員数 - ログイン状況付き */}
          <Link href="/admin/premier/members">
            <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-slate-100">
                      <Users className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.details.members.total}</p>
                      <p className="text-sm font-medium text-slate-700">登録会員数</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-green-600">
                          直近30日ログイン: {stats.details.members.active}人
                        </span>
                      </div>
                      {stats.details.members.inactive > 0 && (
                        <span className="text-xs text-red-500">
                          未ログイン30日以上: {stats.details.members.inactive}人
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* B: 視察会 */}
          <Link href="/admin/premier/site-visits">
            <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-amber-100">
                      <MapPin className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.details.siteVisits?.upcoming || 0}</p>
                      <p className="text-sm font-medium text-slate-700">開催予定視察会</p>
                      <p className="text-xs text-slate-500">
                        累計参加者: {stats.details.siteVisits?.totalParticipants || 0}人
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* B: オンライン見学会 */}
          <Link href="/admin/premier/online-site-visits">
            <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-cyan-100">
                      <Monitor className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.details.onlineSiteVisits?.upcoming || 0}</p>
                      <p className="text-sm font-medium text-slate-700">開催予定オンライン見学会</p>
                      <p className="text-xs text-slate-500">
                        累計参加者: {stats.details.onlineSiteVisits?.totalParticipants || 0}人
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* B: 電子版新聞 */}
          <Link href="/admin/premier/digital-newspaper">
            <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-indigo-100">
                      <Newspaper className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.details.digitalNewspaper?.published || 0}</p>
                      <p className="text-sm font-medium text-slate-700">公開中電子版新聞</p>
                      <p className="text-xs text-slate-500">
                        全{stats.details.digitalNewspaper?.total || 0}号
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* クイックアクション - よく使う順 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">クイックアクション</CardTitle>
              <CardDescription>よく使う操作</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Button key={action.href} className="justify-start" variant="outline" asChild>
                      <Link href={action.href}>
                        <Icon className="mr-2 h-4 w-4" />
                        {action.label}
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* プラン情報 - 契約数・今月新規・解約数付き */}
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
                    <p className="text-xs font-medium text-blue-600 mt-1">
                      契約数: {stats.details.plans.standard.active}件
                    </p>
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
                    <p className="text-xs font-medium text-blue-600 mt-1">
                      契約数: {stats.details.plans.expert.active}件
                    </p>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">今月の新規契約</span>
                    <span className="font-medium text-green-600">+{stats.details.plans.newThisMonth}件</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-600">今月の解約</span>
                    <span className="font-medium text-red-500">-{stats.details.plans.canceledThisMonth}件</span>
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
