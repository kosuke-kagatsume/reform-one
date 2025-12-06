import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import {
  Mail,
  Calendar,
  Lock,
  ChevronRight
} from 'lucide-react'

interface Newsletter {
  id: string
  title: string
  summary: string | null
  sentAt: string | null
  createdAt: string
}

export default function NewslettersPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, hasFeature } = useAuth()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)

  const canAccessNewsletters = hasFeature('newsletter')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canAccessNewsletters) {
      fetchNewsletters()
    } else if (isAuthenticated && !canAccessNewsletters) {
      setLoading(false)
    }
  }, [isAuthenticated, canAccessNewsletters])

  const fetchNewsletters = async () => {
    try {
      const res = await fetch('/api/newsletters')
      if (res.ok) {
        const data = await res.json()
        setNewsletters(data.newsletters)
      }
    } catch (error) {
      console.error('Failed to fetch newsletters:', error)
    } finally {
      setLoading(false)
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
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!canAccessNewsletters) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">編集長ニュースレター</h1>
            <p className="text-slate-600">業界の最新動向・分析をお届け</p>
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
                    ニュースレターはエキスパートプランでご利用いただけます。
                    編集長による業界分析・最新動向を定期的にお届けします。
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
          <h1 className="text-2xl font-bold">編集長ニュースレター</h1>
          <p className="text-slate-600">
            業界の最新動向・分析をお届け（エキスパートプラン特典）
          </p>
        </div>

        {newsletters.length > 0 ? (
          <div className="space-y-4">
            {newsletters.map((newsletter) => (
              <Link key={newsletter.id} href={`/dashboard/newsletters/${newsletter.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{newsletter.title}</h3>
                        {newsletter.summary && (
                          <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                            {newsletter.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          {formatDate(newsletter.sentAt || newsletter.createdAt)}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">
                ニュースレターはまだありません
              </h3>
              <p className="text-slate-500">
                新しいニュースレターが配信されるまでお待ちください。
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
