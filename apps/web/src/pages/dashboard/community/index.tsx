import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { LockedFeatureCard } from '@/components/premier/locked-feature-card'
import {
  Users,
  Video,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Calendar,
  Clock,
  Bell,
  BarChart3,
  Info,
  HelpCircle
} from 'lucide-react'

interface CommunityCategory {
  id: string
  name: string
  slug: string
  description: string | null
  meetingUrl: string | null
  frequency?: string
  nextMeetingDate?: string
  _count: {
    posts: number
    meetingArchives: number
    members?: number
  }
}

interface CommunityStats {
  totalMembers: number
  totalPosts: number
  nextMeetingDate: string | null
}

export default function CommunityPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, hasFeature, isAdmin, planType } = useAuth()
  const isMember = !isAdmin
  const [categories, setCategories] = useState<CommunityCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<CommunityStats | null>(null)

  const canAccessCommunity = hasFeature('community')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canAccessCommunity) {
      fetchCategories()
      fetchStats()
    } else if (isAuthenticated && !canAccessCommunity) {
      setLoading(false)
    }
  }, [isAuthenticated, canAccessCommunity])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/community/categories')
      if (res.ok) {
        const data = await res.json()
        // デモ用にデータ補完
        const enriched = (data.categories || []).map((cat: CommunityCategory) => ({
          ...cat,
          frequency: cat.frequency || '月1回',
          nextMeetingDate: cat.nextMeetingDate || null
        }))
        setCategories(enriched)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/community/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      // デモ用ダミーデータ
      setStats({
        totalMembers: 245,
        totalPosts: 1830,
        nextMeetingDate: '2026-01-20'
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
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

  // スタンダードプラン向け表示 (4-3)
  if (!canAccessCommunity) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* 見出し変更 (4-2) */}
          <div>
            <h1 className="text-2xl font-bold">エキスパート会員向け オンラインコミュニティ</h1>
            <p className="text-slate-600">職種別コミュニティで情報交換・定例ミーティングに参加</p>
          </div>

          {/* LockedFeatureCard使用 (4-3) */}
          <LockedFeatureCard
            title="オンラインコミュニティ"
            description="職種別のコミュニティに参加して、同業者との情報交換や月1回の定例Zoomミーティングに参加できます。施工管理・人事採用など、実務に役立つ知見が得られます。"
            featureName="オンラインコミュニティ"
          />

          {/* コミュニティ一覧（プレビュー） */}
          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="text-base">参加可能なコミュニティ（プレビュー）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">施工管理コミュニティ</p>
                      <p className="text-xs text-slate-500">月1回定例会開催</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">施工管理のノウハウ共有、品質向上のための情報交換</p>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">人事・採用コミュニティ</p>
                      <p className="text-xs text-slate-500">月1回定例会開催</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">採用・育成・定着に関する実践的な情報交換</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // エキスパートプラン向け表示 (4-1, 4-6)
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 見出し変更 (4-2) - 一般社員向け */}
        <div>
          <h1 className="text-2xl font-bold">
            {isMember ? '同じ業界の仲間と繋がる' : 'エキスパート会員向け オンラインコミュニティ'}
          </h1>
          <p className="text-slate-600">
            {isMember
              ? '同じ悩みを持つ仲間と情報交換。悩んでいるのはあなただけじゃない！'
              : '職種別コミュニティで情報交換・定例ミーティングに参加できます。同業者との交流を通じて、実務に役立つ知見を得ましょう。'}
          </p>
        </div>

        {/* 一般社員向け：質問するボタン */}
        {isMember && planType === 'EXPERT' && (
          <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <HelpCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-800">仕事で困っていることはありませんか？</p>
                    <p className="text-sm text-emerald-600">同じ悩みを持つ{stats?.totalMembers || 245}名の仲間がいます</p>
                  </div>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  質問してみる
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 管理者向け補足 (4-7) */}
        {isAdmin && stats && (
          <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">
                      <span className="font-medium text-blue-700">{stats.totalMembers}</span>
                      <span className="text-slate-600">名が参加中</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">
                      <span className="font-medium text-blue-700">{stats.totalPosts}</span>
                      <span className="text-slate-600">件の投稿</span>
                    </span>
                  </div>
                  {stats.nextMeetingDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">
                        次回定例: <span className="font-medium text-blue-700">{formatDate(stats.nextMeetingDate)}</span>
                      </span>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  社員の参加状況
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* コミュニティ一覧 (4-4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        {category.description && (
                          <CardDescription className="mt-1">
                            {category.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 頻度表示 (4-4) */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>{category.frequency || '月1回'}定例会</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <MessageSquare className="h-4 w-4" />
                      <span>{category._count.posts}件の投稿</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Video className="h-4 w-4" />
                      <span>{category._count.meetingArchives}件のアーカイブ</span>
                    </div>
                  </div>

                  {/* 次回定例会情報 */}
                  {category.nextMeetingDate && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          次回定例会: {formatDate(category.nextMeetingDate)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ボタン差し替え (4-5) */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/dashboard/community/${category.slug}`}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        一覧を見る
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Link>
                    </Button>
                    {/* Zoomリンク表示 (4-8) */}
                    {category.meetingUrl ? (
                      <Button className="flex-1" asChild>
                        <a href={category.meetingUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          次回定例会を確認
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" className="flex-1">
                        <Bell className="h-4 w-4 mr-2" />
                        開催通知を受け取る
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            /* デフォルト表示（カテゴリがない場合） */
            <>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">施工管理コミュニティ</CardTitle>
                      <CardDescription>
                        施工管理のノウハウ共有、品質向上のための情報交換
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>月1回定例会</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      <span>Zoomウェビナー</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      一覧を見る
                    </Button>
                    <Button className="flex-1">
                      <Bell className="h-4 w-4 mr-2" />
                      開催通知を受け取る
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">人事・採用コミュニティ</CardTitle>
                      <CardDescription>
                        採用・育成・定着に関する実践的な情報交換
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>月1回定例会</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      <span>Zoomウェビナー</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      一覧を見る
                    </Button>
                    <Button className="flex-1">
                      <Bell className="h-4 w-4 mr-2" />
                      開催通知を受け取る
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* コミュニティについて説明 (4-6) */}
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              コミュニティの活用方法
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">1.</span>
                各コミュニティでは<strong>月1回の定例Zoomミーティング</strong>を開催しています
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">2.</span>
                定例会への参加は「次回定例会を確認」からZoom登録ページに移動できます
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">3.</span>
                過去の定例会の録画アーカイブは各コミュニティページで視聴できます
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">4.</span>
                投稿機能で他のエキスパート会員と情報交換ができます
              </li>
            </ul>
            {/* Zoomリンク表示説明 (4-8) */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>定例会のお知らせ:</strong> 開催日の1週間前と前日に、登録メールアドレスへZoomリンクをお送りします。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
