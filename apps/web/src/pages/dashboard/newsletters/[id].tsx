import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import {
  ArrowLeft,
  Calendar,
  Mail
} from 'lucide-react'

interface Newsletter {
  id: string
  title: string
  content: string
  summary: string | null
  sentAt: string | null
  createdAt: string
}

export default function NewsletterDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { isLoading, isAuthenticated, hasFeature } = useAuth()
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null)
  const [loading, setLoading] = useState(true)

  const canAccessNewsletters = hasFeature('newsletter')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    if (!isLoading && isAuthenticated && !canAccessNewsletters) {
      router.push('/dashboard/newsletters')
    }
  }, [isLoading, isAuthenticated, canAccessNewsletters, router])

  useEffect(() => {
    if (isAuthenticated && canAccessNewsletters && id) {
      fetchNewsletter()
    }
  }, [isAuthenticated, canAccessNewsletters, id])

  const fetchNewsletter = async () => {
    try {
      const res = await fetch(`/api/newsletters/${id}`)
      if (res.ok) {
        const data = await res.json()
        setNewsletter(data.newsletter)
      } else {
        router.push('/dashboard/newsletters')
      }
    } catch (error) {
      console.error('Failed to fetch newsletter:', error)
      router.push('/dashboard/newsletters')
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

  if (!newsletter) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/newsletters">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{newsletter.title}</h1>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="h-4 w-4" />
              {formatDate(newsletter.sentAt || newsletter.createdAt)}
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="py-8">
            <div className="prose prose-slate max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: newsletter.content }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
