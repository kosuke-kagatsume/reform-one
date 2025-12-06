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
  FolderOpen,
  Edit,
  Trash2,
  Video,
  Archive,
  GripVertical
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  _count: {
    seminars: number
    archives: number
  }
}

export default function CategoriesManagementPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sortOrder: 0
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) {
      fetchCategories()
    }
  }, [isAuthenticated, isReformCompany])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/seminars/categories')
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      sortOrder: categories.length
    })
    setEditingCategory(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      sortOrder: category.sortOrder
    })
    setDialogOpen(true)
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name)
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      setError('必須項目を入力してください')
      return
    }

    setSaving(true)
    setError('')

    try {
      if (editingCategory) {
        // Update
        const res = await fetch(`/api/seminars/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!res.ok) {
          throw new Error('Update failed')
        }
      } else {
        // Create
        const res = await fetch('/api/seminars/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        if (!res.ok) {
          throw new Error('Create failed')
        }
      }

      setDialogOpen(false)
      resetForm()
      fetchCategories()
    } catch (error) {
      console.error('Failed to save category:', error)
      setError('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/seminars/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchCategories()
      } else {
        const data = await res.json()
        setError(data.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      setError('削除に失敗しました')
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
          <div>
            <h1 className="text-2xl font-bold">カテゴリ管理</h1>
            <p className="text-slate-600">セミナー・アーカイブのカテゴリを管理</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                カテゴリを追加
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'カテゴリを編集' : 'カテゴリを追加'}
                </DialogTitle>
                <DialogDescription>
                  セミナーとアーカイブの分類に使用するカテゴリを作成します
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">カテゴリ名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="例: 経営戦略"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">識別子（スラッグ） *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="例: management-strategy"
                  />
                  <p className="text-xs text-slate-500">
                    URLに使用される識別子です。英数字とハイフンのみ使用できます。
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="カテゴリの説明"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">表示順序</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    min={0}
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
                  {saving ? '保存中...' : editingCategory ? '更新' : '追加'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              カテゴリ一覧
              <Badge variant="secondary" className="ml-2">
                {categories.length}件
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="py-8 text-center">
                <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">カテゴリがありません</p>
                <Button className="mt-4" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  最初のカテゴリを追加
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <GripVertical className="h-5 w-5 text-slate-300" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{category.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {category.slug}
                          </Badge>
                        </div>
                        {category.description && (
                          <p className="text-sm text-slate-500 mt-1">{category.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            <span>セミナー: {category._count.seminars}件</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Archive className="h-3 w-3" />
                            <span>アーカイブ: {category._count.archives}件</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            disabled={category._count.seminars > 0 || category._count.archives > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>カテゴリを削除しますか？</AlertDialogTitle>
                            <AlertDialogDescription>
                              「{category.name}」を削除します。この操作は取り消せません。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              削除する
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>注意:</strong> セミナーやアーカイブが紐づいているカテゴリは削除できません。
            削除するには、先にセミナーやアーカイブのカテゴリを変更してください。
          </p>
        </div>
      </div>
    </PremierAdminLayout>
  )
}
