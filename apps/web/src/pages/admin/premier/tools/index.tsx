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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import {
  Plus,
  Wrench,
  FileSpreadsheet,
  FileText,
  Calculator,
  Download,
  ExternalLink,
  Edit,
  Trash2,
  Search,
  Eye,
  EyeOff
} from 'lucide-react'

interface Tool {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  fileUrl: string | null
  externalUrl: string | null
  iconName: string | null
  requiredPlan: string
  sortOrder: number
  isPublished: boolean
  usageCount?: number
}

const categoryOptions = [
  { value: 'SPREADSHEET', label: 'スプレッドシート' },
  { value: 'DOCUMENT', label: 'ドキュメント' },
  { value: 'CALCULATOR', label: '計算ツール' },
  { value: 'OTHER', label: 'その他' },
]

const planOptions = [
  { value: 'STANDARD', label: 'STANDARD' },
  { value: 'EXPERT', label: 'EXPERT' },
]

export default function AdminToolsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [deletingTool, setDeletingTool] = useState<Tool | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('order_asc')

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'SPREADSHEET',
    fileUrl: '',
    externalUrl: '',
    iconName: '',
    requiredPlan: 'STANDARD',
    sortOrder: '0',
    isPublished: true,
  })

  const [editFormData, setEditFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'SPREADSHEET',
    fileUrl: '',
    externalUrl: '',
    iconName: '',
    requiredPlan: 'STANDARD',
    sortOrder: '0',
    isPublished: true,
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) {
      fetchTools()
    }
  }, [isAuthenticated, isReformCompany])

  const fetchTools = async () => {
    try {
      const res = await fetch('/api/tools')
      if (res.ok) {
        const data = await res.json()
        setTools(data.tools || [])
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sortOrder: parseInt(formData.sortOrder),
        }),
      })

      if (res.ok) {
        setIsDialogOpen(false)
        setFormData({
          name: '',
          slug: '',
          description: '',
          category: 'SPREADSHEET',
          fileUrl: '',
          externalUrl: '',
          iconName: '',
          requiredPlan: 'STANDARD',
          sortOrder: '0',
          isPublished: true,
        })
        fetchTools()
      } else {
        const error = await res.json()
        alert(error.error || '作成に失敗しました')
      }
    } catch (error) {
      console.error('Failed to create tool:', error)
      alert('作成に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool)
    setEditFormData({
      name: tool.name,
      slug: tool.slug,
      description: tool.description || '',
      category: tool.category,
      fileUrl: tool.fileUrl || '',
      externalUrl: tool.externalUrl || '',
      iconName: tool.iconName || '',
      requiredPlan: tool.requiredPlan,
      sortOrder: String(tool.sortOrder),
      isPublished: tool.isPublished,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTool) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/tools/${editingTool.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          sortOrder: parseInt(editFormData.sortOrder),
        }),
      })

      if (res.ok) {
        setIsEditDialogOpen(false)
        setEditingTool(null)
        fetchTools()
      } else {
        const error = await res.json()
        alert(error.error || '更新に失敗しました')
      }
    } catch (error) {
      console.error('Failed to update tool:', error)
      alert('更新に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (tool: Tool) => {
    setDeletingTool(tool)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingTool) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/tools/${deletingTool.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setIsDeleteDialogOpen(false)
        setDeletingTool(null)
        fetchTools()
      } else {
        const error = await res.json()
        alert(error.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete tool:', error)
      alert('削除に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SPREADSHEET':
        return <FileSpreadsheet className="h-5 w-5" />
      case 'DOCUMENT':
        return <FileText className="h-5 w-5" />
      case 'CALCULATOR':
        return <Calculator className="h-5 w-5" />
      default:
        return <Wrench className="h-5 w-5" />
    }
  }

  const getCategoryLabel = (category: string) => {
    return categoryOptions.find(c => c.value === category)?.label || category
  }

  const togglePublish = async (tool: Tool) => {
    try {
      const res = await fetch(`/api/tools/${tool.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tool,
          isPublished: !tool.isPublished
        }),
      })
      if (res.ok) {
        fetchTools()
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error)
    }
  }

  // Filter and sort tools
  const getFilteredTools = () => {
    let filtered = tools.filter(tool => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())

      const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter
      const matchesPlan = planFilter === 'all' || tool.requiredPlan === planFilter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && tool.isPublished) ||
        (statusFilter === 'draft' && !tool.isPublished)

      return matchesSearch && matchesCategory && matchesPlan && matchesStatus
    })

    // Sort
    switch (sortBy) {
      case 'order_asc':
        filtered.sort((a, b) => a.sortOrder - b.sortOrder)
        break
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
        break
      case 'usage_desc':
        filtered.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        break
    }

    return filtered
  }

  const filteredTools = getFilteredTools()

  // Stats
  const stats = {
    total: tools.length,
    published: tools.filter(t => t.isPublished).length,
    draft: tools.filter(t => !t.isPublished).length,
    expert: tools.filter(t => t.requiredPlan === 'EXPERT').length,
    standard: tools.filter(t => t.requiredPlan === 'STANDARD').length,
    totalUsage: tools.reduce((sum, t) => sum + (t.usageCount || 0), 0),
    byCategory: {
      spreadsheet: tools.filter(t => t.category === 'SPREADSHEET').length,
      document: tools.filter(t => t.category === 'DOCUMENT').length,
      calculator: tools.filter(t => t.category === 'CALCULATOR').length,
      other: tools.filter(t => t.category === 'OTHER').length
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
            <h1 className="text-2xl font-bold">ツール管理</h1>
            <p className="text-slate-600">業務ツール・テンプレートの管理</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>ツールを作成</DialogTitle>
                <DialogDescription>
                  新しい業務ツールを追加します
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="name">名前 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: generateSlug(e.target.value),
                        })
                      }}
                      required
                      placeholder="見積作成テンプレート"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">スラッグ *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                      placeholder="estimate-template"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">説明</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="ツールの説明"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">カテゴリ *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="requiredPlan">必要プラン</Label>
                      <Select
                        value={formData.requiredPlan}
                        onValueChange={(value) => setFormData({ ...formData, requiredPlan: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {planOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="fileUrl">ファイルURL</Label>
                    <Input
                      id="fileUrl"
                      value={formData.fileUrl}
                      onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                      placeholder="https://... (ダウンロード用)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="externalUrl">外部リンクURL</Label>
                    <Input
                      id="externalUrl"
                      value={formData.externalUrl}
                      onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                      placeholder="https://... (外部ツールへのリンク)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sortOrder">表示順</Label>
                      <Input
                        id="sortOrder"
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isPublished"
                          checked={formData.isPublished}
                          onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                        />
                        <Label htmlFor="isPublished">公開する</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? '作成中...' : '作成'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-slate-600">総ツール数</p>
                  <p className="text-xs text-slate-500 mt-1">
                    公開 {stats.published} / 下書き {stats.draft}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                  <p className="text-sm text-slate-600">公開中</p>
                  <p className="text-xs text-slate-500 mt-1">ユーザーに表示</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Wrench className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">プラン別</p>
                  <div className="flex gap-3 mt-1">
                    <div>
                      <p className="text-lg font-bold text-purple-600">{stats.expert}</p>
                      <p className="text-xs text-slate-500">Expert</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{stats.standard}</p>
                      <p className="text-xs text-slate-500">Standard</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Download className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsage}</p>
                  <p className="text-sm text-slate-600">総利用回数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* フィルター */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="ツール名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="all">すべてのカテゴリ</option>
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="all">すべてのプラン</option>
            <option value="STANDARD">STANDARD</option>
            <option value="EXPERT">EXPERT</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="all">すべての状態</option>
            <option value="published">公開中</option>
            <option value="draft">下書き</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="order_asc">表示順</option>
            <option value="name_asc">名前順</option>
            <option value="usage_desc">利用回数順</option>
          </select>
        </div>

        {/* ツール一覧 */}
        {filteredTools.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {searchQuery || categoryFilter !== 'all' || planFilter !== 'all' || statusFilter !== 'all'
                  ? '検索条件に一致するツールがありません'
                  : 'ツールがまだありません'}
              </p>
              {!searchQuery && categoryFilter === 'all' && planFilter === 'all' && statusFilter === 'all' && (
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  最初のツールを作成
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <Card key={tool.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${tool.isPublished ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      {getCategoryIcon(tool.category)}
                    </div>
                    <div className="flex gap-1">
                      {tool.requiredPlan === 'EXPERT' && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                          EXPERT
                        </Badge>
                      )}
                      {tool.isPublished ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">公開</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">下書き</Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold mb-1">{tool.name}</h3>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                    {tool.description || 'No description'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(tool.category)}
                    </Badge>
                    <span>{tool.usageCount || 0}回利用</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {tool.fileUrl && (
                        <Badge variant="outline" className="text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          DL
                        </Badge>
                      )}
                      {tool.externalUrl && (
                        <Badge variant="outline" className="text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          外部
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublish(tool)}
                        title={tool.isPublished ? '非公開にする' : '公開する'}
                      >
                        {tool.isPublished ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(tool)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(tool)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="text-sm text-slate-500 text-center">
          {filteredTools.length}件のツールを表示中
        </p>

        {/* 編集ダイアログ */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>ツールを編集</DialogTitle>
              <DialogDescription>
                ツールの情報を編集します
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="edit-name">名前 *</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-slug">スラッグ *</Label>
                  <Input
                    id="edit-slug"
                    value={editFormData.slug}
                    onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">説明</Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-category">カテゴリ *</Label>
                    <Select
                      value={editFormData.category}
                      onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-requiredPlan">必要プラン</Label>
                    <Select
                      value={editFormData.requiredPlan}
                      onValueChange={(value) => setEditFormData({ ...editFormData, requiredPlan: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {planOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-fileUrl">ファイルURL</Label>
                  <Input
                    id="edit-fileUrl"
                    value={editFormData.fileUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, fileUrl: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-externalUrl">外部リンクURL</Label>
                  <Input
                    id="edit-externalUrl"
                    value={editFormData.externalUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, externalUrl: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-sortOrder">表示順</Label>
                    <Input
                      id="edit-sortOrder"
                      type="number"
                      value={editFormData.sortOrder}
                      onChange={(e) => setEditFormData({ ...editFormData, sortOrder: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="edit-isPublished"
                        checked={editFormData.isPublished}
                        onCheckedChange={(checked) => setEditFormData({ ...editFormData, isPublished: checked })}
                      />
                      <Label htmlFor="edit-isPublished">公開する</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? '更新中...' : '更新'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 削除確認ダイアログ */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ツールを削除</DialogTitle>
              <DialogDescription>
                「{deletingTool?.name}」を削除しますか？この操作は取り消せません。
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
