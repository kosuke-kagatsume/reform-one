import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Yen,
  CheckCircle,
  Building2,
  ArrowRight
} from 'lucide-react'

interface SiteVisit {
  id: string
  title: string
  description: string | null
  location: string
  address: string | null
  imageUrl: string | null
  scheduledAt: string
  duration: number | null
  capacity: number
  price: number
  isPublished: boolean
  _count?: { participants: number }
  isRegistered?: boolean
}

export default function SiteVisitsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSiteVisits()
    }
  }, [isAuthenticated])

  const fetchSiteVisits = async () => {
    try {
      const res = await fetch('/api/site-visits')
      if (res.ok) {
        const data = await res.json()
        setSiteVisits(data)
      }
    } catch (error) {
      console.error('Failed to fetch site visits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (siteVisitId: string) => {
    setRegistering(siteVisitId)
    try {
      const res = await fetch(`/api/site-visits/${siteVisitId}/register`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        if (data.checkoutUrl) {
          // Stripe決済へリダイレクト
          window.location.href = data.checkoutUrl
        } else {
          // 無料の場合は登録完了
          fetchSiteVisits()
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

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  const upcomingVisits = siteVisits.filter(v => new Date(v.scheduledAt) > new Date())
  const pastVisits = siteVisits.filter(v => new Date(v.scheduledAt) <= new Date())

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">視察会</h1>
          <p className="text-slate-600">現場見学・視察会イベント</p>
        </div>

        {/* 今後の視察会 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">今後の視察会</h2>
          {upcomingVisits.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">現在予定されている視察会はありません</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingVisits.map((visit) => {
                const participantCount = visit._count?.participants || 0
                const isFull = participantCount >= visit.capacity

                return (
                  <Card key={visit.id} className="hover:shadow-md transition-shadow overflow-hidden">
                    {visit.imageUrl && (
                      <img
                        src={visit.imageUrl}
                        alt={visit.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          視察会
                        </Badge>
                        {visit.isRegistered && (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            申込済み
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base line-clamp-2 mt-2">
                        {visit.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {visit.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {visit.description}
                        </p>
                      )}
                      <div className="space-y-2 text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>{formatDate(visit.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {formatTime(visit.scheduledAt)}
                            {visit.duration && ` (${visit.duration}分)`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">{visit.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {participantCount} / {visit.capacity}名
                            {isFull && <span className="text-red-600 ml-1">(満席)</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Yen className="h-4 w-4 flex-shrink-0" />
                          <span className="font-semibold text-slate-900">
                            ¥{formatPrice(visit.price)}
                          </span>
                        </div>
                      </div>

                      {visit.isRegistered ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => router.push(`/dashboard/site-visits/${visit.id}`)}
                        >
                          詳細を見る
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full"
                          disabled={isFull || registering === visit.id}
                          onClick={() => handleRegister(visit.id)}
                        >
                          {registering === visit.id ? (
                            '処理中...'
                          ) : isFull ? (
                            '満席'
                          ) : (
                            <>
                              申し込む
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* 過去の視察会 */}
        {pastVisits.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">過去の視察会</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastVisits.map((visit) => (
                <Card key={visit.id} className="opacity-75">
                  {visit.imageUrl && (
                    <img
                      src={visit.imageUrl}
                      alt={visit.title}
                      className="w-full h-32 object-cover grayscale"
                    />
                  )}
                  <CardHeader className="pb-2">
                    <Badge variant="outline" className="w-fit text-xs">
                      終了
                    </Badge>
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
      </div>
    </DashboardLayout>
  )
}
