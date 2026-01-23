import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { StatCard, StatCardGrid } from '@/components/ui/stat-card'
import { AlertRow } from '@/components/ui/alert-row'
import { StatusBadge, DaysAgoBadge, PlanBadge, ContractStatusBadge } from '@/components/ui/status-badge'
import { useAuth } from '@/lib/auth-context'
import { EmailSendDialog } from '@/components/admin/email-send-dialog'
import {
  Building,
  Search,
  Plus,
  Users,
  Calendar,
  CreditCard,
  ChevronRight,
  Mail,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Percent
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  slug: string
  type: string
  createdAt: string
  isExistingSubscriber: boolean
  subscription: {
    id: string
    planType: string
    status: string
    currentPeriodStart: string
    currentPeriodEnd: string
    daysUntilExpiration: number | null
    expirationStatus: 'normal' | 'warning' | 'danger' | 'expired'
  } | null
  _count: {
    users: number
  }
  lastLoginAt: string | null
  activeUsers: number
  status: 'active' | 'expiring' | 'expired' | 'canceled' | 'no_subscription'
}

interface Stats {
  total: number
  active: number
  expiring: number
  expired: number
  canceled: number
  noSubscription: number
  expiring30Days: number
  recentlyLoggedIn: number
  notLoggedIn: number
}

type FilterStatus = 'all' | 'active' | 'expiring' | 'expired' | 'canceled' | 'no_subscription' | 'not_logged_in'
type FilterPlan = 'all' | 'STANDARD' | 'EXPERT'
type SortBy = 'danger' | 'name' | 'expiration' | 'lastLogin' | 'members'
type EmailType = 'CONTACT' | 'RENEWAL_NOTICE' | 'USAGE_PROMOTION'

interface EmailRecipient {
  id: string
  name: string
  planType?: string
  expiresAt?: string | null
  daysRemaining?: number
  userCount?: number
}

