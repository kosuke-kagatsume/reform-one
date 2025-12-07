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
  Trash2
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

interface Seminar {
  id: string
  title: string
  description: string | null
  instructor: string | null
  scheduledAt: string
  duration: number | null
  zoomUrl: string | null
  category: Category
  _count: { participants: number }
}

export default function SeminarsAdminPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [seminars, setSeminars] = useState<Seminar[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingSeminar, setDeletingSeminar] = useState<Seminar | null>(null)
  const [submitting, setSubmitting] = useState(false)

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

  const now = new Date()
  const upcomingSeminars = seminars.filter(s => new Date(s.scheduledAt) >= now)
  const pastSeminars = seminars.filter(s => new Date(s.scheduledAt) < now)

  const filteredSeminars = (activeTab === 'upcoming' ? upcomingSeminars : pastSeminars)
    .filter(s => {
      const matchesCategory = selectedCategory === 'all' || s.category.id === selectedCategory
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingSeminars.length}</p>
                  <p className="text-sm text-slate-600">今後のセミナー</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pastSeminars.length}</p>
                  <p className="text-sm text-slate-600">過去のセミナー</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {seminars.reduce((sum, s) => sum + s._count.participants, 0)}
                  </p>
                  <p className="text-sm text-slate-600">総参加者数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">すべてのカテゴリ</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
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
                    {filteredSeminars.map((seminar) => (
                      <div
                        key={seminar.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{seminar.category.name}</Badge>
                            <span className="font-medium">{seminar.title}</span>
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
                            <span>{seminar._count.participants}名参加</span>
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
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(seminar)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
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
