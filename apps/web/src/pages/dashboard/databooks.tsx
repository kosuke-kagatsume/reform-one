import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import {
  FileText,
  Download,
  Video,
  Calendar,
  Lock,
  ExternalLink
} from 'lucide-react'

interface Databook {
  id: string
  title: string
  description: string | null
  youtubeUrl: string | null
  quarter: string
  publishedAt: string
  _count: { downloads: number }
}

export default function DatabooksPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, hasFeature } = useAuth()
  const [databooks, setDatabooks] = useState<Databook[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  const canAccessDatabooks = hasFeature('databook')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canAccessDatabooks) {
      fetchDatabooks()
    } else if (isAuthenticated && !canAccessDatabooks) {
      setLoading(false)
    }
  }, [isAuthenticated, canAccessDatabooks])

  const fetchDatabooks = async () => {
    try {
      const res = await fetch('/api/databooks')
      if (res.ok) {
        const data = await res.json()
        setDatabooks(data.databooks)
      }
    } catch (error) {
      console.error('Failed to fetch databooks:', error)
    } finally {
      setLoading(false)
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
        // Open PDF in new tab
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
      month: 'long',
      day: 'numeric'
    })
  }

  const formatQuarter = (quarter: string) => {
    // Convert "2025-Q1" to "2025年 第1四半期"
    const match = quarter.match(/(\d{4})-Q(\d)/)
    if (match) {
      return `${match[1]}年 第${match[2]}四半期`
    }
    return quarter
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

  if (!canAccessDatabooks) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">データブック</h1>
            <p className="text-slate-600">業界動向レポート・分析資料</p>
          </div>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Lock className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">
                    エキスパートプラン限定機能
                  </h3>
                  <p className="text-amber-700">
                    データブックはエキスパートプランでご利用いただけます。
                    年4回、業界動向レポートやデータ分析資料をPDFでダウンロードできます。
                  </p>
                  <Button className="mt-4" variant="outline">
                    プランをアップグレード
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">データブック</h1>
          <p className="text-slate-600">
            業界動向レポート・分析資料（エキスパートプラン特典）
          </p>
        </div>

        {databooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {databooks.map((databook) => (
              <Card key={databook.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FileText className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-1">
                          {formatQuarter(databook.quarter)}
                        </Badge>
                        <CardTitle className="text-lg">{databook.title}</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {databook.description && (
                    <p className="text-slate-600 text-sm mb-4">{databook.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(databook.publishedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {databook._count.downloads}回ダウンロード
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleDownload(databook)}
                      disabled={downloading === databook.id}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {downloading === databook.id ? 'ダウンロード中...' : 'PDFをダウンロード'}
                    </Button>
                    {databook.youtubeUrl && (
                      <Button variant="outline" asChild>
                        <a
                          href={databook.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          解説動画
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">
                データブックはまだありません
              </h3>
              <p className="text-slate-500">
                新しいデータブックが公開されるまでお待ちください。
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
