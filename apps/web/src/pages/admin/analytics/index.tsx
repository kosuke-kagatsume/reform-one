import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import {
  Users,
  Building,
  TrendingUp,
  Video,
  FileText,
  Calendar,
  CreditCard,
} from 'lucide-react'

interface AnalyticsData {
  summary: {
    totalOrganizations: number
    activeSubscriptions: number
    totalUsers: number
    newUsersInPeriod: number
  }
  engagement: {
    seminarParticipants: number
    archiveViews: number
    databookDownloads: number
    siteVisitParticipants: number
  }
  subscriptionsByPlan: Record<string, number>
  revenue: {
    total: number
  }
  dailyStats: { date: string; activities: number }[]
  recentActivities: { id: string; type: string; resourceType: string; createdAt: string }[]
}

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchAnalytics()
    }
  }, [isAuthenticated, user, period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics/overview?period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num)
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(num)
  }

  const getActivityLabel = (type: string) => {
    const labels: Record<string, string> = {
      seminar_register: 'セミナー登録',
      seminar_attend: 'セミナー出席',
      archive_view: 'アーカイブ視聴',
      community_view: 'コミュニティ閲覧',
      community_post: 'コミュニティ投稿',
      tool_download: 'ツールダウンロード',
    }
    return labels[type] || type
  }

  if (isLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">分析ダッシュボード</h1>
            <p className="text-slate-600">サービス利用状況の分析</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">過去7日間</SelectItem>
              <SelectItem value="30d">過去30日間</SelectItem>
              <SelectItem value="90d">過去90日間</SelectItem>
              <SelectItem value="1y">過去1年間</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {analytics && (
          <>
            {/* サマリーカード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">総組織数</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(analytics.summary.totalOrganizations)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">アクティブ契約</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(analytics.summary.activeSubscriptions)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(analytics.summary.totalUsers)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{formatNumber(analytics.summary.newUsersInPeriod)} (期間内新規)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">期間収益</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(analytics.revenue.total)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* プラン別契約 */}
            <Card>
              <CardHeader>
                <CardTitle>プラン別契約数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">STANDARD</p>
                    <p className="text-3xl font-bold text-blue-700">
                      {formatNumber(analytics.subscriptionsByPlan['STANDARD'] || 0)}
                    </p>
                  </div>
                  <div className="flex-1 p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">EXPERT</p>
                    <p className="text-3xl font-bold text-purple-700">
                      {formatNumber(analytics.subscriptionsByPlan['EXPERT'] || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* エンゲージメント */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">セミナー参加者</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(analytics.engagement.seminarParticipants)}
                  </div>
                  <p className="text-xs text-muted-foreground">期間内</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">アーカイブ視聴</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(analytics.engagement.archiveViews)}
                  </div>
                  <p className="text-xs text-muted-foreground">回</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">データブックDL</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(analytics.engagement.databookDownloads)}
                  </div>
                  <p className="text-xs text-muted-foreground">回</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">視察会参加者</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(analytics.engagement.siteVisitParticipants)}
                  </div>
                  <p className="text-xs text-muted-foreground">名</p>
                </CardContent>
              </Card>
            </div>

            {/* 最近のアクティビティ */}
            <Card>
              <CardHeader>
                <CardTitle>最近のアクティビティ</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.recentActivities.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">
                    アクティビティがありません
                  </p>
                ) : (
                  <div className="space-y-2">
                    {analytics.recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {getActivityLabel(activity.type)}
                          </Badge>
                          {activity.resourceType && (
                            <span className="text-sm text-slate-600">
                              {activity.resourceType}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-slate-500">
                          {new Date(activity.createdAt).toLocaleString('ja-JP')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
