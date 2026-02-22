import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import {
  Calendar,
  MapPin,
  Users,
  Building2,
  Monitor,
  Video,
  Clock,
  CheckCircle,
  ExternalLink,
  Play
} from 'lucide-react'

interface OnlineSiteVisit {
  id: string
  title: string
  description: string | null
  companyName: string | null
  location: string | null
  imageUrl: string | null
  scheduledAt: string
  duration: number | null
  capacity: number
  requiredPlan: string
  participantCount: number
  isRegistered: boolean
  registrationStatus: string | null
  isFull: boolean
  archiveUrl?: string | null
}

export default function OnlineSiteVisitsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, planType } = useAuth()
  const [onlineSiteVisits, setOnlineSiteVisits] = useState<OnlineSiteVisit[]>([])
  const [pastVisits, setPastVisits] = useState<OnlineSiteVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchOnlineSiteVisits()
    }
  }, [isAuthenticated])

  const fetchOnlineSiteVisits = async () => {
    try {
      // 今後の開催
      const upcomingRes = await fetch('/api/online-site-visits?upcoming=true')
      if (upcomingRes.ok) {
        const data = await upcomingRes.json()
        setOnlineSiteVisits(data.data?.onlineSiteVisits || data.onlineSiteVisits || [])
      }

      // 過去の開催（アーカイブ）
      const pastRes = await fetch('/api/online-site-visits?past=true')
      if (pastRes.ok) {
        const data = await pastRes.json()
        setPastVisits(data.data?.onlineSiteVisits || data.onlineSiteVisits || [])
      }
    } catch (error) {
      console.error('Failed to fetch online site visits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (id: string) => {
    setRegistering(id)
    try {
      const res = await fetch(`/api/online-site-visits/${id}/register`, {
        method: 'POST'
      })

      if (res.ok) {
        fetchOnlineSiteVisits()
      } else {
        const data = await res.json()
        alert(data.message || '登録に失敗しました')
      }
    } catch (error) {
      console.error('Failed to register:', error)
    } finally {
      setRegistering(null)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('参加をキャンセルしますか？')) return

    setRegistering(id)
    try {
      const res = await fetch(`/api/online-site-visits/${id}/register`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchOnlineSiteVisits()
      }
    } catch (error) {
      console.error('Failed to cancel:', error)
    } finally {
      setRegistering(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
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
            <Monitor className="h-6 w-6 text-blue-600" />
            オンライン現場見学会
          </h1>
          <p className="text-gray-600 mt-1">
            Zoomでリアルタイムに現場を視聴できます
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{onlineSiteVisits.length}</p>
                  <p className="text-sm text-gray-600">今後の開催</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {onlineSiteVisits.filter(v => v.isRegistered).length}
                  </p>
                  <p className="text-sm text-gray-600">参加登録済み</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Video className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">Zoom</p>
                  <p className="text-sm text-gray-600">配信方法</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>開催予定</CardTitle>
          </CardHeader>
          <CardContent>
            {onlineSiteVisits.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                現在予定されているオンライン現場見学会はありません
              </div>
            ) : (
              <div className="space-y-4">
                {onlineSiteVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{visit.title}</h3>
                          {visit.requiredPlan === 'EXPERT' && (
                            <Badge variant="default">エキスパート限定</Badge>
                          )}
                          {visit.isRegistered && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              参加登録済み
                            </Badge>
                          )}
                        </div>

                        {visit.description && (
                          <p className="text-gray-600 mb-3">{visit.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(visit.scheduledAt)}
                          </span>
                          {visit.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {visit.duration}分
                            </span>
                          )}
                          {visit.companyName && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {visit.companyName}
                            </span>
                          )}
                          {visit.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {visit.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {visit.participantCount} / {visit.capacity}名
                          </span>
                        </div>
                      </div>

                      <div className="ml-4">
                        {visit.isRegistered ? (
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleCancel(visit.id)}
                              disabled={registering === visit.id}
                            >
                              キャンセル
                            </Button>
                          </div>
                        ) : visit.isFull ? (
                          <Button disabled variant="secondary">
                            満員
                          </Button>
                        ) : !isUpcoming(visit.scheduledAt) ? (
                          <Button disabled variant="secondary">
                            終了
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleRegister(visit.id)}
                            disabled={registering === visit.id}
                          >
                            {registering === visit.id ? '登録中...' : '参加登録'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle>オンライン現場見学会について</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Video className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Zoomでライブ配信</p>
                <p className="text-sm text-gray-600">
                  リアルタイムで現場の様子を視聴できます。質問も可能です。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Monitor className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">参加方法</p>
                <p className="text-sm text-gray-600">
                  参加登録後、開催前にZoom URLをメールでお送りします。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium">定員あり</p>
                <p className="text-sm text-gray-600">
                  各回定員がありますので、お早めにお申し込みください。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 過去のオンライン見学会アーカイブ */}
        {pastVisits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-600" />
                過去の見学会アーカイブ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold mb-2">{visit.title}</h3>
                    {visit.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{visit.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(visit.scheduledAt)}
                      </span>
                      {visit.companyName && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {visit.companyName}
                        </span>
                      )}
                    </div>
                    {visit.archiveUrl ? (
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <a href={visit.archiveUrl} target="_blank" rel="noopener noreferrer">
                          <Play className="h-4 w-4 mr-2" />
                          アーカイブを視聴
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        アーカイブ準備中
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
