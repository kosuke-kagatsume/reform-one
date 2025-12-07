import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/layout/admin-layout'
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
  Trash2
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
  const { user, isLoading, isAuthenticated } = useAuth()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [deletingTool, setDeletingTool] = useState<Tool | null>(null)

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
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchTools()
    }
  }, [isAuthenticated, user])

  const fetchTools = async () => {
    try {
      const res = await fetch('/api/admin/premier/tools')
      if (res.ok) {
        const data = await res.json()
        setTools(data)
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
      const res = await fetch('/api/admin/premier/tools', {
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
      const res = await fetch(`/api/admin/premier/tools/${editingTool.id}`, {
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
      const res = await fetch(`/api/admin/premier/tools/${deletingTool.id}`, {
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

  if (isLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
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
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                総ツール数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{tools.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                公開中
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {tools.filter(t => t.isPublished).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                EXPERT限定
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">
                {tools.filter(t => t.requiredPlan === 'EXPERT').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                総利用回数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {tools.reduce((sum, t) => sum + (t.usageCount || 0), 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ツール一覧 */}
        {tools.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">ツールがまだありません</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                最初のツールを作成
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
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
    </AdminLayout>
  )
}