export default function OrganizationsPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterPlan, setFilterPlan] = useState<FilterPlan>('all')
  const [sortBy, setSortBy] = useState<SortBy>('danger')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailType, setEmailType] = useState<EmailType>('CONTACT')
  const [emailRecipient, setEmailRecipient] = useState<EmailRecipient | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) {
      fetchOrganizations()
    }
  }, [isAuthenticated, isReformCompany])

  // Handle URL query params for filtering
  useEffect(() => {
    const { filter } = router.query
    if (filter === 'expiring' || filter === 'expiring30') {
      setFilterStatus('expiring')
    } else if (filter === 'expiring60') {
      setFilterStatus('expiring')
    }
  }, [router.query])

  const fetchOrganizations = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/admin/premier/organizations')
      if (res.ok) {
        const data = await res.json()
        setOrganizations(data.organizations)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }

  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return '未ログイン'
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`
    return `${Math.floor(diffDays / 30)}ヶ月前`
  }

  const getStatusBadge = (org: Organization) => {
    switch (org.status) {
      case 'active':
        return <Badge className="bg-green-500">●有効</Badge>
      case 'expiring':
        return <Badge className="bg-yellow-500">●期限注意</Badge>
      case 'expired':
        return <Badge variant="destructive">●期限切れ</Badge>
      case 'canceled':
        return <Badge variant="secondary">解約済</Badge>
      case 'no_subscription':
        return <Badge variant="outline">未契約</Badge>
      default:
        return null
    }
  }

  const getLoginStatusColor = (lastLoginAt: string | null) => {
    if (!lastLoginAt) return 'text-red-500'
    const date = new Date(lastLoginAt)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 7) return 'text-green-600'
    if (diffDays <= 30) return 'text-yellow-600'
    return 'text-red-500'
  }

  const openEmailDialog = (org: Organization, type: EmailType) => {
    setEmailType(type)
    setEmailRecipient({
      id: org.id,
      name: org.name,
      planType: org.subscription?.planType,
      expiresAt: org.subscription?.currentPeriodEnd ?? null,
      daysRemaining: org.subscription?.daysUntilExpiration ?? undefined,
      userCount: org._count.users
    })
    setEmailDialogOpen(true)
  }

  // Filter and sort organizations
  const filteredOrganizations = organizations
    .filter(org => {
      // Search filter
      if (searchQuery && !org.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // Status filter
      if (filterStatus === 'not_logged_in') {
        // 未ログインまたは30日以上ログインなし
        if (org.lastLoginAt) {
          const daysSinceLogin = Math.floor(
            (Date.now() - new Date(org.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24)
          )
          if (daysSinceLogin < 30) return false
        }
      } else if (filterStatus !== 'all' && org.status !== filterStatus) {
        return false
      }
      // Plan filter
      if (filterPlan !== 'all') {
        if (!org.subscription || org.subscription.planType !== filterPlan) {
          return false
        }
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'danger': {
          // 危険順: 1.未契約 2.未ログイン日数が長い 3.契約期限が近い
          const getDangerScore = (org: Organization) => {
            // 未契約は最優先
            if (org.status === 'no_subscription') return 0
            // 未ログインの場合
            if (!org.lastLoginAt) return 1
            // ログイン日数を計算
            const daysSinceLogin = Math.floor(
              (Date.now() - new Date(org.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24)
            )
            // 30日以上未ログインは契約期限より優先
            if (daysSinceLogin >= 30) return 2 + (1000 - daysSinceLogin) / 1000
            // 契約期限が近い順
            const daysUntilExp = org.subscription?.daysUntilExpiration ?? 9999
            return 3 + daysUntilExp / 10000
          }
          return getDangerScore(a) - getDangerScore(b)
        }
        case 'name':
          return a.name.localeCompare(b.name)
        case 'expiration': {
          // Sort by days until expiration (ascending, nulls last)
          const daysA = a.subscription?.daysUntilExpiration ?? 9999
          const daysB = b.subscription?.daysUntilExpiration ?? 9999
          return daysA - daysB
        }
        case 'lastLogin':
          // Sort by last login (nulls first to show inactive ones)
          if (!a.lastLoginAt && !b.lastLoginAt) return 0
          if (!a.lastLoginAt) return -1
          if (!b.lastLoginAt) return 1
          return new Date(a.lastLoginAt).getTime() - new Date(b.lastLoginAt).getTime()
        case 'members':
          return b._count.users - a._count.users
        default:
          return 0
      }
    })

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">契約組織管理</h1>
            <p className="text-slate-600">プレミア購読の契約組織を管理</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchOrganizations(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button asChild>
              <Link href="/admin/premier/organizations/new">
                <Plus className="h-4 w-4 mr-2" />
                新規組織を登録
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        {stats && (
          <StatCardGrid>
            <StatCard
              title="総組織数"
              value={stats.total}
              subtitle={`有効: ${stats.active} | 解約済: ${stats.canceled}`}
              icon={Building}
              iconColor="text-blue-600"
            />
            <StatCard
              title="更新期限30日以内"
              value={stats.expiring30Days}
              description={stats.expiring30Days > 0 ? '更新案内が必要です' : '対応が必要な組織はありません'}
              icon={AlertTriangle}
              iconColor={stats.expiring30Days > 0 ? 'text-red-600' : 'text-green-600'}
              variant={stats.expiring30Days > 0 ? 'warning' : 'default'}
              onClick={() => setFilterStatus('expiring')}
              hoverHint="更新対象を表示"
            />
            <StatCard
              title="未ログイン組織"
              value={stats.notLoggedIn}
              description={stats.notLoggedIn > 0 ? '利用されていません' : '全組織がアクティブです'}
              icon={Users}
              iconColor={stats.notLoggedIn > 0 ? 'text-red-600' : 'text-green-600'}
              variant={stats.notLoggedIn > 0 ? 'danger' : 'default'}
              onClick={() => setFilterStatus('not_logged_in')}
              hoverHint="未ログイン組織を表示"
              cta={stats.notLoggedIn > 0 ? '要対応' : undefined}
              ctaAction={stats.notLoggedIn > 0 ? {
                label: '一斉フォローメールを送る',
                onClick: () => {
                  setEmailType('USAGE_PROMOTION')
                  setEmailRecipient(null)
                  setEmailDialogOpen(true)
                }
              } : undefined}
            />
          </StatCardGrid>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="組織名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="active">有効</SelectItem>
                  <SelectItem value="expiring">期限注意</SelectItem>
                  <SelectItem value="expired">期限切れ</SelectItem>
                  <SelectItem value="canceled">解約済</SelectItem>
                  <SelectItem value="no_subscription">未契約</SelectItem>
                  <SelectItem value="not_logged_in">未ログイン</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPlan} onValueChange={(v) => setFilterPlan(v as FilterPlan)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="プラン" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全プラン</SelectItem>
                  <SelectItem value="STANDARD">スタンダード</SelectItem>
                  <SelectItem value="EXPERT">エキスパート</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="並び替え" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="danger">危険順</SelectItem>
                  <SelectItem value="expiration">期限が近い順</SelectItem>
                  <SelectItem value="lastLogin">最終ログイン順</SelectItem>
                  <SelectItem value="name">名前順</SelectItem>
                  <SelectItem value="members">会員数順</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Organization List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">組織一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrganizations.length === 0 ? (
              <div className="py-8 text-center">
                <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  {searchQuery || filterStatus !== 'all' || filterPlan !== 'all'
                    ? '検索条件に一致する組織がありません'
                    : '組織がまだ登録されていません'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrganizations.map((org) => {
                  // 未ログイン日数を計算
                  const daysSinceLogin = org.lastLoginAt
                    ? Math.floor((Date.now() - new Date(org.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24))
                    : null
                  const isNotLoggedIn = !org.lastLoginAt || (daysSinceLogin !== null && daysSinceLogin >= 30)

                  // 行の背景色を決定
                  const getRowClassName = () => {
                    if (org.status === 'no_subscription') return 'border-orange-200 bg-orange-50'
                    if (isNotLoggedIn) return 'border-red-200 bg-red-50'
                    if (org.status === 'expired') return 'border-red-200 bg-red-50'
                    if (org.status === 'expiring') return 'border-yellow-200 bg-yellow-50'
                    return ''
                  }

                  return (
                    <div
                      key={org.id}
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors ${getRowClassName()}`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${
                          org.status === 'no_subscription' ? 'bg-orange-100' :
                          isNotLoggedIn ? 'bg-red-100' :
                          org.status === 'active' ? 'bg-green-100' :
                          org.status === 'expiring' ? 'bg-yellow-100' :
                          org.status === 'expired' ? 'bg-red-100' : 'bg-slate-100'
                        }`}>
                          <Building className={`h-5 w-5 ${
                            org.status === 'no_subscription' ? 'text-orange-600' :
                            isNotLoggedIn ? 'text-red-600' :
                            org.status === 'active' ? 'text-green-600' :
                            org.status === 'expiring' ? 'text-yellow-600' :
                            org.status === 'expired' ? 'text-red-600' : 'text-slate-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium truncate">{org.name}</p>
                            {org.subscription && (
                              <PlanBadge plan={org.subscription.planType} />
                            )}
                            {getStatusBadge(org)}
                            {org.isExistingSubscriber && (
                              <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                                <Percent className="h-3 w-3 mr-1" />
                                既存購読者
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500 mt-1 flex-wrap">
                            {org.subscription && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  契約期限: {formatDate(org.subscription.currentPeriodEnd)}
                                  {org.subscription.daysUntilExpiration !== null && (
                                    <span className={`ml-1 ${
                                      org.subscription.expirationStatus === 'danger' ? 'text-red-600 font-medium' :
                                      org.subscription.expirationStatus === 'warning' ? 'text-yellow-600' : ''
                                    }`}>
                                      （残り{org.subscription.daysUntilExpiration}日）
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{org._count.users}名</span>
                            </div>
                            <div className={`flex items-center gap-1 ${getLoginStatusColor(org.lastLoginAt)}`}>
                              <Clock className="h-3 w-3" />
                              <span>
                                {!org.lastLoginAt
                                  ? '最終ログイン: 未ログイン'
                                  : daysSinceLogin !== null && daysSinceLogin >= 30
                                    ? `${daysSinceLogin}日間ログインなし`
                                    : `最終ログイン: ${getRelativeTime(org.lastLoginAt)}`
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/premier/organizations/${org.id}`}>
                            管理画面
                          </Link>
                        </Button>
                        {isNotLoggedIn && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEmailDialog(org, 'USAGE_PROMOTION')}
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            利用促進メール
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEmailDialog(org, 'RENEWAL_NOTICE')}
                          disabled={!org.subscription}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          契約更新
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEmailDialog(org, 'CONTACT')}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          メール送信
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Dialog */}
        <EmailSendDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          emailType={emailType}
          recipientType="ORGANIZATION"
          recipient={emailRecipient}
          onSuccess={() => fetchOrganizations(true)}
        />
      </div>
    </PremierAdminLayout>
  )
}
