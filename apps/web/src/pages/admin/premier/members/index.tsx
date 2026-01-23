import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { StatCard } from '@/components/ui/stat-card'
import { AlertRow } from '@/components/ui/alert-row'
import { DaysAgoBadge, PlanBadge } from '@/components/ui/status-badge'
import { useAuth } from '@/lib/auth-context'
import {
  Users,
  Search,
  Building,
  Mail,
  Calendar,
  Activity,
  ChevronRight,
  Clock,
  AlertCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Send
} from 'lucide-react'

interface Member {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  createdAt: string
  lastLoginAt: string | null
  loginStatus: 'recent' | 'normal' | 'inactive' | 'never'
  daysSinceLogin: number | null
  organization: {
    id: string
    name: string
    subscription: {
      planType: string
      status: string
      currentPeriodEnd: string
    } | null
  }
  _count: {
    activities: number
  }
}

interface MemberStats {
  total: number
  active: number
  inactive: number
  recentLogin: number
  notLoggedIn30Days: number
  neverLoggedIn: number
  byPlan: {
    expert: number
    standard: number
    noSubscription: number
  }
}

interface Organization {
  id: string
  name: string
}

type SortOption = 'name_asc' | 'login_desc' | 'activity_desc' | 'created_desc'
type LoginFilter = 'all' | 'recent' | 'normal' | 'inactive' | 'never'
type PlanFilter = 'all' | 'expert' | 'standard' | 'none'

