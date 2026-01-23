import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { StatCard } from '@/components/ui/stat-card'
import { AlertRow } from '@/components/ui/alert-row'
import { useAuth } from '@/lib/auth-context'
import {
  Video,
  Search,
  Plus,
  Clock,
  Eye,
  EyeOff,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Film,
  AlertTriangle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Category {
  id: string
  name: string
  slug: string
}

interface Archive {
  id: string
  title: string
  description: string | null
  youtubeUrl: string
  thumbnailUrl: string | null
  duration: number | null
  publishedAt: string
  category: Category
  shortVersionUrl: string | null
  shortVersionDuration: number | null
  _count: { views: number }
}

export default function ArchivesAdminPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [archives, setArchives] = useState<Archive[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingArchive, setDeletingArchive] = useState<Archive | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState('date_desc')
  const [filterUnwatched, setFilterUnwatched] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) {
      fetchData()
    }
  }, [isAuthenticated, isReformCompany])

  const fetchData = async () => {
    try {
      const [archivesRes, categoriesRes] = await Promise.all([
        fetch('/api/archives'),
        fetch('/api/archives/categories')
      ])

      if (archivesRes.ok) {
        const data = await archivesRes.json()
        setArchives(data.archives)
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

  const handleDelete = (archive: Archive) => {
    setDeletingArchive(archive)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingArchive) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/archives/${deletingArchive.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setIsDeleteDialogOpen(false)
        setDeletingArchive(null)
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete archive:', error)
      alert('削除に失敗しました')
    } finally {
      setSubmitting(false)
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

  const getFilteredAndSortedArchives = () => {
    const filtered = archives.filter(a => {
      const matchesCategory = selectedCategory === 'all' || a.category.id === selectedCategory
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesUnwatched = !filterUnwatched || a._count.views === 0
      return matchesCategory && matchesSearch && matchesUnwatched
    })

    // Apply sorting
    switch (sortBy) {
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        break
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
        break
      case 'views_desc':
        filtered.sort((a, b) => b._count.views - a._count.views)
        break
      case 'title_asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'ja'))
        break
    }

    return filtered
  }

  const filteredArchives = getFilteredAndSortedArchives()

  const totalViews = archives.reduce((sum, a) => sum + a._count.views, 0)
  const unwatchedCount = archives.filter(a => a._count.views === 0).length
  const withShortVersionCount = archives.filter(a => a.shortVersionUrl).length
  const totalHours = Math.round(archives.reduce((sum, a) => sum + (a.duration || 0), 0) / 60)

  if (isLoading || loading) {
    return (
      <PremierAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </PremierAdminLayout>
    )
  }

  return (
    <PremierAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">アーカイブ管理</h1>
            <p className="text-slate-600">アーカイブ動画の追加・編集・管理</p>
          </div>
          <Button asChild>
            <Link href="/admin/premier/archives/new">
              <Plus className="h-4 w-4 mr-2" />
              新規アーカイブを追加
            </Link>
          </Button>
        </div>

        {/* Summary Cards - クリックでフィルター適用 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="総アーカイブ数"
            value={archives.length}
            subtitle={`ショートバージョン: ${withShortVersionCount}件`}
            icon={Video}
            iconColor="text-purple-600"
            onClick={() => {
              setFilterUnwatched(false)
              setSortBy('date_desc')
            }}
            hoverHint="クリックで全一覧を表示"
          />

          <StatCard
            title="総視聴回数"
            value={totalViews}
            description="各アーカイブの視聴回数の合計"
            icon={Eye}
            iconColor="text-blue-600"
            onClick={() => {
              setFilterUnwatched(false)
              setSortBy('views_desc')
            }}
            hoverHint="クリックで視聴回数順にソート"
          />

          <StatCard
            title="未視聴アーカイブ"
            value={unwatchedCount}
            subtitle="視聴回数0のアーカイブ"
            icon={EyeOff}
            iconColor="text-amber-600"
            variant={unwatchedCount > 0 ? 'warning' : 'default'}
            onClick={() => {
              setFilterUnwatched(true)
              setSortBy('date_desc')
            }}
            hoverHint="クリックで未視聴一覧を表示"
            cta={unwatchedCount > 0 ? '要確認' : undefined}
          />

          <StatCard
            title="総コンテンツ時間"
            value={`${totalHours}時間`}
            icon={Clock}
            iconColor="text-green-600"
          />
        </div>

        {/* 未視聴フィルター表示中の通知 */}
        {filterUnwatched && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800">未視聴アーカイブのみ表示中（{unwatchedCount}件）</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setFilterUnwatched(false)}>
              フィルター解除
            </Button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="アーカイブ名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="all">すべてのカテゴリ</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="date_desc">公開日（新しい順）</option>
            <option value="date_asc">公開日（古い順）</option>
            <option value="views_desc">視聴回数順</option>
            <option value="title_asc">タイトル順</option>
          </select>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">アーカイブ一覧</CardTitle>
            <p className="text-sm text-slate-500">{filteredArchives.length}件表示</p>
          </CardHeader>
          <CardContent>
            {filteredArchives.length === 0 ? (
              <div className="py-8 text-center">
                <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">アーカイブがありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArchives.map((archive) => {
                  const isUnwatched = archive._count.views === 0
                  const hasShortVersion = !!archive.shortVersionUrl

                  return (
                    <AlertRow
                      key={archive.id}
                      alertLevel={isUnwatched ? 'warning' : 'none'}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-24 h-14 flex-shrink-0">
                          {archive.thumbnailUrl ? (
                            <img
                              src={archive.thumbnailUrl}
                              alt={archive.title}
                              className="w-24 h-14 object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const fallback = target.nextElementSibling as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div
                            className="w-24 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded items-center justify-center"
                            style={{ display: archive.thumbnailUrl ? 'none' : 'flex' }}
                          >
                            <Video className="h-6 w-6 text-white/80" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{archive.category.name}</Badge>
                            <span className="font-medium">{archive.title}</span>
                            {isUnwatched && (
                              <Badge variant="unused">未視聴</Badge>
                            )}
                            {hasShortVersion && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Film className="h-3 w-3" />
                                ショート版あり
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(archive.publishedAt)}</span>
                            </div>
                            {archive.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(archive.duration)}</span>
                                {hasShortVersion && archive.shortVersionDuration && (
                                  <span className="text-purple-600">
                                    （ショート: {formatDuration(archive.shortVersionDuration)}）
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{archive._count.views}回視聴</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={archive.youtubeUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            YouTube
                          </a>
                        </Button>
                        {hasShortVersion && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={archive.shortVersionUrl!} target="_blank" rel="noopener noreferrer">
                              <Film className="h-4 w-4 mr-1" />
                              ショート版
                            </a>
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/premier/archives/${archive.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(archive)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </AlertRow>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 削除確認ダイアログ */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>アーカイブを削除</DialogTitle>
              <DialogDescription>
                「{deletingArchive?.title}」を削除しますか？この操作は取り消せません。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                キャンセル
              </Button>
              <Button type="button" variant="destructive" onClick={confirmDelete} disabled={submitting}>
                {submitting ? '削除中...' : '削除'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PremierAdminLayout>
  )
}
