import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth-context'
import { ArrowLeft, Save, Calendar, Clock, User, Video, FileText, Trash2 } from 'lucide-react'
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

interface Category {
  id: string
  name: string
  slug: string
}

interface Seminar {
  id: string
  title: string
  description: string | null
  categoryId: string
  instructor: string | null
  scheduledAt: string
  duration: number | null
  zoomUrl: string | null
  imageUrl: string | null
  isPublic: boolean
  publicPrice: number | null
  category: Category
}

export default function EditSeminarPage() {
  const router = useRouter()
  const { id } = router.query
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    instructor: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    zoomUrl: '',
    imageUrl: '',
    isPublic: false,
    publicPrice: 0
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany && id) {
      fetchData()
    }
  }, [isAuthenticated, isReformCompany, id])

  const fetchData = async () => {
    try {
      const [seminarRes, categoriesRes] = await Promise.all([
        fetch(`/api/seminars/${id}`),
        fetch('/api/seminars/categories')
      ])

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.categories)
      }

      if (seminarRes.ok) {
        const data = await seminarRes.json()
        const seminar: Seminar = data.seminar
        const scheduledAt = new Date(seminar.scheduledAt)

        setFormData({
          title: seminar.title,
          description: seminar.description || '',
          categoryId: seminar.categoryId,
          instructor: seminar.instructor || '',
          scheduledDate: scheduledAt.toISOString().split('T')[0],
          scheduledTime: scheduledAt.toTimeString().slice(0, 5),
          duration: seminar.duration || 60,
          zoomUrl: seminar.zoomUrl || '',
          imageUrl: seminar.imageUrl || '',
          isPublic: seminar.isPublic,
          publicPrice: seminar.publicPrice || 0
        })
      } else {
        setError('セミナーが見つかりません')
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    if (!formData.title || !formData.categoryId || !formData.scheduledDate || !formData.scheduledTime) {
      setError('必須項目を入力してください')
      setSaving(false)
      return
    }

    try {
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`)

      const res = await fetch(`/api/seminars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          categoryId: formData.categoryId,
          instructor: formData.instructor || null,
          scheduledAt: scheduledAt.toISOString(),
          duration: formData.duration,
          zoomUrl: formData.zoomUrl || null,
          imageUrl: formData.imageUrl || null,
          isPublic: formData.isPublic,
          publicPrice: formData.isPublic ? formData.publicPrice : null
        })
      })

      if (res.ok) {
        router.push('/admin/premier/seminars')
      } else {
        const data = await res.json()
        setError(data.error || '更新に失敗しました')
      }
    } catch (error) {
      console.error('Failed to update seminar:', error)
      setError('更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/seminars/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.push('/admin/premier/seminars')
      } else {
        const data = await res.json()
        setError(data.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete seminar:', error)
      setError('削除に失敗しました')
    } finally {
      setDeleting(false)
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

  return (
    <PremierAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/premier/seminars">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">セミナー編集</h1>
              <p className="text-slate-600">セミナーの情報を編集</p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>セミナーを削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  この操作は取り消せません。セミナーに関連するすべてのデータ（参加者情報など）も削除されます。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  削除する
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  基本情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">セミナータイトル *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例: リフォーム業界の最新トレンド2024"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="セミナーの概要を入力してください"
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">カテゴリ *</Label>
                    <select
                      id="category"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructor" className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      講師
                    </Label>
                    <Input
                      id="instructor"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      placeholder="例: 山田太郎"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  開催日時
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">開催日 *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">開始時間 *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    所要時間（分）
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                    min={15}
                    max={480}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  配信設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zoomUrl">Zoom URL</Label>
                  <Input
                    id="zoomUrl"
                    type="url"
                    value={formData.zoomUrl}
                    onChange={(e) => setFormData({ ...formData, zoomUrl: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">サムネイル画像URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isPublic">一般公開セミナー</Label>
                  </div>

                  {formData.isPublic && (
                    <div className="space-y-2">
                      <Label htmlFor="publicPrice">参加費（円）</Label>
                      <Input
                        id="publicPrice"
                        type="number"
                        value={formData.publicPrice}
                        onChange={(e) => setFormData({ ...formData, publicPrice: parseInt(e.target.value) || 0 })}
                        min={0}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/premier/seminars">キャンセル</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? '保存中...' : '変更を保存'}
            </Button>
          </div>
        </form>
      </div>
    </PremierAdminLayout>
  )
}
