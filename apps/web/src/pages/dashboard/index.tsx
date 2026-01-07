import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth-context'
import { DashboardCustomizeDialog } from '@/components/dashboard/DashboardCustomizeDialog'
import { useDashboardStore } from '@/store/dashboard-store'
import { ExpertOnlyBadge, UpgradeBanner } from '@/components/premier'
import {
  Calendar,
  Video,
  Users,
  Settings,
  ChevronRight,
  Clock,
  ExternalLink,
  Crown,
  X,
  UserPlus,
  FileText,
  Sparkles,
  CreditCard,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Play,
  ArrowRight,
  Star
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
  description?: string | null
}

interface CommunityCategory {
  id: string
  name: string
  slug: string
  meetingUrl: string | null
  _count: { posts: number }
}

interface AdminStats {
  totalMembers: number
  maxMembers: number
  activeMembers: number
  inactiveMembers: number
  subscriptionEndDate: string | null
  totalSeminarsAttended: number
  totalArchivesViewed: number
}

export default function Dashboard() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, planType, hasFeature, isReformCompany, isAdmin } = useAuth()
  const { config } = useDashboardStore()
  const [upcomingSeminars, setUpcomingSeminars] = useState<Seminar[]>([])
  const [recentArchives, setRecentArchives] = useState<Archive[]>([])
  const [communityCategories, setCommunityCategories] = useState<CommunityCategory[]>([])
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState<string[]>([])
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [totalArchiveCount, setTotalArchiveCount] = useState(0)

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

  // 初回ログイン時にオンボーディングを表示
  useEffect(() => {
    if (isAuthenticated && user) {
      const onboardingKey = `onboarding_completed_${user.id}`
      const completedStr = localStorage.getItem(onboardingKey)
      if (completedStr) {
        try {
          const completed = JSON.parse(completedStr)
          if (Array.isArray(completed)) {
            setOnboardingCompleted(completed)
            // 全て完了していない場合のみ表示
            if (completed.length < 3) {
              setShowOnboarding(true)
            }
          } else if (completed === true) {
            // 旧形式（true/false）の場合は非表示
            setOnboardingCompleted(['step1', 'step2', 'step3'])
          }
        } catch {
          setShowOnboarding(true)
        }
      } else {
        setShowOnboarding(true)
      }
    }
  }, [isAuthenticated, user])

  const dismissOnboarding = () => {
    setShowOnboarding(false)
  }

  const completeOnboardingStep = (stepId: string) => {
    if (user && !onboardingCompleted.includes(stepId)) {
      const newCompleted = [...onboardingCompleted, stepId]
      setOnboardingCompleted(newCompleted)
      const onboardingKey = `onboarding_completed_${user.id}`
      localStorage.setItem(onboardingKey, JSON.stringify(newCompleted))
    }
  }

  const onboardingSteps = [
    {
      id: 'step1',
      icon: UserPlus,
      title: 'メンバーを招待する',
      description: '社内のチームメンバーを招待して、一緒にプレミアコンテンツを活用しましょう。',
      action: { label: 'メンバーを招待', href: '/dashboard/members' },
      color: 'blue'
    },
    {
      id: 'step2',
      icon: Calendar,
      title: '今月のセミナーに申し込む',
      description: '経営・営業・技術など、様々なテーマのセミナーに参加できます。',
      action: { label: 'セミナー一覧を見る', href: '/dashboard/seminars' },
      color: 'purple'
    },
    {
      id: 'step3',
      icon: FileText,
      title: 'データブックを確認する',
      description: '市場データや経営に役立つ資料をダウンロードできます。',
      action: { label: 'データブックを見る', href: '/dashboard/databooks' },
      color: 'green'
    }
  ]

  const onboardingProgress = useMemo(() => {
    return Math.round((onboardingCompleted.length / onboardingSteps.length) * 100)
  }, [onboardingCompleted])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
      if (isAdmin) {
        fetchAdminStats()
      }
    }
  }, [isAuthenticated, isAdmin])

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
        setTotalArchiveCount(data.total || data.archives.length)
      }

      if (communityRes.ok) {
        const data = await communityRes.json()
        setCommunityCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard/stats')
      if (res.ok) {
        const data = await res.json()
        setAdminStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
      // デモ用のダミーデータ
      setAdminStats({
        totalMembers: 12,
        maxMembers: 50,
        activeMembers: 8,
        inactiveMembers: 4,
        subscriptionEndDate: user?.subscription?.currentPeriodEnd?.toString() || null,
        totalSeminarsAttended: 24,
        totalArchivesViewed: 156
      })
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

  const formatSubscriptionDate = (dateString: string | null) => {
    if (!dateString) return '未設定'
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const canAccessCommunity = hasFeature('community')

  // エキスパート向け今月のおすすめ
  const expertRecommendations = planType === 'EXPERT' ? [
    { type: 'seminar', title: '経営者向け戦略セミナー', date: '1月15日' },
    { type: 'archive', title: '営業力強化実践講座', duration: '45分' },
    { type: 'databook', title: '2026年市場動向レポート', isNew: true }
  ] : []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* エキスパートプラン：今月のおすすめ3点 */}
        {planType === 'EXPERT' && isWidgetEnabled('expert-recommendations') && (
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg text-purple-900">今月のおすすめ</CardTitle>
                <Badge className="bg-purple-600">エキスパート特典</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {expertRecommendations.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      {item.type === 'seminar' && <Calendar className="h-4 w-4 text-purple-600" />}
                      {item.type === 'archive' && <Video className="h-4 w-4 text-purple-600" />}
                      {item.type === 'databook' && <FileText className="h-4 w-4 text-purple-600" />}
                      {item.isNew && <Badge variant="secondary" className="text-xs">NEW</Badge>}
                    </div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.date || item.duration || ''}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* スタンダードプラン：アップグレードバナー */}
        {planType === 'STANDARD' && (
          <UpgradeBanner
            variant="card"
            message="コミュニティ、データブック、ニュースレターなど全機能をご利用いただけます"
          />
        )}

        {/* 管理者専用サマリー */}
        {isAdmin && adminStats && (
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">管理者サマリー</CardTitle>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  更新日: {formatSubscriptionDate(adminStats.subscriptionEndDate)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs text-slate-500 mb-1">招待済みメンバー</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {adminStats.totalMembers}
                    <span className="text-sm font-normal text-slate-400">/{adminStats.maxMembers}名</span>
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs text-slate-500 mb-1">利用中</p>
                  <p className="text-2xl font-bold text-green-600">{adminStats.activeMembers}名</p>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs text-slate-500 mb-1">未ログイン（要フォロー）</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-amber-600">{adminStats.inactiveMembers}名</p>
                    {adminStats.inactiveMembers > 0 && (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-xs text-slate-500 mb-1">組織利用実績</p>
                  <p className="text-sm">
                    セミナー <span className="font-bold">{adminStats.totalSeminarsAttended}</span>回 /
                    動画 <span className="font-bold">{adminStats.totalArchivesViewed}</span>回視聴
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 初回オンボーディング（改善版） */}
        {showOnboarding && onboardingCompleted.length < 3 && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">3分で社内利用を立ち上げる</CardTitle>
                </div>
                <button
                  onClick={dismissOnboarding}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Progress value={onboardingProgress} className="flex-1 h-2" />
                <span className="text-sm font-medium text-slate-600">
                  {onboardingCompleted.length}/{onboardingSteps.length}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {onboardingSteps.map((step) => {
                  const StepIcon = step.icon
                  const isCompleted = onboardingCompleted.includes(step.id)
                  const colorClasses = {
                    blue: 'bg-blue-100 text-blue-600',
                    purple: 'bg-purple-100 text-purple-600',
                    green: 'bg-green-100 text-green-600'
                  }
                  return (
                    <div
                      key={step.id}
                      className={`bg-white rounded-lg p-4 border transition-colors ${
                        isCompleted
                          ? 'border-green-300 bg-green-50/50'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isCompleted
                            ? 'bg-green-100 text-green-600'
                            : colorClasses[step.color as keyof typeof colorClasses]
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <StepIcon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${isCompleted ? 'text-green-700' : ''}`}>
                            {step.title}
                            {isCompleted && <span className="ml-2 text-xs">完了</span>}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                          {!isCompleted && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3"
                              asChild
                              onClick={() => completeOnboardingStep(step.id)}
                            >
                              <Link href={step.action.href}>
                                {step.action.label}
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="ghost" size="sm" onClick={dismissOnboarding}>
                  あとで設定する
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ヘッダー部分 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              ようこそ、{user.name || user.email}さん
            </h1>
            <p className="text-slate-600">
              {user.organization.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DashboardCustomizeDialog />
          </div>
        </div>

        {/* 管理者アクションエリア */}
        {isAdmin && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/dashboard/members">
                <UserPlus className="h-4 w-4 mr-2 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-sm">社員を招待</p>
                  <p className="text-xs text-slate-500">メンバー追加</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/dashboard/members">
                <Users className="h-4 w-4 mr-2 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-sm">メンバー管理</p>
                  <p className="text-xs text-slate-500">利用状況確認</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="/dashboard/billing">
                <CreditCard className="h-4 w-4 mr-2 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-sm">請求確認</p>
                  <p className="text-xs text-slate-500">契約・支払い</p>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <Link href="mailto:support@reform.co.jp">
                <HelpCircle className="h-4 w-4 mr-2 text-slate-600" />
                <div className="text-left">
                  <p className="font-medium text-sm">サポート</p>
                  <p className="text-xs text-slate-500">お問い合わせ</p>
                </div>
              </Link>
            </Button>
          </div>
        )}

        {/* KPIカード（改善版） */}
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
                    <p className="text-2xl font-bold">{totalArchiveCount}</p>
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
            <Card className="relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">コミュニティ</p>
                    <ExpertOnlyBadge size="sm" className="mt-1" />
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
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium mb-2">
                      現在予定されているセミナーはありません
                    </p>
                    <p className="text-sm text-slate-500 mb-4">
                      過去のセミナーはアーカイブでいつでも視聴できます
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/archives">
                        <Video className="h-4 w-4 mr-2" />
                        おすすめアーカイブを見る
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isWidgetEnabled('recent-archives') && (
            <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">おすすめアーカイブ</CardTitle>
                <CardDescription>実務に直結する厳選コンテンツ</CardDescription>
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
                  {recentArchives.map((archive, index) => (
                    <div
                      key={archive.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border"
                    >
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Video className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{archive.title}</p>
                          {index === 0 && (
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              <Star className="h-3 w-3 mr-1" />人気
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{archive.category.name}</p>
                        {archive.description && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-1">{archive.description}</p>
                        )}
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/archives/${archive.id}`}>
                          <Play className="h-3 w-3 mr-1" />
                          視聴
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium mb-2">
                    アーカイブを準備中です
                  </p>
                  <p className="text-sm text-slate-500">
                    セミナー終了後、順次公開されます
                  </p>
                </div>
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
                <CardDescription>職種別コミュニティで情報交換</CardDescription>
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

        {/* オンボーディング常設リンク（完了後） */}
        {!showOnboarding && onboardingCompleted.length < 3 && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOnboarding(true)}
              className="text-slate-500"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              はじめての設定を続ける（{onboardingCompleted.length}/3完了）
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
