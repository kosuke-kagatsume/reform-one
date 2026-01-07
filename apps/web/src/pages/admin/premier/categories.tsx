import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { StatCard } from '@/components/ui/stat-card'
import { AlertRow } from '@/components/ui/alert-row'
import { RoleBadge } from '@/components/ui/status-badge'
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
  Plus,
  FolderOpen,
  Edit,
  Trash2,
  Video,
  Archive,
  GripVertical,
  Eye,
  EyeOff,
  Search,
  AlertTriangle,
  Users
} from 'lucide-react'

interface CategoryRole {
  id: string
  name: string
  color: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  isVisible: boolean
  role: CategoryRole | null
  _count: {
    seminars: number
    archives: number
  }
}

type SortOption = 'order_asc' | 'name_asc' | 'seminars_desc' | 'archives_desc'
type VisibilityFilter = 'all' | 'visible' | 'hidden'

export default function CategoriesManagementPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [roles, setRoles] = useState<CategoryRole[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('order_asc')
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all')
  const [filterUnused, setFilterUnused] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sortOrder: 0,
    isVisible: true,
    roleId: ''
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
      sortOrder: categories.length,
      isVisible: true,
      roleId: ''
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
      sortOrder: category.sortOrder,
      isVisible: category.isVisible,
      roleId: category.role?.id || ''
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

  const toggleVisibility = async (category: Category) => {
    try {
      const res = await fetch(`/api/seminars/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: category.name,
          slug: category.slug,
          description: category.description,
          sortOrder: category.sortOrder,
          isVisible: !category.isVisible
        })
      })

      if (res.ok) {
        fetchCategories()
      }
    } catch (error) {
      console.error('Failed to toggle visibility:', error)
    }
  }

  // Filter and sort categories
  const getFilteredCategories = () => {
    const filtered = categories.filter(c => {
      // Search filter
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())

      // Visibility filter
      let matchesVisibility = true
      if (visibilityFilter === 'visible') matchesVisibility = c.isVisible
      if (visibilityFilter === 'hidden') matchesVisibility = !c.isVisible

      // Unused filter
      const isUnused = c._count.seminars === 0 && c._count.archives === 0
      const matchesUnused = !filterUnused || isUnused

      return matchesSearch && matchesVisibility && matchesUnused
    })

    // Apply sorting
    switch (sortBy) {
      case 'order_asc':
        filtered.sort((a, b) => a.sortOrder - b.sortOrder)
        break
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
        break
      case 'seminars_desc':
        filtered.sort((a, b) => b._count.seminars - a._count.seminars)
        break
      case 'archives_desc':
        filtered.sort((a, b) => b._count.archives - a._count.archives)
        break
    }

    return filtered
  }

  const filteredCategories = getFilteredCategories()

  // Stats
  const unusedCategories = categories.filter(c => c._count.seminars === 0 && c._count.archives === 0)
  const noRoleCategories = categories.filter(c => !c.role)
  const stats = {
    total: categories.length,
    visible: categories.filter(c => c.isVisible).length,
    hidden: categories.filter(c => !c.isVisible).length,
    unused: unusedCategories.length,
    noRole: noRoleCategories.length,
    totalSeminars: categories.reduce((sum, c) => sum + c._count.seminars, 0),
    totalArchives: categories.reduce((sum, c) => sum + c._count.archives, 0)
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

                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label>表示設定</Label>
                    <div className="flex items-center gap-2 pt-2">
                      <Switch
                        checked={formData.isVisible}
                        onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                      />
                      <span className="text-sm text-slate-600">
                        {formData.isVisible ? '公開' : '非公開'}
                      </span>
                    </div>
                  </div>
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

        {/* Summary Cards - クリックでフィルター適用 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="カテゴリ数"
            value={stats.total}
            subtitle={`公開 ${stats.visible} / 非公開 ${stats.hidden}`}
            icon={FolderOpen}
            iconColor="text-blue-600"
            onClick={() => {
              setFilterUnused(false)
              setVisibilityFilter('all')
            }}
            hoverHint="クリックで全一覧を表示"
          />

          <StatCard
            title="未使用カテゴリ"
            value={stats.unused}
            subtitle="セミナー・アーカイブ0件"
            icon={AlertTriangle}
            iconColor="text-amber-600"
            variant={stats.unused > 0 ? 'warning' : 'default'}
            onClick={() => setFilterUnused(true)}
            hoverHint="クリックで未使用カテゴリを表示"
            cta={stats.unused > 0 ? '要確認' : undefined}
          />

          <StatCard
            title="役割未設定"
            value={stats.noRole}
            subtitle="対象者が未設定"
            icon={Users}
            iconColor="text-slate-500"
            variant={stats.noRole > 0 ? 'warning' : 'default'}
            hoverHint="役割ラベルを設定してください"
            cta={stats.noRole > 0 ? '要設定' : undefined}
          />

          <StatCard
            title="総コンテンツ"
            value={stats.totalSeminars + stats.totalArchives}
            subtitle={`セミナー ${stats.totalSeminars} / アーカイブ ${stats.totalArchives}`}
            icon={Video}
            iconColor="text-purple-600"
          />
        </div>

        {/* 未使用フィルター表示中の通知 */}
        {filterUnused && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800">未使用カテゴリのみ表示中（{stats.unused}件）</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setFilterUnused(false)}>
              フィルター解除
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="カテゴリ名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as VisibilityFilter)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="all">すべての表示状態</option>
            <option value="visible">公開のみ</option>
            <option value="hidden">非公開のみ</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="order_asc">表示順</option>
            <option value="name_asc">名前順</option>
            <option value="seminars_desc">セミナー数順</option>
            <option value="archives_desc">アーカイブ数順</option>
          </select>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              カテゴリ一覧
            </CardTitle>
            <p className="text-sm text-slate-500">{filteredCategories.length}件表示</p>
          </CardHeader>
          <CardContent>
            {filteredCategories.length === 0 ? (
              <div className="py-8 text-center">
                <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  {searchQuery || visibilityFilter !== 'all'
                    ? '検索条件に一致するカテゴリがありません'
                    : 'カテゴリがありません'}
                </p>
                {!searchQuery && visibilityFilter === 'all' && (
                  <Button className="mt-4" onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    最初のカテゴリを追加
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCategories.map((category) => {
                  const isUnused = category._count.seminars === 0 && category._count.archives === 0
                  const alertLevel = isUnused ? 'inactive' : 'none'

                  return (
                    <AlertRow
                      key={category.id}
                      alertLevel={alertLevel}
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50/50 transition-colors ${
                        !category.isVisible ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <GripVertical className="h-5 w-5 text-slate-300" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`font-medium ${!category.isVisible ? 'text-slate-500' : ''}`}>
                              {category.name}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {category.slug}
                            </Badge>
                            {category.role && (
                              <Badge
                                variant="secondary"
                                className="text-xs"
                                style={category.role.color ? { backgroundColor: `${category.role.color}20`, color: category.role.color } : undefined}
                              >
                                <Users className="h-3 w-3 mr-1" />
                                {category.role.name}
                              </Badge>
                            )}
                            {!category.role && (
                              <RoleBadge role={null} className="text-xs" />
                            )}
                            {!category.isVisible && (
                              <Badge variant="secondary" className="text-xs bg-slate-200">
                                <EyeOff className="h-3 w-3 mr-1" />
                                非公開
                              </Badge>
                            )}
                            {isUnused && (
                              <Badge variant="unused" className="text-xs">
                                未使用
                              </Badge>
                            )}
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
                          onClick={() => toggleVisibility(category)}
                          title={category.isVisible ? '非公開にする' : '公開する'}
                        >
                          {category.isVisible ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-slate-400" />
                          )}
                        </Button>
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
                    </AlertRow>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>注意:</strong> セミナーやアーカイブが紐づいているカテゴリは削除できません。
            削除するには、先にセミナーやアーカイブのカテゴリを変更してください。
            非公開にすると、ユーザーからは見えなくなりますがデータは保持されます。
          </p>
        </div>
      </div>
    </PremierAdminLayout>
  )
}
