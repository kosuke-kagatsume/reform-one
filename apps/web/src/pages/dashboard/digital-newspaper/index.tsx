import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import {
  Newspaper,
  Calendar,
  FileText,
  Lock,
  Eye,
  Download,
  AlertCircle
} from 'lucide-react'

interface Edition {
  id: string
  title: string
  issueDate: string
  thumbnailUrl: string | null
  pageCount: number | null
  description: string | null
  pdfUrl?: string
}

export default function DigitalNewspaperPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [editions, setEditions] = useState<Edition[]>([])
  const [hasAccess, setHasAccess] = useState(false)
  const [accessGrantedTo, setAccessGrantedTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchEditions()
    }
  }, [isAuthenticated])

  const fetchEditions = async () => {
    try {
      const res = await fetch('/api/digital-newspaper')
      if (res.ok) {
        const data = await res.json()
        setHasAccess(data.data.hasAccess)
        setAccessGrantedTo(data.data.accessGrantedTo || null)
        setEditions(data.data.editions || [])
      }
    } catch (error) {
      console.error('Failed to fetch editions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = async (edition: Edition) => {
    try {
      const res = await fetch(`/api/digital-newspaper/${edition.id}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedEdition(data.data.edition)
        setViewerOpen(true)
      }
    } catch (error) {
      console.error('Failed to fetch edition:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-blue-600" />
            電子版リフォーム産業新聞
          </h1>
          <p className="text-gray-600 mt-1">
            リフォーム産業新聞の電子版をご覧いただけます
          </p>
        </div>

        {/* Access Status */}
        {!hasAccess && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Lock className="h-8 w-8 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-amber-800">アクセス権限がありません</h3>
                  <p className="text-amber-700 mt-1">
                    電子版は1組織につき1名のみ閲覧可能です。
                  </p>
                  {accessGrantedTo && (
                    <p className="text-amber-700 mt-2">
                      現在、<span className="font-semibold">{accessGrantedTo}</span> さんにアクセス権が付与されています。
                    </p>
                  )}
                  <p className="text-amber-600 text-sm mt-2">
                    アクセス権の変更については、組織の管理者またはリフォーム産業新聞社にお問い合わせください。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Editions List */}
        {hasAccess && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{editions.length}</p>
                      <p className="text-sm text-gray-600">公開中の号数</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {editions[0] ? formatDate(editions[0].issueDate) : '-'}
                      </p>
                      <p className="text-sm text-gray-600">最新号</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Eye className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">閲覧可能</p>
                      <p className="text-sm text-gray-600">アクセス権限</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>バックナンバー</CardTitle>
              </CardHeader>
              <CardContent>
                {editions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    公開中の電子版はありません
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {editions.map((edition) => (
                      <div
                        key={edition.id}
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleView(edition)}
                      >
                        <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                          {edition.thumbnailUrl ? (
                            <img
                              src={edition.thumbnailUrl}
                              alt={edition.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Newspaper className="h-16 w-16 text-gray-400" />
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm truncate">{edition.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(edition.issueDate)}
                          </p>
                          {edition.pageCount && (
                            <p className="text-xs text-gray-400">{edition.pageCount}ページ</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* PDF Viewer Modal */}
        {viewerOpen && selectedEdition && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="font-semibold">{selectedEdition.title}</h2>
                  <p className="text-sm text-gray-500">{formatDate(selectedEdition.issueDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedEdition.pdfUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedEdition.pdfUrl, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      ダウンロード
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setViewerOpen(false)}>
                    閉じる
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-4">
                {selectedEdition.pdfUrl ? (
                  <iframe
                    src={selectedEdition.pdfUrl}
                    className="w-full h-full border rounded"
                    title={selectedEdition.title}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <AlertCircle className="h-8 w-8 mr-2" />
                    PDFが見つかりません
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle>電子版について</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Newspaper className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">リフォーム産業新聞</p>
                <p className="text-sm text-gray-600">
                  リフォーム業界の最新ニュース、トレンド、事例を毎週お届けします。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium">閲覧制限</p>
                <p className="text-sm text-gray-600">
                  電子版は1組織につき1名のみ閲覧可能です。アクセス権の変更は管理者が行えます。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
