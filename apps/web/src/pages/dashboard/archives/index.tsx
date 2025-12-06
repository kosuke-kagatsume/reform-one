import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import {
  Video,
  Search,
  Clock,
  Eye,
  Play
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  _count: { archives: number }
}

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

export default function ArchivesPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated } = useAuth()
  const [archives, setArchives] = useState<Archive[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchArchives()
    }
  }, [isAuthenticated, selectedCategory, searchQuery])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/archives/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchArchives = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') {
        params.append('categoryId', selectedCategory)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const res = await fetch(`/api/archives?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setArchives(data.archives)
      }
    } catch (error) {
      console.error('Failed to fetch archives:', error)
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}時間${mins > 0 ? `${mins}分` : ''}`
    }
    return `${mins}分`
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">アーカイブ動画</h1>
          <p className="text-slate-600">過去のセミナー動画をいつでも視聴できます</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="タイトルや説明文で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">
              すべて
              <Badge variant="secondary" className="ml-2 text-xs">
                {archives.length}
              </Badge>
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category._count.archives}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {archives.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">
                    {searchQuery
                      ? '検索条件に一致するアーカイブがありません'
                      : 'このカテゴリにはまだアーカイブがありません'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archives.map((archive) => (
                  <Link key={archive.id} href={`/dashboard/archives/${archive.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <div className="relative">
                        {archive.thumbnailUrl ? (
                          <img
                            src={archive.thumbnailUrl}
                            alt={archive.title}
                            className="w-full h-40 object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-purple-500 to-purple-700 rounded-t-lg flex items-center justify-center">
                            <Video className="h-12 w-12 text-white/80" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 rounded-t-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 rounded-full p-3">
                            <Play className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                        {archive.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(archive.duration)}
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <Badge variant="outline" className="w-fit text-xs mb-2">
                          {archive.category.name}
                        </Badge>
                        <CardTitle className="text-base line-clamp-2">
                          {archive.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {archive.description && (
                          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                            {archive.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(archive.publishedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{archive._count.views}回視聴</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
