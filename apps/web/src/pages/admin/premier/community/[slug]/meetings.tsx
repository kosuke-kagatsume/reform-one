import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/lib/auth-context'
import {
  ArrowLeft,
  Plus,
  Video,
  Calendar,
  Edit,
  Trash2,
  Play,
  ExternalLink
} from 'lucide-react'

interface MeetingArchive {
  id: string
  title: string
  description: string | null
  youtubeUrl: string
  heldAt: string
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  meetingUrl: string | null
  meetingArchives: MeetingArchive[]
}

export default function MeetingsManagementPage() {
  const router = useRouter()
  const { slug } = router.query
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<MeetingArchive | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    heldAt: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany && slug) {
      fetchCategory()
    }
  }, [isAuthenticated, isReformCompany, slug])

  const fetchCategory = async () => {
    try {
      const res = await fetch(`/api/community/categories/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setCategory(data.category)
      } else {
        setError('カテゴリが見つかりません')
      }
    } catch (error) {
      console.error('Failed to fetch category:', error)
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      heldAt: new Date().toISOString().split('T')[0]
    })
    setEditingMeeting(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (meeting: MeetingArchive) => {
    setEditingMeeting(meeting)
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      youtubeUrl: meeting.youtubeUrl,
      heldAt: new Date(meeting.heldAt).toISOString().split('T')[0]
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.youtubeUrl || !formData.heldAt) {
      setError('必須項目を入力してください')
      return
    }

    setSaving(true)
    setError('')

    try {
      if (editingMeeting) {
        // Update
        const res = await fetch(`/api/community/meetings/${editingMeeting.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description || null,
            youtubeUrl: formData.youtubeUrl,
            heldAt: new Date(formData.heldAt).toISOString()
          })
        })

        if (!res.ok) {
          throw new Error('Update failed')
        }
      } else {
        // Create
        const res = await fetch('/api/community/meetings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryId: category?.id,
            title: formData.title,
            description: formData.description || null,
            youtubeUrl: formData.youtubeUrl,
            heldAt: new Date(formData.heldAt).toISOString()
          })
        })

        if (!res.ok) {
          throw new Error('Create failed')
        }
      }

      setDialogOpen(false)
      resetForm()
      fetchCategory()
    } catch (error) {
      console.error('Failed to save meeting:', error)
      setError('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (meetingId: string) => {
    try {
      const res = await fetch(`/api/community/meetings/${meetingId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchCategory()
      } else {
        setError('削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete meeting:', error)
      setError('削除に失敗しました')
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

  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)
    return match ? match[1] : null
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

  if (!category) {
    return (
      <PremierAdminLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">カテゴリが見つかりません</p>
          <Button asChild className="mt-4">
            <Link href="/admin/premier/community">一覧に戻る</Link>
          </Button>
        </div>
      </PremierAdminLayout>
    )
  }

  return (
    <PremierAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/premier/community">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{category.name}</h1>
              <p className="text-slate-600">定例会アーカイブ管理</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                アーカイブを追加
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingMeeting ? '定例会アーカイブを編集' : '定例会アーカイブを追加'}
                </DialogTitle>
                <DialogDescription>
                  定例会のアーカイブ動画を追加します
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">タイトル *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例: 第10回 経営者定例会"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="定例会の内容を簡潔に"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube URL *</Label>
                  <Input
                    id="youtubeUrl"
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heldAt">開催日 *</Label>
                  <Input
                    id="heldAt"
                    type="date"
                    value={formData.heldAt}
                    onChange={(e) => setFormData({ ...formData, heldAt: e.target.value })}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? '保存中...' : editingMeeting ? '更新' : '追加'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              アーカイブ一覧
              <Badge variant="secondary" className="ml-2">
                {category.meetingArchives.length}件
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {category.meetingArchives.length === 0 ? (
              <div className="py-8 text-center">
                <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">アーカイブがありません</p>
                <Button className="mt-4" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  最初のアーカイブを追加
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {category.meetingArchives.map((meeting) => {
                  const videoId = extractYouTubeId(meeting.youtubeUrl)
                  return (
                    <div
                      key={meeting.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      {videoId && (
                        <div className="w-40 flex-shrink-0">
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                            alt={meeting.title}
                            className="w-full rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{meeting.title}</h3>
                        {meeting.description && (
                          <p className="text-sm text-slate-600 mt-1">{meeting.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(meeting.heldAt)}</span>
                          </div>
                          <a
                            href={meeting.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <Play className="h-3 w-3" />
                            <span>視聴</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(meeting)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>アーカイブを削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                「{meeting.title}」を削除します。この操作は取り消せません。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(meeting.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                削除する
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PremierAdminLayout>
  )
}
