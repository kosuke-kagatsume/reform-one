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
  Video,
  Search,
  Clock,
  Eye,
  Play,
  TrendingUp,
  Users,
  Calendar,
  Share2,
  BarChart3,
  Sparkles,
  ChevronRight,
  Tag,
  Lightbulb,
  FastForward,
  CheckCircle
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  _count: { archives: number }
}

interface Archive {
  id: string
  title: string
  description: string | null
  youtubeUrl: string
  thumbnailUrl: string | null
  duration: number | null
  publishedAt: string
  category: { id: string; name: string; slug: string }
  _count: { views: number }
  // 追加フィールド
  targetAudience?: string
  learningOutcome?: string
  benefitText?: string | null
  shortVersionUrl?: string | null
  shortVersionDuration?: number | null
  businessSceneTags?: { tag: { id: string; name: string; color: string | null } }[]
}

interface BusinessSceneTag {
  id: string
  name: string
  color: string | null
}

interface ArchiveStats {
  totalArchives: number
  totalViews: number
  upcomingCount: number
}

// カテゴリ別の色設定 (3-5)
const categoryColors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  '営業': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', gradient: 'from-blue-500 to-blue-700' },
  '経営': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', gradient: 'from-green-500 to-green-700' },
  '技術': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', gradient: 'from-orange-500 to-orange-700' },
  '人事': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', gradient: 'from-purple-500 to-purple-700' },
  'マーケティング': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', gradient: 'from-pink-500 to-pink-700' },
  'default': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', gradient: 'from-purple-500 to-purple-700' }
}

// 人気キーワード (3-2)
const popularKeywords = ['営業', '断熱', '集客', '採用', 'リフォーム', 'DX']

