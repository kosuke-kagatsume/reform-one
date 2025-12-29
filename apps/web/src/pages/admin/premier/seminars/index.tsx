import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import {
  Calendar,
  Search,
  Plus,
  Clock,
  User,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  AlertTriangle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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

interface Seminar {
  id: string
  title: string
  description: string | null
  instructor: string | null
  scheduledAt: string
  duration: number | null
  zoomUrl: string | null
  imageUrl: string | null
  isPublic: boolean
  publicPrice: number | null
  category: Category
  _count: { participants: number }
}

interface SeminarStats {
  upcoming: number
  past: number
  totalParticipants: number
  thisMonthParticipants: number
  lastMonthParticipants: number
  nextSeminar: {
    id: string
    title: string
    scheduledAt: string
  } | null
  upcomingWithin7Days: number
}

type SortOption = 'date_asc' | 'date_desc' | 'participants_desc' | 'title_asc'

export default function SeminarsAdminPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [seminars, setSeminars] = useState<Seminar[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [sortBy, setSortBy] = useState<SortOption>('date_asc')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingSeminar, setDeletingSeminar] = useState<Seminar | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [stats, setStats] = useState<SeminarStats | null>(null)

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
      const [seminarsRes, categoriesRes] = await Promise.all([
        fetch('/api/seminars'),
        fetch('/api/seminars/categories')
      ])

      if (seminarsRes.ok) {
        const data = await seminarsRes.json()
        setSeminars(data.seminars)
        calculateStats(data.seminars)
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

  const calculateStats = (seminarsData: Seminar[]) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const upcoming = seminarsData.filter(s => new Date(s.scheduledAt) >= now)
    const past = seminarsData.filter(s => new Date(s.scheduledAt) < now)
    const upcomingWithin7Days = upcoming.filter(s => new Date(s.scheduledAt) <= sevenDaysFromNow).length

    // Find next seminar
    const nextSeminar = upcoming.length > 0
      ? upcoming.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]
      : null

    // Calculate participants (this is a simplified version - ideally this should come from API)
    const totalParticipants = seminarsData.reduce((sum, s) => sum + s._count.participants, 0)

    setStats({
      upcoming: upcoming.length,
      past: past.length,
      totalParticipants,
      thisMonthParticipants: 0, // Would need API enhancement
      lastMonthParticipants: 0, // Would need API enhancement
      nextSeminar: nextSeminar ? {
        id: nextSeminar.id,
        title: nextSeminar.title,
        scheduledAt: nextSeminar.scheduledAt
      } : null,
      upcomingWithin7Days
    })
  }

  const handleDelete = (seminar: Seminar) => {
    setDeletingSeminar(seminar)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingSeminar) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/seminars/${deletingSeminar.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setIsDeleteDialogOpen(false)
        setDeletingSeminar(null)
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete seminar:', error)
      alert('削除に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = (seminar: Seminar) => {
    // Navigate to new page with copy parameters
    const params = new URLSearchParams({
      copy: seminar.id,
      title: `${seminar.title}（コピー）`,
      categoryId: seminar.category.id,
      instructor: seminar.instructor || '',
      duration: String(seminar.duration || 60),
      zoomUrl: seminar.zoomUrl || '',
      description: seminar.description || '',
      isPublic: String(seminar.isPublic),
      publicPrice: String(seminar.publicPrice || 0)
    })
    router.push(`/admin/premier/seminars/new?${params.toString()}`)
  }

  const handleTemplate = (seminar: Seminar) => {
    // For now, templates work the same as copy but without the date
    handleCopy(seminar)
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

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const getDaysUntil = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  const now = new Date()
  const upcomingSeminars = seminars.filter(s => new Date(s.scheduledAt) >= now)
  const pastSeminars = seminars.filter(s => new Date(s.scheduledAt) < now)

  // Apply filters and sorting
  const getFilteredSeminars = () => {
    let filtered = (activeTab === 'upcoming' ? upcomingSeminars : pastSeminars)
      .filter(s => {
        const matchesCategory = selectedCategory === 'all' || s.category.id === selectedCategory
        const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
      })

    // Apply sorting
    switch (sortBy) {
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        break
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
        break
      case 'participants_desc':
        filtered.sort((a, b) => b._count.participants - a._count.participants)
        break
      case 'title_asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'ja'))
        break
    }

    return filtered
  }

  const filteredSeminars = getFilteredSeminars()

  const participantsDiff = stats ? stats.thisMonthParticipants - stats.lastMonthParticipants : 0

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
            <h1 className="text-2xl font-bold">セミナー管理</h1>
            <p className="text-slate-600">セミナーの作成・編集・管理</p>
          </div>
          <Button asChild>
            <Link href="/admin/premier/seminars/new">
              <Plus className="h-4 w-4 mr-2" />
              新規セミナーを作成
            </Link>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 今後のセミナー */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold">{stats?.upcoming || 0}</p>
                  <p className="text-sm text-slate-600">今後のセミナー</p>
                  {stats?.nextSeminar ? (
                    <p className="text-xs text-blue-600 mt-1">
                      次回: {formatShortDate(stats.nextSeminar.scheduledAt)} {formatTime(stats.nextSeminar.scheduledAt)}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      未設定
                    </p>
                  )}
                </div>
                {stats?.upcomingWithin7Days && stats.upcomingWithin7Days > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {stats.upcomingWithin7Days}件が7日以内
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 過去のセミナー */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold">{stats?.past || 0}</p>
                  <p className="text-sm text-slate-600">過去のセミナー</p>
                  <p className="text-xs text-slate-500 mt-1">累計開催数</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 参加者数 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold">{stats?.totalParticipants || 0}</p>
                  <p className="text-sm text-slate-600">累計参加者数</p>
                  <div className="flex items-center gap-1 mt-1">
                    {participantsDiff > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">+{participantsDiff} 前月比</span>
                      </>
                    ) : participantsDiff < 0 ? (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-600" />
                        <span className="text-xs text-red-600">{participantsDiff} 前月比</span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-500">前月比 ±0</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="セミナー名で検索..."
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
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="date_asc">開催日（昇順）</option>
            <option value="date_desc">開催日（降順）</option>
            <option value="participants_desc">参加者数順</option>
            <option value="title_asc">タイトル順</option>
          </select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming">
              今後のセミナー
              <Badge variant="secondary" className="ml-2">{upcomingSeminars.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="past">
              過去のセミナー
              <Badge variant="secondary" className="ml-2">{pastSeminars.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardContent className="pt-6">
                {filteredSeminars.length === 0 ? (
                  <div className="py-8 text-center">
                    <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">セミナーがありません</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSeminars.map((seminar) => {
                      const daysUntil = getDaysUntil(seminar.scheduledAt)
                      const isWithin7Days = daysUntil >= 0 && daysUntil <= 7
                      const isPast = daysUntil < 0

                      return (
                        <div
                          key={seminar.id}
                          className={`flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors ${
                            isWithin7Days && !isPast ? 'border-amber-200 bg-amber-50/50' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{seminar.category.name}</Badge>
                              <span className="font-medium">{seminar.title}</span>
                              {isWithin7Days && !isPast && (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                  {daysUntil === 0 ? '本日' : `${daysUntil}日後`}
                                </Badge>
                              )}
                              {seminar.isPublic && (
                                <Badge variant="secondary">一般公開</Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(seminar.scheduledAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatTime(seminar.scheduledAt)}
                                  {seminar.duration && ` (${seminar.duration}分)`}
                                </span>
                              </div>
                              {seminar.instructor && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{seminar.instructor}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{seminar._count.participants}名参加</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {seminar.zoomUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={seminar.zoomUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Zoom
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
                                <DropdownMenuItem onClick={() => router.push(`/admin/premier/seminars/${seminar.id}/edit`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  編集
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCopy(seminar)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  複製
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleTemplate(seminar)}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  テンプレートとして使用
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(seminar)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  削除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 削除確認ダイアログ */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>セミナーを削除</DialogTitle>
              <DialogDescription>
                「{deletingSeminar?.title}」を削除しますか？この操作は取り消せません。
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
