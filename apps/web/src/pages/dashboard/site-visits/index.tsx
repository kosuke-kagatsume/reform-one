import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  JapaneseYen,
  CheckCircle,
  Building2,
  ArrowRight,
  Bell,
  Info,
  Share2,
  BarChart3,
  Utensils,
  Star,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

interface SiteVisit {
  id: string
  title: string
  description: string | null
  companyName?: string
  location: string
  address: string | null
  imageUrl: string | null
  scheduledAt: string
  duration: number | null
  capacity: number
  // プラン別料金
  priceStandard: number
  priceExpert: number
  // 懇親会
  hasAfterParty?: boolean
  afterPartyPrice?: number
  // その他
  maxPerOrg?: number
  isPublished: boolean
  _count?: { participants: number; organizations?: number }
  isRegistered?: boolean
  registeredCount?: number
}

interface SiteVisitStats {
  totalVisits: number
  totalParticipants: number
  upcomingCount: number
}

// 申込モーダル用state
interface ApplicationState {
  visitId: string | null
  participantCount: number
  includeAfterParty: boolean
}

export default function SiteVisitsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, hasFeature, isAdmin, planType } = useAuth()
  const isMember = !isAdmin
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)
  const [stats, setStats] = useState<SiteVisitStats | null>(null)

  // 申込フォーム
  const [application, setApplication] = useState<ApplicationState>({
    visitId: null,
    participantCount: 1,
    includeAfterParty: false
  })

  const isExpert = planType === 'EXPERT'
  const freeSlots = 2 // エキスパート無料枠

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSiteVisits()
      fetchStats()
    }
  }, [isAuthenticated])

  const fetchSiteVisits = async () => {
    try {
      const res = await fetch('/api/site-visits')
      if (res.ok) {
        const data = await res.json()
        setSiteVisits(data.siteVisits || data || [])
      }
    } catch (error) {
      console.error('Failed to fetch site visits:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/site-visits/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      // デモ用ダミーデータ
      setStats({
        totalVisits: 12,
        totalParticipants: 156,
        upcomingCount: 2
      })
    }
  }

  const handleRegister = async (visit: SiteVisit) => {
    setRegistering(visit.id)
    try {
      const res = await fetch(`/api/site-visits/${visit.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantCount: application.participantCount,
          includeAfterParty: application.includeAfterParty
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.checkoutUrl) {
          // Stripe決済へリダイレクト (7-6)
          window.location.href = data.checkoutUrl
        } else {
          // 無料の場合は登録完了
          fetchSiteVisits()
          setApplication({ visitId: null, participantCount: 1, includeAfterParty: false })
          alert('申込が完了しました')
        }
      } else {
        const error = await res.json()
        alert(error.error || '登録に失敗しました')
      }
    } catch (error) {
      console.error('Failed to register:', error)
      alert('登録に失敗しました')
    } finally {
      setRegistering(null)
    }
  }

  // 料金計算 (7-4, 7-5, 7-6)
  const calculatePrice = (visit: SiteVisit, count: number, includeParty: boolean) => {
    const basePrice = isExpert ? visit.priceExpert : visit.priceStandard
    // エキスパートは無料枠2名まで無料
    const freeCount = isExpert ? Math.min(count, freeSlots) : 0
    const paidCount = count - freeCount
    let total = basePrice * paidCount

    if (includeParty && visit.afterPartyPrice) {
      total += visit.afterPartyPrice * count
    }
    return total
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP').format(price)
  }

  const upcomingVisits = useMemo(() =>
    siteVisits.filter(v => new Date(v.scheduledAt) > new Date()),
    [siteVisits]
  )

  const pastVisits = useMemo(() =>
    siteVisits.filter(v => new Date(v.scheduledAt) <= new Date()),
    [siteVisits]
  )

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* タイトル変更 (7-1) - 一般社員向け */}
        <div>
          <h1 className="text-2xl font-bold">
            {isMember ? '成功企業を直接見学できる' : '視察会（現地見学イベント）'}
          </h1>
          <p className="text-slate-600">
            {isMember
              ? '全国の優良リフォーム企業を訪問。他社の現場や仕組みを直接見て学べる特別な機会です。'
              : '全国の優良リフォーム企業を訪問。現場のノウハウを直接学べる貴重な機会です。'}
          </p>
        </div>

        {/* KPI表示 */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-orange-50/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-orange-700">{stats.totalVisits}</p>
                    <p className="text-xs text-slate-600">累計開催回数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{stats.totalParticipants}</p>
                    <p className="text-xs text-slate-600">累計参加者数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-700">{stats.upcomingCount}</p>
                    <p className="text-xs text-slate-600">開催予定</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 管理者向け情報 (7-8) */}
        {isAdmin && (
          <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span>
                      申込: <span className="font-medium text-blue-700">3社</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>
                      合計: <span className="font-medium text-blue-700">5名</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-600" />
                    <span>
                      無料枠使用: <span className="font-medium text-blue-700">4/6名</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    社員に共有
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    申込状況
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* プラン別料金説明 (7-4) */}
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <JapaneseYen className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 mb-2">料金について</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className={`p-3 rounded-lg ${isExpert ? 'bg-green-100 border-2 border-green-300' : 'bg-white/50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-600">エキスパート</Badge>
                      {isExpert && <Badge variant="outline" className="text-xs">あなたのプラン</Badge>}
                    </div>
                    <p className="text-green-800 font-medium">1社2名まで無料</p>
                    <p className="text-slate-600 text-xs">3名以降は20,000円/人</p>
                  </div>
                  <div className={`p-3 rounded-lg ${!isExpert ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white/50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">スタンダード</Badge>
                      {!isExpert && <Badge variant="outline" className="text-xs">あなたのプラン</Badge>}
                    </div>
                    <p className="text-slate-800 font-medium">20,000円/人</p>
                    <p className="text-slate-600 text-xs">1社2名まで参加可能</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 今後の視察会 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">今後の視察会</h2>
          {upcomingVisits.length === 0 ? (
            /* 空状態改善 (7-2) */
            <Card className="border-slate-200">
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-700 mb-2">
                  視察会を準備中です
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  次回の視察会が決まり次第お知らせします。過去の視察会実績は下部でご確認いただけます。
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-6">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Info className="h-4 w-4" />
                    <span className="font-medium">視察会について</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    年4〜6回、全国の優良リフォーム企業を訪問します。現場のノウハウを直接学べる貴重な機会です。
                  </p>
                </div>
                <Button variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  開催通知を受け取る
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {upcomingVisits.map((visit) => {
                const participantCount = visit._count?.participants || 0
                const remainingSeats = visit.capacity - participantCount
                const isFull = remainingSeats <= 0
                const maxPerOrg = visit.maxPerOrg || 2
                const isApplying = application.visitId === visit.id

                return (
                  <Card key={visit.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row">
                      {/* 画像 */}
                      <div className="lg:w-64 shrink-0">
                        {visit.imageUrl ? (
                          <img
                            src={visit.imageUrl}
                            alt={visit.title}
                            className="w-full h-48 lg:h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 lg:h-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                            <Building2 className="h-12 w-12 text-white/80" />
                          </div>
                        )}
                      </div>

                      {/* コンテンツ */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                視察会
                              </Badge>
                              {visit.isRegistered && (
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  申込済み
                                </Badge>
                              )}
                              {isFull && !visit.isRegistered && (
                                <Badge variant="destructive">満席</Badge>
                              )}
                            </div>
                            {/* 企業名表示 (7-3) */}
                            {visit.companyName && (
                              <p className="text-sm text-orange-600 font-medium mb-1">
                                {visit.companyName}
                              </p>
                            )}
                            <h3 className="text-xl font-bold">{visit.title}</h3>
                          </div>
                          {/* 残席表示 (7-7) */}
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-600">
                              残り{remainingSeats}席
                            </p>
                            <p className="text-xs text-slate-500">
                              定員{visit.capacity}名
                            </p>
                          </div>
                        </div>

                        {visit.description && (
                          <p className="text-slate-600 mb-4">{visit.description}</p>
                        )}

                        {/* 詳細情報 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>{formatDate(visit.scheduledAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span>
                              {formatTime(visit.scheduledAt)}
                              {visit.duration && ` (${visit.duration}分)`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>{visit.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span>{participantCount}/{visit.capacity}名参加</span>
                          </div>
                        </div>

                        {/* 申込フォーム (7-5, 7-6, 7-7) */}
                        {!visit.isRegistered && !isFull && (
                          <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                            <div className="flex flex-wrap items-end gap-4">
                              {/* 人数選択 */}
                              <div className="space-y-1">
                                <Label className="text-xs">参加人数</Label>
                                <Select
                                  value={isApplying ? application.participantCount.toString() : '1'}
                                  onValueChange={(v) => setApplication({
                                    ...application,
                                    visitId: visit.id,
                                    participantCount: parseInt(v)
                                  })}
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: Math.min(maxPerOrg, remainingSeats) }, (_, i) => (
                                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                                        {i + 1}名
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-slate-500">1社{maxPerOrg}名まで</p>
                              </div>

                              {/* 懇親会オプション (7-5) */}
                              {visit.hasAfterParty && (
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`party-${visit.id}`}
                                    checked={isApplying ? application.includeAfterParty : false}
                                    onCheckedChange={(checked) => setApplication({
                                      ...application,
                                      visitId: visit.id,
                                      includeAfterParty: !!checked
                                    })}
                                  />
                                  <Label htmlFor={`party-${visit.id}`} className="text-sm cursor-pointer">
                                    <span className="flex items-center gap-1">
                                      <Utensils className="h-4 w-4" />
                                      懇親会に参加
                                      <span className="text-slate-500">
                                        (+¥{formatPrice(visit.afterPartyPrice || 5000)}/人)
                                      </span>
                                    </span>
                                  </Label>
                                </div>
                              )}

                              {/* 料金表示 */}
                              <div className="flex-1 text-right">
                                <p className="text-xs text-slate-500">お支払い金額</p>
                                <p className="text-2xl font-bold text-slate-900">
                                  ¥{formatPrice(calculatePrice(
                                    visit,
                                    isApplying ? application.participantCount : 1,
                                    isApplying ? application.includeAfterParty : false
                                  ))}
                                </p>
                                {isExpert && (
                                  <p className="text-xs text-green-600">
                                    <Star className="h-3 w-3 inline mr-1" />
                                    {Math.min(isApplying ? application.participantCount : 1, freeSlots)}名無料枠適用
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* 申込ボタン */}
                            <Button
                              className="w-full"
                              disabled={registering === visit.id}
                              onClick={() => handleRegister(visit)}
                            >
                              {registering === visit.id ? (
                                '処理中...'
                              ) : calculatePrice(visit, isApplying ? application.participantCount : 1, isApplying ? application.includeAfterParty : false) > 0 ? (
                                <>
                                  決済に進む
                                  <ExternalLink className="h-4 w-4 ml-2" />
                                </>
                              ) : (
                                <>
                                  申し込む（無料）
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        {visit.isRegistered && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">申込済み</span>
                                {visit.registeredCount && (
                                  <span className="text-sm">（{visit.registeredCount}名）</span>
                                )}
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a href={`/dashboard/site-visits/${visit.id}`}>
                                  詳細を見る
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        )}

                        {isFull && !visit.isRegistered && (
                          <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-slate-600">
                              <AlertCircle className="h-5 w-5" />
                              <span>この視察会は満席です。次回の開催をお待ちください。</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* 過去の視察会アーカイブ (7-9) */}
        {pastVisits.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">過去の視察会実績</h2>
            <p className="text-sm text-slate-600 mb-4">
              これまでに開催した視察会の一覧です。視察先企業の了承を得たものを掲載しています。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastVisits.map((visit) => (
                <Card key={visit.id} className="opacity-80 hover:opacity-100 transition-opacity">
                  {visit.imageUrl && (
                    <img
                      src={visit.imageUrl}
                      alt={visit.title}
                      className="w-full h-32 object-cover grayscale hover:grayscale-0 transition-all"
                    />
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">終了</Badge>
                      {visit._count?.participants && (
                        <Badge variant="secondary" className="text-xs">
                          {visit._count.participants}名参加
                        </Badge>
                      )}
                    </div>
                    {visit.companyName && (
                      <p className="text-xs text-slate-500 mt-1">{visit.companyName}</p>
                    )}
                    <CardTitle className="text-base line-clamp-2">
                      {visit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(visit.scheduledAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{visit.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 注意事項 */}
        <Card className="bg-slate-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-slate-500 mt-0.5" />
              <div className="text-sm text-slate-600">
                <p className="font-medium mb-1">視察会参加にあたって</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>1社あたりの参加人数は2名までとなります</li>
                  <li>エキスパートプランの方は2名まで無料でご参加いただけます</li>
                  <li>キャンセルは開催3日前まで可能です（全額返金）</li>
                  <li>当日の撮影・録音は視察先企業の許可が必要です</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
