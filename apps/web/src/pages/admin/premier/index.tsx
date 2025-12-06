import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import {
  Building,
  Users,
  Calendar,
  Video,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  CheckCircle,
  Clock,
  FileText,
  Mail
} from 'lucide-react'

interface DashboardStats {
  totalOrganizations: number
  activeSubscriptions: number
  upcomingSeminars: number
  totalArchives: number
  communityCategories: number
  totalMembers: number
}

export default function PremierAdminDashboard() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    activeSubscriptions: 0,
    upcomingSeminars: 0,
    totalArchives: 0,
    communityCategories: 0,
    totalMembers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    if (!isLoading && isAuthenticated && !isReformCompany) {
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, isReformCompany, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) {
      fetchStats()
    }
  }, [isAuthenticated, isReformCompany])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/premier/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <PremierAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </PremierAdminLayout>
    )
  }

  const statCards = [
    {
      title: '契約組織数',
      value: stats.totalOrganizations,
      icon: Building,
      color: 'blue',
      href: '/admin/premier/organizations'
    },
    {
      title: 'アクティブ契約',
      value: stats.activeSubscriptions,
      icon: CheckCircle,
      color: 'green',
      href: '/admin/premier/organizations'
    },
    {
      title: '今後のセミナー',
      value: stats.upcomingSeminars,
      icon: Calendar,
      color: 'purple',
      href: '/admin/premier/seminars'
    },
    {
      title: 'アーカイブ動画',
      value: stats.totalArchives,
      icon: Video,
      color: 'orange',
      href: '/admin/premier/archives'
    },
    {
      title: 'コミュニティ',
      value: stats.communityCategories,
      icon: MessageSquare,
      color: 'green',
      href: '/admin/premier/community'
    },
    {
      title: '総会員数',
      value: stats.totalMembers,
      icon: Users,
      color: 'slate',
      href: '/admin/premier/members'
    }
  ]

  return (
    <PremierAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">プレミア購読 管理ダッシュボード</h1>
          <p className="text-slate-600">契約組織・セミナー・アーカイブ・コミュニティの管理</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                          <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-sm text-slate-600">{stat.title}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">クイックアクション</CardTitle>
              <CardDescription>よく使う操作</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/admin/premier/seminars/new">
                    <Calendar className="mr-2 h-4 w-4" />
                    新規セミナーを作成
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/admin/premier/archives/new">
                    <Video className="mr-2 h-4 w-4" />
                    新規アーカイブを追加
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/admin/premier/organizations/new">
                    <Building className="mr-2 h-4 w-4" />
                    新規契約組織を登録
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/admin/premier/community">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    コミュニティを管理
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/admin/premier/databooks">
                    <FileText className="mr-2 h-4 w-4" />
                    データブックを管理
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/admin/premier/newsletters">
                    <Mail className="mr-2 h-4 w-4" />
                    ニュースレターを管理
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">システム情報</CardTitle>
              <CardDescription>プレミア購読サービスの概要</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">スタンダードプラン</p>
                    <p className="text-sm text-slate-500">セミナー参加 + アーカイブ視聴</p>
                  </div>
                  <Badge>¥55,000/年</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">エキスパートプラン</p>
                    <p className="text-sm text-slate-500">全機能 + コミュニティアクセス</p>
                  </div>
                  <Badge className="bg-blue-600">¥165,000/年</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PremierAdminLayout>
  )
}