export default function MembersAdminPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [stats, setStats] = useState<MemberStats | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('login_desc')
  const [loginFilter, setLoginFilter] = useState<LoginFilter>('all')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all')
  const [orgFilter, setOrgFilter] = useState('all')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) {
      fetchMembers()
    }
  }, [isAuthenticated, isReformCompany])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/premier/members')
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members)
        setStats(data.stats)
        setOrganizations(data.organizations || [])
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatRelativeDate = (dateString: string | null) => {
    if (!dateString) return '未ログイン'
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`
    return `${Math.floor(diffDays / 365)}年前`
  }

  const getLoginStatusColor = (loginStatus: string) => {
    switch (loginStatus) {
      case 'recent': return 'text-green-600'
      case 'normal': return 'text-yellow-600'
      case 'inactive': return 'text-red-600'
      case 'never': return 'text-slate-400'
      default: return 'text-slate-400'
    }
  }

  const getLoginStatusBadge = (loginStatus: string) => {
    switch (loginStatus) {
      case 'recent':
        return <Badge className="bg-green-100 text-green-800 border-green-200">アクティブ</Badge>
      case 'normal':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">やや不活発</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 border-red-200">非アクティブ</Badge>
      case 'never':
        return <Badge className="bg-slate-100 text-slate-600 border-slate-200">未ログイン</Badge>
      default:
        return null
    }
  }

  // Apply filters
  const getFilteredMembers = () => {
    const filtered = members.filter(m => {
      // Search filter
      const matchesSearch =
        (m.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.organization.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Login status filter
      const matchesLogin = loginFilter === 'all' || m.loginStatus === loginFilter

      // Plan filter
      let matchesPlan = true
      if (planFilter === 'expert') {
        matchesPlan = m.organization.subscription?.planType === 'EXPERT'
      } else if (planFilter === 'standard') {
        matchesPlan = m.organization.subscription?.planType === 'STANDARD'
      } else if (planFilter === 'none') {
        matchesPlan = !m.organization.subscription
      }

      // Organization filter
      const matchesOrg = orgFilter === 'all' || m.organization.id === orgFilter

      return matchesSearch && matchesLogin && matchesPlan && matchesOrg
    })

    // Apply sorting
    switch (sortBy) {
      case 'name_asc':
        filtered.sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email, 'ja'))
        break
      case 'login_desc':
        filtered.sort((a, b) => {
          if (!a.lastLoginAt && !b.lastLoginAt) return 0
          if (!a.lastLoginAt) return 1
          if (!b.lastLoginAt) return -1
          return new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime()
        })
        break
      case 'activity_desc':
        filtered.sort((a, b) => b._count.activities - a._count.activities)
        break
      case 'created_desc':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return filtered
  }

  const filteredMembers = getFilteredMembers()

  if (isLoading || loading) {
    return (
      <PremierAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </PremierAdminLayout>
    )
  }

  return (
    <PremierAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">会員一覧</h1>
            <p className="text-slate-600">プレミア購読の全会員を管理</p>
          </div>
          <Button onClick={() => router.push('/admin/premier/members/send-mail')}>
            <Mail className="h-4 w-4 mr-2" />
            会員選択メール送信
          </Button>
        </div>

        {/* Summary Cards - クリックでフィルター適用 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 総会員数 */}
          <StatCard
            title="総会員数"
            value={stats?.total || 0}
            subtitle={`アクティブ ${stats?.active || 0} / 非アクティブ ${stats?.inactive || 0}`}
            icon={Users}
            iconColor="text-blue-600"
            onClick={() => {
              setLoginFilter('all')
              setPlanFilter('all')
            }}
            hoverHint="クリックで全一覧を表示"
          />

          {/* 30日以内ログイン */}
          <StatCard
            title="30日以内ログイン"
            value={stats?.recentLogin || 0}
            subtitle={`全体の ${stats?.total ? Math.round((stats.recentLogin / stats.total) * 100) : 0}%`}
            icon={UserCheck}
            iconColor="text-green-600"
            variant="success"
            onClick={() => setLoginFilter('recent')}
            hoverHint="クリックでアクティブユーザーを表示"
          />

          {/* 30日以上未ログイン（休眠） */}
          <StatCard
            title="30日以上未ログイン"
            value={stats?.notLoggedIn30Days || 0}
            subtitle={`うち未ログイン ${stats?.neverLoggedIn || 0}名`}
            icon={UserX}
            iconColor="text-red-600"
            variant={(stats?.notLoggedIn30Days || 0) > 0 ? 'danger' : 'default'}
            onClick={() => setLoginFilter('inactive')}
            hoverHint="クリックで休眠ユーザーを表示"
            cta={(stats?.notLoggedIn30Days || 0) > 0 ? '要対応' : undefined}
          />

          {/* 未ログインユーザー */}
          <StatCard
            title="未ログインユーザー"
            value={stats?.neverLoggedIn || 0}
            subtitle="一度もログインしていない"
            icon={AlertTriangle}
            iconColor="text-amber-600"
            variant={(stats?.neverLoggedIn || 0) > 0 ? 'warning' : 'default'}
            onClick={() => setLoginFilter('never')}
            hoverHint="クリックで未ログインユーザーを表示"
            cta={(stats?.neverLoggedIn || 0) > 0 ? '要確認' : undefined}
          />
        </div>

        {/* 休眠ユーザー一括メール通知 */}
        {loginFilter === 'inactive' && filteredMembers.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">
                  {filteredMembers.length}名の休眠ユーザーがいます
                </p>
                <p className="text-sm text-amber-700">
                  利用促進メールを送信して、サービスの活用を促しましょう
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-100">
              <Send className="h-4 w-4 mr-2" />
              利用促進メールを一括送信
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="名前、メールアドレス、組織名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="all">すべての組織</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
          <select
            value={loginFilter}
            onChange={(e) => setLoginFilter(e.target.value as LoginFilter)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="all">すべてのログイン状況</option>
            <option value="recent">アクティブ（7日以内）</option>
            <option value="normal">やや不活発（8-30日）</option>
            <option value="inactive">非アクティブ（30日超）</option>
            <option value="never">未ログイン</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as PlanFilter)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="all">すべてのプラン</option>
            <option value="expert">エキスパート</option>
            <option value="standard">スタンダード</option>
            <option value="none">未契約</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="login_desc">最終ログイン順</option>
            <option value="name_asc">名前順</option>
            <option value="activity_desc">アクティビティ順</option>
            <option value="created_desc">登録日順</option>
          </select>
        </div>

        {/* 一斉メール送信セクション */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              一斉メール送信
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => router.push('/admin/premier/members/bulk-mail?target=all')}
              >
                <Send className="h-4 w-4 mr-2" />
                全会員に送信
                <Badge variant="secondary" className="ml-2">{stats?.total || 0}名</Badge>
              </Button>
              <Button
                variant="outline"
                className="bg-white border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                onClick={() => router.push('/admin/premier/members/bulk-mail?target=expert')}
              >
                <Send className="h-4 w-4 mr-2" />
                エキスパートに送信
                <Badge variant="secondary" className="ml-2">{stats?.byPlan.expert || 0}名</Badge>
              </Button>
              <Button
                variant="outline"
                className="bg-white border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => router.push('/admin/premier/members/bulk-mail?target=standard')}
              >
                <Send className="h-4 w-4 mr-2" />
                スタンダードに送信
                <Badge variant="secondary" className="ml-2">{stats?.byPlan.standard || 0}名</Badge>
              </Button>
              {filteredMembers.length > 0 && filteredMembers.length !== stats?.total && (
                <Button
                  variant="outline"
                  className="bg-white border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => {
                    const params = new URLSearchParams()
                    params.set('target', 'filtered')
                    if (loginFilter !== 'all') params.set('loginFilter', loginFilter)
                    if (planFilter !== 'all') params.set('planFilter', planFilter)
                    if (orgFilter !== 'all') params.set('orgFilter', orgFilter)
                    router.push(`/admin/premier/members/bulk-mail?${params.toString()}`)
                  }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  現在の絞り込み結果に送信
                  <Badge variant="secondary" className="ml-2">{filteredMembers.length}名</Badge>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">会員一覧</CardTitle>
            <p className="text-sm text-slate-500">{filteredMembers.length}件表示</p>
          </CardHeader>
          <CardContent>
            {filteredMembers.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  {searchQuery || loginFilter !== 'all' || planFilter !== 'all' || orgFilter !== 'all'
                    ? '検索条件に一致する会員がいません'
                    : '会員がいません'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMembers.map((member) => {
                  const isDormant = member.loginStatus === 'inactive' || member.loginStatus === 'never'
                  const alertLevel = member.loginStatus === 'never' ? 'danger' :
                    member.loginStatus === 'inactive' ? 'warning' : 'none'

                  return (
                    <AlertRow
                      key={member.id}
                      alertLevel={alertLevel}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-2 rounded-full">
                          <Users className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.name || member.email}</p>
                            {member.role === 'ADMIN' && (
                              <Badge variant="secondary" className="text-xs">管理者</Badge>
                            )}
                            {member.organization.subscription && (
                              <PlanBadge plan={member.organization.subscription.planType} />
                            )}
                            {isDormant && (
                              <DaysAgoBadge days={member.daysSinceLogin} />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              <span>{member.organization.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>登録: {formatDate(member.createdAt)}</span>
                            </div>
                            <div className={`flex items-center gap-1 ${getLoginStatusColor(member.loginStatus)}`}>
                              <Clock className="h-3 w-3" />
                              <span>
                                {member.daysSinceLogin !== null
                                  ? `${member.daysSinceLogin}日間ログインなし`
                                  : '未ログイン'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              <span>{member._count.activities}件の活動</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isDormant && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-amber-400 text-amber-700 hover:bg-amber-50"
                            onClick={() => router.push(`/admin/premier/members/${member.id}/contact?type=promotion`)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            利用促進
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/premier/members/${member.id}/contact`)}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          メール送信
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/premier/organizations/${member.organization.id}`)}
                        >
                          組織管理
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </AlertRow>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PremierAdminLayout>
  )
}
