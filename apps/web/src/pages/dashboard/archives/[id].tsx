import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import {
  ArrowLeft,
  Clock,
  Eye,
  Calendar,
  ExternalLink
} from 'lucide-react'

interface Archive {
  id: string
  title: string
  description: string | null
  youtubeUrl: string
  thumbnailUrl: string | null
  duration: number | null
  publishedAt: string
  category: { id: string; name: string }
  _count: { views: number }
}

export default function ArchiveDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { user, isLoading, isAuthenticated } = useAuth()
  const [archive, setArchive] = useState<Archive | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewRecorded, setViewRecorded] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchArchive()
    }
  }, [isAuthenticated, id])

  const fetchArchive = async () => {
    try {
      const res = await fetch(`/api/archives/${id}`)
      if (res.ok) {
        const data = await res.json()
        setArchive(data.archive)
      } else if (res.status === 404) {
        router.push('/dashboard/archives')
      }
    } catch (error) {
      console.error('Failed to fetch archive:', error)
    } finally {
      setLoading(false)
    }
  }

  const recordView = async () => {
    if (viewRecorded || !user || !archive) return

    try {
      await fetch(`/api/archives/${archive.id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          orgId: user.organization.id
        })
      })
      setViewRecorded(true)
    } catch (error) {
      console.error('Failed to record view:', error)
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}時間${mins > 0 ? `${mins}分` : ''}`
    }
    return `${mins}分`
  }

  const getYoutubeEmbedUrl = (url: string) => {
    // Handle various YouTube URL formats
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`
    }
    return url
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

  if (!archive) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">アーカイブが見つかりません</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/archives">
              <ArrowLeft className="h-4 w-4 mr-2" />
              一覧に戻る
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div
              className="relative w-full bg-black rounded-lg overflow-hidden"
              style={{ paddingBottom: '56.25%' }}
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src={getYoutubeEmbedUrl(archive.youtubeUrl)}
                title={archive.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={recordView}
              />
            </div>

            <div>
              <Badge variant="outline" className="mb-2">
                {archive.category.name}
              </Badge>
              <h1 className="text-2xl font-bold mb-4">{archive.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(archive.publishedAt)}</span>
                </div>
                {archive.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(archive.duration)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{archive._count.views + (viewRecorded ? 1 : 0)}回視聴</span>
                </div>
              </div>

              {archive.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">説明</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 whitespace-pre-wrap">
                      {archive.description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">視聴方法</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">
                  このページで直接視聴するか、YouTubeで視聴できます。
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href={archive.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    YouTubeで視聴
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">注意事項</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>・ このコンテンツは会員限定です</li>
                  <li>・ URLの共有はご遠慮ください</li>
                  <li>・ 録画・転載は禁止されています</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