export default function ArchivesPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isAdmin, planType, user } = useAuth()
  const isMember = !isAdmin
  const [archives, setArchives] = useState<Archive[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ArchiveStats | null>(null)
  // 一般社員向け：業務シーンタグ
  const [businessSceneTags, setBusinessSceneTags] = useState<BusinessSceneTag[]>([])
  const [selectedSceneTag, setSelectedSceneTag] = useState<string | null>(null)
  // 視聴済みアーカイブID
  const [watchedArchiveIds, setWatchedArchiveIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories()
      fetchStats()
      fetchWatchedArchives()
      // 一般社員向け：業務シーンタグを取得
      if (isMember && planType === 'EXPERT') {
        fetchBusinessSceneTags()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isMember, planType, user?.id])

  useEffect(() => {
    if (isAuthenticated) {
      fetchArchives()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedCategory, searchQuery])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/archives/categories')
      if (res.ok) {
        const data = await res.json()
        // 件数順にソート (3-3)
        const sorted = [...(data.categories || [])].sort(
          (a: Category, b: Category) => b._count.archives - a._count.archives
        )
        setCategories(sorted)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchArchives = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const res = await fetch(`/api/archives?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setArchives(data.archives)
      }
    } catch (error) {
      console.error('Failed to fetch archives:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/archives/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      // デモ用ダミーデータ
      setStats({
        totalArchives: 156,
        totalViews: 12500,
        upcomingCount: 3
      })
    }
  }

  const fetchBusinessSceneTags = async () => {
    try {
      const res = await fetch('/api/business-scene-tags')
      if (res.ok) {
        const data = await res.json()
        setBusinessSceneTags(data.tags || [])
      }
    } catch {
      // デモ用ダミーデータ
      setBusinessSceneTags([
        { id: '1', name: '初回商談', color: '#3B82F6' },
        { id: '2', name: '失注防止', color: '#EF4444' },
        { id: '3', name: '値上げ対応', color: '#F59E0B' },
        { id: '4', name: '若手育成', color: '#10B981' },
        { id: '5', name: '現場クレーム', color: '#8B5CF6' },
        { id: '6', name: '社内DX', color: '#06B6D4' }
      ])
    }
  }

  // 視聴済みアーカイブを取得
  const fetchWatchedArchives = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/archives/watched?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setWatchedArchiveIds(new Set(data.watchedArchiveIds || []))
      }
    } catch (error) {
      console.error('Failed to fetch watched archives:', error)
    }
  }

  // 人気アーカイブ（視聴回数順）(3-6)
  const popularArchives = useMemo(() => {
    return [...archives]
      .sort((a, b) => b._count.views - a._count.views)
      .slice(0, 4)
  }, [archives])

  // おすすめアーカイブ（最新）(3-6)
  const recommendedArchives = useMemo(() => {
    return [...archives]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 4)
  }, [archives])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}時間${mins > 0 ? `${mins}分` : ''}`
    }
    return `${mins}分`
  }

  const getCategoryColor = (categoryName: string) => {
    return categoryColors[categoryName] || categoryColors.default
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 価値訴求追加 (3-1) */}
        <div>
          <h1 className="text-2xl font-bold">
            {isMember && planType === 'EXPERT' ? '仕事に役立つ動画' : 'アーカイブ動画'}
          </h1>
          <p className="text-slate-600">
            {isMember && planType === 'EXPERT'
              ? '業務の悩みを解決するヒントが見つかります。シーンで探して、すぐに活用できます。'
              : '実務に直結するノウハウを凝縮。いつでも、何度でも視聴できるセミナーアーカイブです。'}
          </p>
        </div>

        {/* 一般社員向け：業務シーンタグフィルター */}
        {isMember && planType === 'EXPERT' && businessSceneTags.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 border-emerald-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-emerald-800">業務シーンで探す</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedSceneTag === null ? 'default' : 'outline'}
                  onClick={() => setSelectedSceneTag(null)}
                  className="text-xs"
                >
                  すべて
                </Button>
                {businessSceneTags.map((tag) => (
                  <Button
                    key={tag.id}
                    size="sm"
                    variant={selectedSceneTag === tag.id ? 'default' : 'outline'}
                    onClick={() => setSelectedSceneTag(tag.id)}
                    className="text-xs"
                    style={selectedSceneTag === tag.id && tag.color ? { backgroundColor: tag.color, borderColor: tag.color } : {}}
                  >
                    {tag.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI表示 (3-8) */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-purple-50/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-purple-700">{stats.totalArchives}</p>
                    <p className="text-xs text-slate-600">動画本数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{stats.totalViews.toLocaleString()}</p>
                    <p className="text-xs text-slate-600">累計視聴回数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-700">+{stats.upcomingCount}</p>
                    <p className="text-xs text-slate-600">今月追加予定</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 管理者向け情報 (3-7) */}
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              社員に共有
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              視聴ランキング
            </Button>
          </div>
        )}

        {/* 検索プレースホルダ改善 (3-2) */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="例）営業 / 断熱 / 集客 などで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* 人気キーワードチップ */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-500">人気のキーワード:</span>
            {popularKeywords.map((keyword) => (
              <button
                key={keyword}
                onClick={() => setSearchQuery(keyword)}
                className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>

        {/* 次に見る導線 (3-6) */}
        {!searchQuery && selectedCategory === 'all' && archives.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 人気動画 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  人気の動画
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {popularArchives.slice(0, 3).map((archive, index) => {
                  const isWatched = watchedArchiveIds.has(archive.id)
                  return (
                    <Link key={archive.id} href={`/dashboard/archives/${archive.id}`}>
                      <div className={`flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors ${isWatched ? 'bg-slate-50/50' : ''}`}>
                        <span className="text-lg font-bold text-slate-300 w-6">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium truncate ${isWatched ? 'text-slate-500' : ''}`}>{archive.title}</p>
                            {isWatched && <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500">{archive._count.views}回視聴</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </Link>
                  )
                })}
              </CardContent>
            </Card>

            {/* おすすめ（最新） */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  あわせておすすめ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recommendedArchives.slice(0, 3).map((archive) => {
                  const isWatched = watchedArchiveIds.has(archive.id)
                  return (
                    <Link key={archive.id} href={`/dashboard/archives/${archive.id}`}>
                      <div className={`flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors ${isWatched ? 'bg-slate-50/50' : ''}`}>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {archive.category.name}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium truncate ${isWatched ? 'text-slate-500' : ''}`}>{archive.title}</p>
                            {isWatched && <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500">{formatDate(archive.publishedAt)}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </Link>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* カテゴリタブ (3-3) */}
        <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">
              すべて
              <Badge variant="secondary" className="ml-2 text-xs">
                {archives.length}
              </Badge>
            </TabsTrigger>
            {categories.map((category) => {
              const count = category._count.archives
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
            {archives.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 mb-2">
                    {searchQuery
                      ? '検索条件に一致する動画が見つかりません'
                      : 'このカテゴリにはまだ動画がありません'}
                  </h3>
                  <p className="text-slate-500 mb-4">
                    {searchQuery
                      ? '別のキーワードで検索してみてください'
                      : '新しい動画が追加されるまでお待ちください'}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      検索をクリア
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archives.map((archive) => {
                  const colors = getCategoryColor(archive.category.name)
                  const isWatched = watchedArchiveIds.has(archive.id)
                  return (
                    <Link key={archive.id} href={`/dashboard/archives/${archive.id}`}>
                      <Card className={`hover:shadow-md transition-shadow cursor-pointer h-full ${isWatched ? 'bg-slate-50/50 border-slate-300' : ''}`}>
                        <div className="relative">
                          {archive.thumbnailUrl ? (
                            <img
                              src={archive.thumbnailUrl}
                              alt={archive.title}
                              className={`w-full h-40 object-cover rounded-t-lg ${isWatched ? 'opacity-80' : ''}`}
                            />
                          ) : (
                            /* サムネイルカテゴリ色分け (3-5) */
                            <div className={`w-full h-40 bg-gradient-to-br ${colors.gradient} rounded-t-lg flex items-center justify-center ${isWatched ? 'opacity-80' : ''}`}>
                              <Video className="h-12 w-12 text-white/80" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 rounded-t-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="bg-white/90 rounded-full p-3">
                              <Play className="h-6 w-6 text-purple-600" />
                            </div>
                          </div>
                          {/* 視聴済みバッジ */}
                          {isWatched && (
                            <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              視聴済み
                            </div>
                          )}
                          {archive.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {formatDuration(archive.duration)}
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          {/* カテゴリバッジ色分け (3-5) */}
                          <Badge className={`w-fit text-xs ${colors.bg} ${colors.text} ${colors.border} border`}>
                            {archive.category.name}
                          </Badge>
                          <CardTitle className="text-base line-clamp-2">
                            {archive.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {/* 一般社員向け：1行ベネフィット */}
                          {isMember && planType === 'EXPERT' && archive.benefitText ? (
                            <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 p-2 rounded mb-3">
                              <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <span>{archive.benefitText}</span>
                            </div>
                          ) : (
                            /* 管理者向け：従来の表示 */
                            archive.learningOutcome ? (
                              <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                {archive.learningOutcome}
                              </p>
                            ) : archive.description && !isMember && (
                              <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                {archive.description}
                              </p>
                            )
                          )}

                          {/* 一般社員向け：ショートバージョンリンク */}
                          {isMember && planType === 'EXPERT' && archive.shortVersionUrl && (
                            <div className="mb-3">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                <FastForward className="h-3 w-3 mr-1" />
                                {archive.shortVersionDuration || 10}分版あり
                              </Badge>
                            </div>
                          )}

                          {/* 対象者タグ - 管理者のみ表示 (3-4) */}
                          {!isMember && archive.targetAudience && (
                            <div className="mb-3">
                              <Badge variant="outline" className="text-xs bg-slate-50">
                                <Users className="h-3 w-3 mr-1" />
                                {archive.targetAudience}
                              </Badge>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(archive.publishedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{archive._count.views}回視聴</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
