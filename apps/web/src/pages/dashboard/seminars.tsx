import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import {
  Calendar,
  Clock,
  ExternalLink,
  User,
  MapPin,
  CheckCircle,
  UserPlus,
  Search,
  Video,
  Bell,
  Share2,
  Mail,
  ArrowUpDown,
  Users,
  PlayCircle,
  Info
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  _count?: { seminars: number }
}

interface Seminar {
  id: string
  title: string
  description: string | null
  instructor: string | null
  imageUrl: string | null
  scheduledAt: string
  duration: number | null
  zoomUrl: string | null
  category: Category
  _count?: { participants: number }
}

interface SeminarStats {
  totalSeminars: number
  totalParticipants: number
  totalArchiveViews: number
}

type SortOption = 'date_asc' | 'date_desc'
type ViewMode = 'upcoming' | 'past'

export default function SeminarsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth()
  const isMember = !isAdmin
  const [seminars, setSeminars] = useState<Seminar[]>([])
  const [pastSeminars, setPastSeminars] = useState<Seminar[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [registeredSeminars, setRegisteredSeminars] = useState<Set<string>>(new Set())
  const [registering, setRegistering] = useState<string | null>(null)

  // 新規追加state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('date_asc')
  const [viewMode, setViewMode] = useState<ViewMode>('upcoming')
  const [stats, setStats] = useState<SeminarStats | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
      fetchStats()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const fetchData = async () => {
    try {
      const [upcomingRes, pastRes, categoriesRes] = await Promise.all([
        fetch('/api/seminars?upcoming=true'),
        fetch('/api/seminars?past=true'),
        fetch('/api/seminars/categories')
      ])

      if (upcomingRes.ok) {
        const data = await upcomingRes.json()
        setSeminars(data.seminars)

        // Check registration status for each seminar
        if (user) {
          const registrations = await Promise.all(
            data.seminars.map(async (seminar: Seminar) => {
              try {
                const res = await fetch(`/api/seminars/${seminar.id}/register`, {
                  headers: { 'x-user-id': user.id }
                })
                if (res.ok) {
                  const result = await res.json()
                  return result.registered ? seminar.id : null
                }
              } catch {
                return null
              }
            })
          )
          setRegisteredSeminars(new Set(registrations.filter(Boolean)))
        }
      }

      if (pastRes.ok) {
        const data = await pastRes.json()
        setPastSeminars(data.seminars || [])
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/seminars/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      // デモ用ダミーデータ
      setStats({
        totalSeminars: 48,
        totalParticipants: 1250,
        totalArchiveViews: 8500
      })
    }
  }

  const handleRegister = async (seminarId: string) => {
    if (!user) return
    setRegistering(seminarId)

    try {
      const isRegistered = registeredSeminars.has(seminarId)
      const res = await fetch(`/api/seminars/${seminarId}/register`, {
        method: isRegistered ? 'DELETE' : 'POST',
        headers: { 'x-user-id': user.id }
      })

      if (res.ok) {
        setRegisteredSeminars(prev => {
          const next = new Set(prev)
          if (isRegistered) {
            next.delete(seminarId)
          } else {
            next.add(seminarId)
          }
          return next
        })
      }
    } catch (error) {
      console.error('Failed to register:', error)
    } finally {
      setRegistering(null)
    }
  }

  // フィルタリング・ソート処理
  const displaySeminars = useMemo(() => {
    const source = viewMode === 'upcoming' ? seminars : pastSeminars
    let result = [...source]

    // カテゴリフィルタ
    if (selectedCategory !== 'all') {
      result = result.filter(s => s.category.id === selectedCategory)
    }

    // 検索フィルタ
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.instructor?.toLowerCase().includes(query)
      )
    }

    // ソート
    result.sort((a, b) => {
      const dateA = new Date(a.scheduledAt).getTime()
      const dateB = new Date(b.scheduledAt).getTime()
      return sortOption === 'date_asc' ? dateA - dateB : dateB - dateA
    })

    return result
  }, [seminars, pastSeminars, viewMode, selectedCategory, searchQuery, sortOption])

  // カテゴリ別件数
  const categoryCounts = useMemo(() => {
    const source = viewMode === 'upcoming' ? seminars : pastSeminars
    const counts: Record<string, number> = { all: source.length }
    categories.forEach(cat => {
      counts[cat.id] = source.filter(s => s.category.id === cat.id).length
    })
    return counts
  }, [seminars, pastSeminars, viewMode, categories])

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

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  const upcomingSeminar = displaySeminars[0]
  const otherSeminars = displaySeminars.slice(1)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ページ役割定義 (2-5) */}
        <div>
          <h1 className="text-2xl font-bold">セミナー一覧</h1>
          <p className="text-slate-600">
            このページでは、今後開催予定のオンラインセミナーの確認・参加登録、過去セミナーの振り返りができます。
          </p>
        </div>

        {/* KPI実績表示 (2-7) */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-blue-50/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{stats.totalSeminars}</p>
                    <p className="text-xs text-slate-600">累計開催回数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-700">{stats.totalParticipants.toLocaleString()}</p>
                    <p className="text-xs text-slate-600">累計参加者数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-purple-50/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <PlayCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-purple-700">{stats.totalArchiveViews.toLocaleString()}</p>
                    <p className="text-xs text-slate-600">アーカイブ視聴回数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 管理者アクション (2-6) */}
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              社員に共有
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              案内メールを送る
            </Button>
          </div>
        )}

        {/* 検索・並び替え (2-4) */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="タイトル、講師名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('upcoming')}
            >
              開催予定
            </Button>
            <Button
              variant={viewMode === 'past' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('past')}
            >
              過去のセミナー
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOption(sortOption === 'date_asc' ? 'date_desc' : 'date_asc')}
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              {sortOption === 'date_asc' ? '日付順' : '新しい順'}
            </Button>
          </div>
        </div>

        {/* カテゴリタブ (2-3) */}
        <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">
              すべて
              <Badge variant="secondary" className="ml-2 text-xs">
                {categoryCounts.all}
              </Badge>
            </TabsTrigger>
            {categories.map((category) => {
              const count = categoryCounts[category.id] || 0
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  disabled={count === 0}
                  className={count === 0 ? 'opacity-50' : ''}
                >
                  {category.name}
                  <Badge
                    variant="secondary"
                    className={`ml-2 text-xs ${count === 0 ? 'bg-slate-200 text-slate-400' : ''}`}
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {displaySeminars.length === 0 ? (
              /* 空状態を次行動型に (2-1, 2-2, 2-8) */
              <Card className="border-slate-200">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 mb-2">
                    {viewMode === 'upcoming'
                      ? '現在、セミナーを準備中です'
                      : '過去のセミナーはありません'}
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    {viewMode === 'upcoming'
                      ? '次回のセミナーが決まり次第お知らせします。過去のセミナーはアーカイブ動画でいつでも視聴できます。'
                      : '開催されたセミナーはこちらに表示されます。'}
                  </p>

                  {/* 次回開催予告エリア (2-2) */}
                  {viewMode === 'upcoming' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-6">
                      <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <Info className="h-4 w-4" />
                        <span className="font-medium">次回開催について</span>
                      </div>
                      <p className="text-sm text-blue-600 mb-3">
                        現在、次回セミナーの日程を調整中です。決まり次第、メールでお知らせします。
                      </p>
                      <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                        <Bell className="h-4 w-4 mr-2" />
                        通知を受け取る
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-center gap-3">
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/archives">
                        <Video className="h-4 w-4 mr-2" />
                        人気アーカイブを見る
                      </Link>
                    </Button>
                    <Button variant="ghost">
                      セミナーをリクエスト
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {upcomingSeminar && viewMode === 'upcoming' && (
                  <Card className="overflow-hidden border-2 border-blue-200">
                    <div className="bg-blue-50 px-4 py-2 flex items-center justify-between">
                      <Badge className="bg-blue-600">直近のセミナー</Badge>
                      {registeredSeminars.has(upcomingSeminar.id) && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          参加登録済み
                        </Badge>
                      )}
                    </div>
                    <div className="md:flex">
                      {upcomingSeminar.imageUrl && (
                        <div className="md:w-1/3">
                          <img
                            src={upcomingSeminar.imageUrl}
                            alt={upcomingSeminar.title}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>
                      )}
                      <div className={`p-6 ${upcomingSeminar.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
                        <Badge variant="outline" className="mb-2">
                          {upcomingSeminar.category.name}
                        </Badge>
                        <h2 className="text-xl font-bold mb-2">{upcomingSeminar.title}</h2>
                        {upcomingSeminar.description && (
                          <p className="text-slate-600 mb-4">{upcomingSeminar.description}</p>
                        )}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(upcomingSeminar.scheduledAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatTime(upcomingSeminar.scheduledAt)}
                              {upcomingSeminar.duration && ` (${upcomingSeminar.duration}分)`}
                            </span>
                          </div>
                          {upcomingSeminar.instructor && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <User className="h-4 w-4" />
                              <span>講師: {upcomingSeminar.instructor}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="h-4 w-4" />
                            <span>オンライン開催</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={registeredSeminars.has(upcomingSeminar.id) ? "outline" : "default"}
                            onClick={() => handleRegister(upcomingSeminar.id)}
                            disabled={registering === upcomingSeminar.id}
                          >
                            {registeredSeminars.has(upcomingSeminar.id) ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {isMember ? '視聴予約済み' : '参加登録済み'}
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                {isMember ? '視聴予約する' : '参加登録'}
                              </>
                            )}
                          </Button>
                          {upcomingSeminar.zoomUrl && registeredSeminars.has(upcomingSeminar.id) && (
                            <Button variant="outline" asChild>
                              <a href={upcomingSeminar.zoomUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Zoomで参加
                              </a>
                            </Button>
                          )}
                          {isAdmin && (
                            <Button variant="ghost" size="sm">
                              <Share2 className="h-4 w-4 mr-2" />
                              社員に共有
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {(viewMode === 'past' ? displaySeminars : otherSeminars).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(viewMode === 'past' ? displaySeminars : otherSeminars).map((seminar) => (
                      <Card key={seminar.id} className="hover:shadow-md transition-shadow">
                        {seminar.imageUrl && (
                          <img
                            src={seminar.imageUrl}
                            alt={seminar.title}
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="w-fit text-xs">
                              {seminar.category.name}
                            </Badge>
                            {registeredSeminars.has(seminar.id) && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <CardTitle className="text-base line-clamp-2">
                            {seminar.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1 text-sm text-slate-600 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(seminar.scheduledAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(seminar.scheduledAt)}</span>
                            </div>
                            {seminar.instructor && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{seminar.instructor}</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            {viewMode === 'upcoming' ? (
                              <Button
                                size="sm"
                                className="w-full"
                                variant={registeredSeminars.has(seminar.id) ? "outline" : "default"}
                                onClick={() => handleRegister(seminar.id)}
                                disabled={registering === seminar.id}
                              >
                                {registeredSeminars.has(seminar.id) ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {isMember ? '予約済み' : '登録済み'}
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    {isMember ? '視聴予約する' : '参加登録'}
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="w-full" asChild>
                                <Link href="/dashboard/archives">
                                  <Video className="h-4 w-4 mr-2" />
                                  アーカイブを見る
                                </Link>
                              </Button>
                            )}
                            {seminar.zoomUrl && registeredSeminars.has(seminar.id) && viewMode === 'upcoming' && (
                              <Button size="sm" variant="outline" className="w-full" asChild>
                                <a href={seminar.zoomUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Zoomで参加
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
