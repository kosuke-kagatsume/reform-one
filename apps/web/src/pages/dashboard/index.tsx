import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { DashboardCustomizeDialog } from '@/components/dashboard/DashboardCustomizeDialog'
import { useDashboardStore } from '@/store/dashboard-store'
import {
  Calendar,
  Video,
  Users,
  Settings,
  ChevronRight,
  Clock,
  ExternalLink,
  Lock,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface Seminar {
  id: string
  title: string
  instructor: string | null
  scheduledAt: string
  category: { name: string }
  zoomUrl: string | null
}

interface Archive {
  id: string
  title: string
  category: { name: string }
  publishedAt: string
}

interface CommunityCategory {
  id: string
  name: string
  slug: string
  meetingUrl: string | null
  _count: { posts: number }
}

export default function Dashboard() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, planType, hasFeature, isReformCompany } = useAuth()
  const { config } = useDashboardStore()
  const [upcomingSeminars, setUpcomingSeminars] = useState<Seminar[]>([])
  const [recentArchives, setRecentArchives] = useState<Archive[]>([])
  const [communityCategories, setCommunityCategories] = useState<CommunityCategory[]>([])

  // Helper to check if a widget is enabled
  const isWidgetEnabled = (widgetId: string) => {
    const widget = config.widgets.find(w => w.id === widgetId)
    return widget?.enabled ?? true
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    // リフォーム産業新聞社のユーザーは管理画面にリダイレクト
    if (!isLoading && isAuthenticated && isReformCompany) {
      router.push('/admin/premier')
    }
  }, [isLoading, isAuthenticated, isReformCompany, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  const fetchData = async () => {
    try {
      const [seminarsRes, archivesRes, communityRes] = await Promise.all([
        fetch('/api/seminars?upcoming=true'),
        fetch('/api/archives?limit=5'),
        fetch('/api/community/categories')
      ])

      if (seminarsRes.ok) {
        const data = await seminarsRes.json()
        setUpcomingSeminars(data.seminars.slice(0, 3))
      }

      if (archivesRes.ok) {
        const data = await archivesRes.json()
        setRecentArchives(data.archives)
      }

      if (communityRes.ok) {
        const data = await communityRes.json()
        setCommunityCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canAccessCommunity = hasFeature('community')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              ようこそ、{user.name || user.email}さん
            </h1>
            <p className="text-slate-600">
              {user.organization.name} - {planType === 'EXPERT' ? 'エキスパートプラン' : 'スタンダードプラン'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DashboardCustomizeDialog />
            {user.role === 'ADMIN' && (
              <Button variant="outline" asChild>
                <Link href="/dashboard/members">
                  <Users className="h-4 w-4 mr-2" />
                  メンバー管理
                </Link>
              </Button>
            )}
            {isReformCompany && (
              <Button asChild>
                <Link href="/admin/premier">
                  <Shield className="h-4 w-4 mr-2" />
                  管理画面
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/seminars">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{upcomingSeminars.length}</p>
                    <p className="text-sm text-slate-600">今後のセミナー</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/archives">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Video className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{recentArchives.length}+</p>
                    <p className="text-sm text-slate-600">アーカイブ動画</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {canAccessCommunity ? (
            <Link href="/dashboard/community">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{communityCategories.length}</p>
                      <p className="text-sm text-slate-600">コミュニティ</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card className="opacity-60">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-3 rounded-lg">
                    <Lock className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">コミュニティ</p>
                    <p className="text-xs text-slate-500">エキスパート限定</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Link href="/dashboard/settings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-3 rounded-lg">
                    <Settings className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">設定</p>
                    <p className="text-xs text-slate-500">アカウント管理</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isWidgetEnabled('upcoming-seminars') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">今後のセミナー</CardTitle>
                  <CardDescription>参加予定のセミナー</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/seminars">
                    すべて見る
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {upcomingSeminars.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSeminars.map((seminar, index) => (
                      <div
                        key={seminar.id}
                        className={`flex items-start gap-4 ${index === 0 ? 'p-4 bg-blue-50 rounded-lg' : ''}`}
                      >
                        <div className={`p-2 rounded-lg ${index === 0 ? 'bg-blue-100' : 'bg-slate-100'}`}>
                          <Calendar className={`h-5 w-5 ${index === 0 ? 'text-blue-600' : 'text-slate-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${index === 0 ? 'text-lg' : ''}`}>
                            {seminar.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {seminar.category.name}
                            </Badge>
                            {seminar.instructor && (
                              <span className="text-xs text-slate-500">
                                講師: {seminar.instructor}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-sm text-slate-600">
                            <Clock className="h-4 w-4" />
                            {formatDate(seminar.scheduledAt)}
                          </div>
                        </div>
                        {seminar.zoomUrl && (
                          <Button size="sm" asChild>
                            <a href={seminar.zoomUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              参加
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">
                    現在予定されているセミナーはありません
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {isWidgetEnabled('recent-archives') && (
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">最新のアーカイブ</CardTitle>
                <CardDescription>過去のセミナー動画</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/archives">
                  すべて見る
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentArchives.length > 0 ? (
                <div className="space-y-3">
                  {recentArchives.map((archive) => (
                    <Link
                      key={archive.id}
                      href={`/dashboard/archives/${archive.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Video className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{archive.title}</p>
                        <p className="text-xs text-slate-500">{archive.category.name}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">
                  アーカイブはまだありません
                </p>
              )}
            </CardContent>
            </Card>
          )}
        </div>

        {canAccessCommunity && isWidgetEnabled('community-updates') && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">オンラインコミュニティ</CardTitle>
                <CardDescription>職種別コミュニティ</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/community">
                  すべて見る
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {communityCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/dashboard/community/${category.slug}`}
                    className="p-4 border rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center"
                  >
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {category._count.posts}件の投稿
                    </p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
