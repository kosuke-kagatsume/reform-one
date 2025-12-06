import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import {
  Calendar,
  Clock,
  ExternalLink,
  User,
  MapPin,
  CheckCircle,
  UserPlus
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
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

export default function SeminarsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [seminars, setSeminars] = useState<Seminar[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [registeredSeminars, setRegisteredSeminars] = useState<Set<string>>(new Set())
  const [registering, setRegistering] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  const fetchData = async () => {
    try {
      const [seminarsRes, categoriesRes] = await Promise.all([
        fetch('/api/seminars?upcoming=true'),
        fetch('/api/seminars/categories')
      ])

      if (seminarsRes.ok) {
        const data = await seminarsRes.json()
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

  const filteredSeminars = selectedCategory === 'all'
    ? seminars
    : seminars.filter(s => s.category.id === selectedCategory)

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

  const upcomingSeminar = filteredSeminars[0]
  const otherSeminars = filteredSeminars.slice(1)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">セミナー一覧</h1>
          <p className="text-slate-600">今後開催予定のセミナー</p>
        </div>

        <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {filteredSeminars.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">現在予定されているセミナーはありません</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {upcomingSeminar && (
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
                                参加登録済み
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                参加登録
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
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {otherSeminars.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otherSeminars.map((seminar) => (
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
                                  登録済み
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  参加登録
                                </>
                              )}
                            </Button>
                            {seminar.zoomUrl && registeredSeminars.has(seminar.id) && (
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
