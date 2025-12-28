import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Users,
  FileText,
  BarChart3,
  Settings,
  Building,
  BookOpen,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Bell,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Shield,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Newspaper,
  TrendingDown,
  ChevronRight,
  Wrench,
  FolderPlus,
  UserSearch,
  Clock,
  Video,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'

interface DashboardStat {
  title: string
  subtitle?: string
  value: string
  change: string
  trend: 'up' | 'down'
  color: string
  href?: string
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  time: string
  status: 'success' | 'warning' | 'info'
}

interface OperationalAlert {
  id: string
  type: 'warning' | 'info' | 'error'
  title: string
  description: string
  count: number
  href: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  blue: Building,
  green: Calendar,
  purple: Briefcase,
  orange: Video,
  pink: MessageSquare,
  cyan: Users
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState<DashboardStat[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [alerts, setAlerts] = useState<OperationalAlert[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [environment, setEnvironment] = useState<string>('production')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/activities')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats || [])
        setAlerts(statsData.alerts || [])
        setLastUpdated(statsData.lastUpdated || null)
        setEnvironment(statsData.environment || 'production')
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json()
        setActivities(activitiesData.activities || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 最終更新時刻をフォーマット
  const formatLastUpdated = (isoString: string | null) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // 環境バッジの色を取得
  const getEnvironmentBadge = () => {
    switch (environment) {
      case 'production':
        return { label: '本番', variant: 'destructive' as const }
      case 'preview':
      case 'staging':
        return { label: 'ステージング', variant: 'secondary' as const }
      default:
        return { label: '開発', variant: 'outline' as const }
    }
  }

  const navigationItems = [
    {
      title: 'ダッシュボード',
      icon: BarChart3,
      href: '/admin/dashboard',
      active: true
    },
    {
      title: '顧客管理',
      icon: Users,
      href: '/admin/customers',
      badge: '12'
    },
    {
      title: 'コンテンツ管理',
      icon: FileText,
      href: '/admin/content'
    },
    {
      title: '電子新聞',
      icon: Newspaper,
      href: '/admin/newspaper',
      badge: '新'
    },
    {
      title: '研修管理',
      icon: BookOpen,
      href: '/admin/training'
    },
    {
      title: '建材カタログ',
      icon: ShoppingBag,
      href: '/admin/catalog'
    },
    {
      title: '売上分析',
      icon: TrendingUp,
      href: '/admin/analytics'
    },
    {
      title: '設定',
      icon: Settings,
      href: '/admin/settings'
    }
  ]

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">Reform One 管理画面</span>
              <Badge variant={getEnvironmentBadge().variant} className="ml-2">
                {getEnvironmentBadge().label}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="組織名・会員名・セミナー・ツールを検索"
                className="pl-10 w-80"
              />
            </div>

            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{user?.name || '管理者'}</p>
                      <p className="text-xs text-slate-500">管理部</p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user?.name || '管理者'}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  プロフィール
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  権限設定
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  設定
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-slate-200 min-h-[calc(100vh-57px)] transition-all duration-200`}>
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.title}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {sidebarOpen && (
                      <span className="text-sm font-medium">{item.title}</span>
                    )}
                  </div>
                  {sidebarOpen && item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">ダッシュボード</h1>
              <p className="text-slate-600">リフォーム産業新聞社 管理システム</p>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                <span>最終更新: {formatLastUpdated(lastUpdated)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchDashboardData()}
                  className="ml-2"
                >
                  更新
                </Button>
              </div>
            )}
          </div>

          {/* 運営アラート */}
          {alerts.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h2 className="font-semibold text-amber-800">要対応</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {alerts.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => router.push(alert.href)}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100 hover:border-amber-300 hover:shadow-sm transition-all text-left"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{alert.title}</p>
                      <p className="text-xs text-slate-500">{alert.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{alert.count}件</Badge>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {stats.length > 0 ? stats.map((stat) => {
              const Icon = iconMap[stat.color] || Users
              const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
              const trendColor = stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              return (
                <Card
                  key={stat.title}
                  className="cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
                  onClick={() => stat.href && router.push(stat.href)}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-sm font-medium text-slate-600">
                        {stat.title}
                      </CardTitle>
                      {stat.subtitle && (
                        <p className="text-xs text-slate-400">{stat.subtitle}</p>
                      )}
                    </div>
                    <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                      <Icon className={`h-4 w-4 text-${stat.color}-600`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        {stat.change && (
                          <div className="flex items-center gap-1 mt-1">
                            <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                            <span className={`text-xs ${trendColor}`}>{stat.change}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        一覧へ <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            }) : (
              // フォールバック表示
              [
                { title: '契約組織数', subtitle: '全期間', value: '-', color: 'blue' },
                { title: '有効契約数', subtitle: '期限内', value: '-', color: 'purple' },
                { title: '開催予定セミナー', subtitle: '公開中', value: '-', color: 'green' },
                { title: '公開中アーカイブ', subtitle: '本数', value: '-', color: 'orange' },
                { title: 'コミュニティ数', subtitle: 'アクティブ', value: '-', color: 'pink' },
                { title: '登録会員数', subtitle: '全組織', value: '-', color: 'cyan' }
              ].map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-sm font-medium text-slate-600">
                        {stat.title}
                      </CardTitle>
                      <p className="text-xs text-slate-400">{stat.subtitle}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>最近のアクティビティ</CardTitle>
                  <CardDescription>顧客とコンテンツの最新動向</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.length > 0 ? activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                        <div className={`p-2 rounded-lg ${
                          activity.status === 'success' ? 'bg-green-100' :
                          activity.status === 'warning' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          {activity.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : activity.status === 'warning' ? (
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <Bell className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-sm text-slate-600">{activity.description}</p>
                          <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500 text-center py-4">
                        アクティビティがありません
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>クイックアクション</CardTitle>
                  <CardDescription>よく使う機能</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => router.push('/admin/premier/seminars/new')}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      新規セミナー
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => router.push('/admin/premier/archives/new')}
                    >
                      <Video className="mr-2 h-4 w-4" />
                      新規アーカイブ
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => router.push('/admin/premier/organizations/new')}
                    >
                      <Building className="mr-2 h-4 w-4" />
                      新規契約組織
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => router.push('/admin/premier/tools/new')}
                    >
                      <Wrench className="mr-2 h-4 w-4" />
                      新規ツール追加
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => router.push('/admin/premier/categories/new')}
                    >
                      <FolderPlus className="mr-2 h-4 w-4" />
                      カテゴリ追加
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => router.push('/admin/premier/members')}
                    >
                      <UserSearch className="mr-2 h-4 w-4" />
                      会員を検索
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>今月の目標</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>新規顧客獲得</span>
                        <span className="font-medium">-/200</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>コンテンツ公開</span>
                        <span className="font-medium">-/30</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>研修実施</span>
                        <span className="font-medium">-/8</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
