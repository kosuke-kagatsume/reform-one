import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import {
  Users,
  Video,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Lock
} from 'lucide-react'

interface CommunityCategory {
  id: string
  name: string
  slug: string
  description: string | null
  meetingUrl: string | null
  _count: {
    posts: number
    meetingArchives: number
  }
}

export default function CommunityPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, hasFeature } = useAuth()
  const [categories, setCategories] = useState<CommunityCategory[]>([])
  const [loading, setLoading] = useState(true)

  const canAccessCommunity = hasFeature('community')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canAccessCommunity) {
      fetchCategories()
    } else if (isAuthenticated && !canAccessCommunity) {
      setLoading(false)
    }
  }, [isAuthenticated, canAccessCommunity])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/community/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
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

  if (!canAccessCommunity) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">オンラインコミュニティ</h1>
            <p className="text-slate-600">職種別コミュニティで情報交換</p>
          </div>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="py-12 text-center">
              <Lock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">エキスパートプラン限定機能</h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                オンラインコミュニティはエキスパートプラン会員限定の機能です。
                職種別のコミュニティに参加して、同業者との情報交換や定例ミーティングに参加できます。
              </p>
              <Button variant="outline">
                プランのアップグレードについてお問い合わせ
              </Button>
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
          <h1 className="text-2xl font-bold">オンラインコミュニティ</h1>
          <p className="text-slate-600">職種別コミュニティで情報交換・定例ミーティングに参加</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
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
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{category._count.posts}件の投稿</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <span>{category._count.meetingArchives}件のアーカイブ</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/dashboard/community/${category.slug}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      投稿を見る
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Link>
                  </Button>
                  {category.meetingUrl && (
                    <Button className="flex-1" asChild>
                      <a href={category.meetingUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        定例会に参加
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">現在利用可能なコミュニティはありません</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-base">コミュニティについて</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>・ 各コミュニティでは月1回の定例Zoomミーティングを開催しています</li>
              <li>・ 定例会への参加は「定例会に参加」ボタンからZoom登録ページに移動できます</li>
              <li>・ 過去の定例会の録画アーカイブは各コミュニティページで視聴できます</li>
              <li>・ 投稿機能で他の会員と情報交換ができます</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
