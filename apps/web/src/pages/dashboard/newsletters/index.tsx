import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import { LockedFeatureCard } from '@/components/premier/locked-feature-card'
import {
  Mail,
  Calendar,
  ChevronRight,
  FileText,
  Download,
  Eye,
  Share2,
  Bell,
  Info,
  Sparkles
} from 'lucide-react'

interface Newsletter {
  id: string
  title: string
  summary: string | null
  pdfUrl?: string | null
  sentAt: string | null
  createdAt: string
}

interface NewsletterStats {
  totalNewsletters: number
  totalReads: number
  nextPublishDate: string | null
}

export default function NewslettersPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, hasFeature, isAdmin, planType } = useAuth()
  const isMember = !isAdmin
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<NewsletterStats | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>('all')

  const canAccessNewsletters = hasFeature('newsletter')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canAccessNewsletters) {
      fetchNewsletters()
      fetchStats()
    } else if (isAuthenticated && !canAccessNewsletters) {
      setLoading(false)
    }
  }, [isAuthenticated, canAccessNewsletters])

  const fetchNewsletters = async () => {
    try {
      const res = await fetch('/api/newsletters')
      if (res.ok) {
        const data = await res.json()
        setNewsletters(data.newsletters || [])
      }
    } catch (error) {
      console.error('Failed to fetch newsletters:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/newsletters/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      // デモ用ダミーデータ
      setStats({
        totalNewsletters: 24,
        totalReads: 4500,
        nextPublishDate: '2026-02-01'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatYearMonth = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long'
    })
  }

  // 年別グループ化 (6-6)
  const years = useMemo(() => {
    const yearSet = new Set<string>()
    newsletters.forEach(nl => {
      const year = new Date(nl.sentAt || nl.createdAt).getFullYear().toString()
      yearSet.add(year)
    })
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a))
  }, [newsletters])

  // フィルタリング
  const filteredNewsletters = useMemo(() => {
    if (selectedYear === 'all') return newsletters
    return newsletters.filter(nl => {
      const year = new Date(nl.sentAt || nl.createdAt).getFullYear().toString()
      return year === selectedYear
    })
  }, [newsletters, selectedYear])

  // 最新号判定 (6-4)
  const latestId = newsletters.length > 0 ? newsletters[0].id : null

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  // スタンダードプラン向け表示 (6-8)
  if (!canAccessNewsletters) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">エキスパート会員向け 編集長・報道部長ニュースレター</h1>
            <p className="text-slate-600">業界の最新動向・分析を毎月お届け</p>
          </div>

          {/* LockedFeatureCard使用 (6-8) */}
          <LockedFeatureCard
            title="編集長・報道部長ニュースレター"
            description="リフォーム産業新聞の編集長・報道部長が、業界の最新動向・トレンド・注目企業の分析を毎月お届けします。登録メールにも配信されるので、いつでも最新情報をキャッチできます。"
            featureName="ニュースレター"
          />

          {/* プレビュー */}
          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="text-base">コンテンツ例（プレビュー）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">2026年1月号</p>
                      <p className="text-sm text-slate-500">リフォーム業界2026年の展望・注目トレンド5選</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">2025年12月号</p>
                      <p className="text-sm text-slate-500">年末特集：2025年の振り返りと成功事例</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // エキスパートプラン向け表示
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 見出し・説明文修正 (6-2) - 一般社員向け */}
        <div>
          <h1 className="text-2xl font-bold">
            {isMember && planType === 'EXPERT' ? '業界の最新トレンドをキャッチ' : 'エキスパート会員向け 編集長・報道部長ニュースレター'}
          </h1>
          <p className="text-slate-600">
            {isMember && planType === 'EXPERT'
              ? '編集長が毎月の業界動向をわかりやすく解説。メールでも届くので忙しくても最新情報をキャッチできます。'
              : '毎月お届けする業界分析レポート。過去のバックナンバーもいつでも閲覧できます。'}
          </p>
        </div>

        {/* KPI表示 - 一般社員向けは簡略化 */}
        {stats && (
          <div className={`grid ${isMember ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
            <Card className="bg-blue-50/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{stats.totalNewsletters}</p>
                    <p className="text-xs text-slate-600">{isMember ? 'バックナンバー' : '配信済み'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* 管理者のみ：累計閲覧数 */}
            {!isMember && (
              <Card className="bg-green-50/50">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-700">{stats.totalReads.toLocaleString()}</p>
                      <p className="text-xs text-slate-600">累計閲覧数</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="bg-purple-50/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-purple-700">
                      {stats.nextPublishDate ? formatYearMonth(stats.nextPublishDate) : '調整中'}
                    </p>
                    <p className="text-xs text-slate-600">次号配信予定</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 管理者向けアクション */}
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              社員に共有
            </Button>
          </div>
        )}

        {/* メール配信説明 (6-5) */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">メールでも配信中</p>
              <p className="text-sm text-blue-600">
                最新号は登録メールアドレスにも自動配信されます。メール設定は「通知設定」から変更できます。
              </p>
            </div>
          </div>
        </div>

        {newsletters.length > 0 ? (
          <>
            {/* 年別フィルター (6-6) */}
            <Tabs defaultValue="all" onValueChange={setSelectedYear}>
              <TabsList>
                <TabsTrigger value="all">
                  すべて
                  <Badge variant="secondary" className="ml-2 text-xs">{newsletters.length}</Badge>
                </TabsTrigger>
                {years.map(year => {
                  const count = newsletters.filter(nl =>
                    new Date(nl.sentAt || nl.createdAt).getFullYear().toString() === year
                  ).length
                  return (
                    <TabsTrigger key={year} value={year}>
                      {year}年
                      <Badge variant="secondary" className="ml-2 text-xs">{count}</Badge>
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value={selectedYear} className="mt-6">
                <div className="space-y-4">
                  {filteredNewsletters.map((newsletter) => (
                    <Card
                      key={newsletter.id}
                      className={`hover:shadow-md transition-shadow ${
                        newsletter.id === latestId ? 'border-blue-300 bg-blue-50/30' : ''
                      }`}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${
                            newsletter.id === latestId ? 'bg-blue-200' : 'bg-blue-100'
                          }`}>
                            <Mail className={`h-6 w-6 ${
                              newsletter.id === latestId ? 'text-blue-700' : 'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{newsletter.title}</h3>
                              {/* NEWラベル (6-4) */}
                              {newsletter.id === latestId && (
                                <Badge className="bg-blue-600 text-white text-xs">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  最新号
                                </Badge>
                              )}
                            </div>
                            {newsletter.summary && (
                              <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                                {newsletter.summary}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                              <Calendar className="h-4 w-4" />
                              {formatDate(newsletter.sentAt || newsletter.createdAt)}
                            </div>
                          </div>
                          {/* PDF閲覧/DL (6-7) */}
                          <div className="flex items-center gap-2">
                            {newsletter.pdfUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={newsletter.pdfUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  PDF
                                </a>
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/newsletters/${newsletter.id}`}>
                                <FileText className="h-4 w-4 mr-1" />
                                読む
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="border-slate-200">
            <CardContent className="py-12 text-center">
              <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                ニュースレターを準備中です
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                初回のニュースレターは{stats?.nextPublishDate ? formatYearMonth(stats.nextPublishDate) : '近日中'}に配信予定です。
                登録メールアドレスにも送信されますので、お楽しみにお待ちください。
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">配信について</span>
                </div>
                <p className="text-sm text-blue-600">
                  毎月初旬に最新号を配信予定です。メールでもお届けしますので、登録アドレスをご確認ください。
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 説明セクション */}
        <Card className="bg-slate-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-slate-500 mt-0.5" />
              <div className="text-sm text-slate-600">
                <p className="font-medium mb-1">編集長・報道部長ニュースレターについて</p>
                <p>リフォーム産業新聞の編集長・報道部長が、業界の最新動向・注目企業・トレンド分析を毎月お届けします。過去のバックナンバーはいつでも閲覧・ダウンロード可能です。</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
