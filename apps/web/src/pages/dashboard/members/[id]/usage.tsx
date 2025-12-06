import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import {
  ArrowLeft,
  Calendar,
  Video,
  Users,
  Clock,
  Activity,
  User,
  Mail
} from 'lucide-react'

interface SeminarParticipation {
  id: string
  registeredAt: string
  seminar: {
    id: string
    title: string
    scheduledAt: string
    category: { name: string }
  }
}

interface ArchiveViewRecord {
  id: string
  viewedAt: string
  archive: {
    id: string
    title: string
    publishedAt: string
    category: { name: string }
  }
}

interface CommunityPostRecord {
  id: string
  title: string
  createdAt: string
  category: {
    id: string
    name: string
    slug: string
  }
}

interface MemberUsage {
  member: {
    id: string
    name: string | null
    email: string
    role: string
    createdAt: string
    organization: {
      id: string
      name: string
    }
  }
  seminarParticipations: SeminarParticipation[]
  archiveViews: ArchiveViewRecord[]
  communityPosts: CommunityPostRecord[]
  stats: {
    totalSeminarParticipations: number
    totalArchiveViews: number
    totalCommunityPosts: number
    lastActivity: string | null
  }
}

export default function MemberUsagePage() {
  const router = useRouter()
  const { id } = router.query
  const { user, isLoading, isAuthenticated } = useAuth()
  const [usage, setUsage] = useState<MemberUsage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    if (!isLoading && isAuthenticated && user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, user, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN' && id) {
      fetchUsage()
    }
  }, [isAuthenticated, user, id])

  const fetchUsage = async () => {
    try {
      const res = await fetch(`/api/members/${id}/usage`)
      if (res.ok) {
        const data = await res.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    } finally {
      setLoading(false)
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  if (!user || user.role !== 'ADMIN' || !usage) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/members">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">利用状況</h1>
            <p className="text-slate-600">{usage.member.name || usage.member.email} の活動履歴</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 p-3 rounded-full">
                <User className="h-8 w-8 text-slate-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{usage.member.name || '名前未設定'}</h2>
                  <Badge variant="secondary">
                    {usage.member.role === 'ADMIN' ? '管理者' : 'メンバー'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{usage.member.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>参加日: {formatDate(usage.member.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{usage.stats.totalSeminarParticipations}</p>
                  <p className="text-sm text-slate-600">セミナー参加</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Video className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{usage.stats.totalArchiveViews}</p>
                  <p className="text-sm text-slate-600">アーカイブ視聴</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{usage.stats.totalCommunityPosts}</p>
                  <p className="text-sm text-slate-600">コミュニティ投稿</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Activity className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">最終アクティビティ</p>
                  <p className="text-xs text-slate-500">
                    {usage.stats.lastActivity
                      ? formatDate(usage.stats.lastActivity)
                      : '活動なし'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="seminars">
          <TabsList>
            <TabsTrigger value="seminars">
              セミナー参加履歴 ({usage.stats.totalSeminarParticipations})
            </TabsTrigger>
            <TabsTrigger value="archives">
              アーカイブ視聴履歴 ({usage.stats.totalArchiveViews})
            </TabsTrigger>
            <TabsTrigger value="community">
              コミュニティ投稿 ({usage.stats.totalCommunityPosts})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seminars" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">セミナー参加履歴</CardTitle>
                <CardDescription>登録したセミナーの一覧</CardDescription>
              </CardHeader>
              <CardContent>
                {usage.seminarParticipations.length === 0 ? (
                  <div className="py-8 text-center">
                    <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">セミナー参加履歴はありません</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {usage.seminarParticipations.map((participation) => (
                      <div
                        key={participation.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{participation.seminar.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {participation.seminar.category.name}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                開催: {formatDateTime(participation.seminar.scheduledAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">登録日</p>
                          <p className="text-sm">{formatDate(participation.registeredAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archives" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">アーカイブ視聴履歴</CardTitle>
                <CardDescription>視聴したアーカイブ動画の一覧</CardDescription>
              </CardHeader>
              <CardContent>
                {usage.archiveViews.length === 0 ? (
                  <div className="py-8 text-center">
                    <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">アーカイブ視聴履歴はありません</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {usage.archiveViews.map((view) => (
                      <div
                        key={view.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <Video className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{view.archive.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {view.archive.category.name}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                公開: {formatDate(view.archive.publishedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">視聴日</p>
                          <p className="text-sm">{formatDateTime(view.viewedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">コミュニティ投稿</CardTitle>
                <CardDescription>投稿した内容の一覧</CardDescription>
              </CardHeader>
              <CardContent>
                {usage.communityPosts.length === 0 ? (
                  <div className="py-8 text-center">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">コミュニティ投稿はありません</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {usage.communityPosts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/dashboard/community/${post.category.slug}`}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Users className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{post.title}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {post.category.name}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">投稿日</p>
                          <p className="text-sm">{formatDateTime(post.createdAt)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
