import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { LockedFeatureCard } from '@/components/premier/locked-feature-card'
import {
  FileText,
  Download,
  Video,
  Calendar,
  BookOpen,
  Clock,
  Share2,
  BarChart3,
  Info,
  Lightbulb,
  Target,
  FileCheck
} from 'lucide-react'

interface Databook {
  id: string
  title: string
  description: string | null
  youtubeUrl: string | null
  quarter: string
  publishedAt: string
  coverImageUrl?: string | null
  _count: { downloads: number }
  // 一般社員向け追加フィールド
  pageCount?: number | null
  summary?: string | null
  usageScenes?: string | null // JSON配列
}

interface DatabookStats {
  totalDatabooks: number
  totalDownloads: number
  nextPublishDate: string | null
}

export default function DatabooksPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, hasFeature, isAdmin, planType } = useAuth()
  const isMember = !isAdmin
  const [databooks, setDatabooks] = useState<Databook[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [stats, setStats] = useState<DatabookStats | null>(null)

  const canAccessDatabooks = hasFeature('databook')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canAccessDatabooks) {
      fetchDatabooks()
      fetchStats()
    } else if (isAuthenticated && !canAccessDatabooks) {
      setLoading(false)
    }
  }, [isAuthenticated, canAccessDatabooks])

  const fetchDatabooks = async () => {
    try {
      const res = await fetch('/api/databooks')
      if (res.ok) {
        const data = await res.json()
        setDatabooks(data.databooks || [])
      }
    } catch (error) {
      console.error('Failed to fetch databooks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/databooks/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      // デモ用ダミーデータ
      setStats({
        totalDatabooks: 12,
        totalDownloads: 3500,
        nextPublishDate: '2026-04-01'
      })
    }
  }

  const handleDownload = async (databook: Databook) => {
    if (!user) return
    setDownloading(databook.id)

    try {
      const res = await fetch(`/api/databooks/${databook.id}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (res.ok) {
        const data = await res.json()
        window.open(data.pdfUrl, '_blank')
      } else {
        alert('ダウンロードに失敗しました')
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('ダウンロードに失敗しました')
    } finally {
      setDownloading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long'
    })
  }

  const formatQuarter = (quarter: string) => {
    const match = quarter.match(/(\d{4})-Q(\d)/)
    if (match) {
      return `${match[1]}年 第${match[2]}四半期`
    }
    return quarter
  }

  // 年次でグループ化 (5-5)
  const databooksByYear = useMemo(() => {
    const groups: Record<string, Databook[]> = {}
    databooks.forEach(db => {
      const year = db.quarter.split('-')[0] || new Date(db.publishedAt).getFullYear().toString()
      if (!groups[year]) groups[year] = []
      groups[year].push(db)
    })
    // 年降順でソート
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [databooks])

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  // スタンダードプラン向け表示 (5-8)
  if (!canAccessDatabooks) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* 見出し変更 (5-2) */}
          <div>
            <h1 className="text-2xl font-bold">エキスパート会員向け データブック</h1>
            <p className="text-slate-600">業界動向レポート・分析資料をPDFでダウンロード</p>
          </div>

          {/* LockedFeatureCard使用 (5-8) */}
          <LockedFeatureCard
            title="データブック"
            description="年4回発行の業界動向レポート・データ分析資料をPDFでダウンロードできます。市場動向、トレンド分析、経営に役立つデータが満載です。"
            featureName="データブック"
          />

          {/* プレビュー表示 */}
          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="text-base">収録内容（プレビュー）</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg bg-slate-50 text-center">
                  <div className="bg-red-100 w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-sm font-medium">市場動向レポート</p>
                  <p className="text-xs text-slate-500">四半期ごと</p>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50 text-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">データ分析資料</p>
                  <p className="text-xs text-slate-500">統計・グラフ</p>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50 text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">業界トレンド</p>
                  <p className="text-xs text-slate-500">最新情報</p>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50 text-center">
                  <div className="bg-purple-100 w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <Video className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium">解説動画</p>
                  <p className="text-xs text-slate-500">一部資料</p>
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
        {/* 見出し変更 (5-2) - 一般社員向け */}
        <div>
          <h1 className="text-2xl font-bold">
            {isMember && planType === 'EXPERT' ? '仕事に使えるデータ集' : 'エキスパート会員向け データブック'}
          </h1>
          <p className="text-slate-600">
            {isMember && planType === 'EXPERT'
              ? '提案資料や価格交渉に使えるデータが満載。四半期ごとに最新版を配信しています。'
              : '年4回発行の業界動向レポート・データ分析資料。契約期間中に発行されたデータブックをダウンロードできます。'}
          </p>
        </div>

        {/* KPI表示 */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-red-50/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-red-700">{stats.totalDatabooks}</p>
                    <p className="text-xs text-slate-600">公開中の資料</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{stats.totalDownloads.toLocaleString()}</p>
                    <p className="text-xs text-slate-600">累計ダウンロード</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-700">
                      {stats.nextPublishDate ? formatDate(stats.nextPublishDate) : '調整中'}
                    </p>
                    <p className="text-xs text-slate-600">次回発行予定</p>
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
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              ダウンロード状況
            </Button>
          </div>
        )}

        {databooks.length > 0 ? (
          <div className="space-y-8">
            {/* 年次区切り表示 (5-5) */}
            {databooksByYear.map(([year, yearDatabooks]) => (
              <div key={year}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-semibold">{year}年版</h2>
                  <Badge variant="outline">全{yearDatabooks.length}冊</Badge>
                  {yearDatabooks.length < 4 && (
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {4 - yearDatabooks.length}冊 準備中
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {yearDatabooks.map((databook) => (
                    <Card key={databook.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex">
                        {/* サムネイル/表紙画像 (5-3, 5-4) */}
                        <div className="w-32 shrink-0">
                          {databook.coverImageUrl ? (
                            <img
                              src={databook.coverImageUrl}
                              alt={databook.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center min-h-[160px]">
                              <FileText className="h-10 w-10 text-white/80" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-4">
                          <Badge variant="outline" className="mb-2 text-xs">
                            {formatQuarter(databook.quarter)}
                          </Badge>
                          <h3 className="font-semibold mb-2 line-clamp-2">{databook.title}</h3>

                          {/* 一般社員向け：summary表示 */}
                          {isMember && planType === 'EXPERT' && databook.summary ? (
                            <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 p-2 rounded mb-3">
                              <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <span>{databook.summary}</span>
                            </div>
                          ) : databook.description && (
                            <p className="text-sm text-slate-600 line-clamp-2 mb-3">{databook.description}</p>
                          )}

                          {/* 一般社員向け：活用シーン */}
                          {isMember && planType === 'EXPERT' && databook.usageScenes && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {JSON.parse(databook.usageScenes).slice(0, 3).map((scene: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  <Target className="h-3 w-3 mr-1" />
                                  {scene}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(databook.publishedAt)}
                            </span>
                            {/* ページ数表示 */}
                            {databook.pageCount && (
                              <span className="flex items-center gap-1">
                                <FileCheck className="h-3 w-3" />
                                {databook.pageCount}ページ
                              </span>
                            )}
                            {!isMember && (
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {databook._count.downloads}回
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleDownload(databook)}
                              disabled={downloading === databook.id}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              {downloading === databook.id ? '...' : 'PDFをダウンロード'}
                            </Button>
                            {databook.youtubeUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={databook.youtubeUrl} target="_blank" rel="noopener noreferrer">
                                  <Video className="h-4 w-4 mr-1" />
                                  解説動画
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-slate-200">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                データブックを準備中です
              </h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                次回のデータブックは{stats?.nextPublishDate ? formatDate(stats.nextPublishDate) : '近日中'}に公開予定です。
                公開されましたらメールでお知らせします。
              </p>

              {/* 次回発行予定エリア (5-6) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">次回発行について</span>
                </div>
                <p className="text-sm text-blue-600">
                  {stats?.nextPublishDate
                    ? `${formatDate(stats.nextPublishDate)}に新しいデータブックを公開予定です。`
                    : '現在、次回発行日を調整中です。決まり次第お知らせします。'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* データブック解説セミナー */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="h-5 w-5 text-purple-600" />
              データブック解説セミナー
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              データブックの内容を解説するセミナー動画をご覧いただけます。
              データの読み方や活用方法を詳しく説明しています。
            </p>
            <Button
              variant="outline"
              className="bg-white border-purple-300 text-purple-700 hover:bg-purple-50"
              onClick={() => router.push('/dashboard/archives?category=databook')}
            >
              <Video className="h-4 w-4 mr-2" />
              解説セミナーを視聴する
            </Button>
          </CardContent>
        </Card>

        {/* DL制限説明 (5-7) */}
        <Card className="bg-slate-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-slate-500 mt-0.5" />
              <div className="text-sm text-slate-600">
                <p className="font-medium mb-1">ダウンロードについて</p>
                <p>契約期間中（開始日〜更新日）に発行されたデータブックをダウンロードできます。過去のデータブックは契約更新後もダウンロード可能です。</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
