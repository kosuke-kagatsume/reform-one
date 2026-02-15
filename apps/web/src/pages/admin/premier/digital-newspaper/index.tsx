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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import {
  Plus,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Newspaper,
  Users,
  Eye,
  ExternalLink
} from 'lucide-react'

interface Edition {
  id: string
  title: string
  issueDate: string
  pdfUrl: string
  thumbnailUrl: string | null
  pageCount: number | null
  description: string | null
  isPublished: boolean
}

interface Access {
  id: string
  organizationId: string
  userId: string
  grantedAt: string
  organization: { id: string; name: string }
  user?: { id: string; name: string; email: string }
}

interface Stats {
  total: number
  published: number
}

export default function AdminDigitalNewspaperPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [editions, setEditions] = useState<Edition[]>([])
  const [accessList, setAccessList] = useState<Access[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingEdition, setEditingEdition] = useState<Edition | null>(null)
  const [deletingEdition, setDeletingEdition] = useState<Edition | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    issueDate: '',
    pdfUrl: '',
    thumbnailUrl: '',
    pageCount: '',
    description: '',
    isPublished: false,
  })

  const [editFormData, setEditFormData] = useState({
    title: '',
    issueDate: '',
    pdfUrl: '',
    thumbnailUrl: '',
    pageCount: '',
    description: '',
    isPublished: false,
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchEditions()
      fetchAccessList()
    }
  }, [isAuthenticated])

  const fetchEditions = async () => {
    try {
      const res = await fetch('/api/admin/premier/digital-newspaper/editions')
      if (res.ok) {
        const data = await res.json()
        setEditions(data.data.editions || [])
        setStats(data.data.stats || null)
      }
    } catch (error) {
      console.error('Failed to fetch editions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAccessList = async () => {
    try {
      const res = await fetch('/api/admin/premier/digital-newspaper/access')
      if (res.ok) {
        const data = await res.json()
        setAccessList(data.data.accessList || [])
      }
    } catch (error) {
      console.error('Failed to fetch access list:', error)
    }
  }

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/premier/digital-newspaper/editions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setIsDialogOpen(false)
        setFormData({
          title: '',
          issueDate: '',
          pdfUrl: '',
          thumbnailUrl: '',
          pageCount: '',
          description: '',
          isPublished: false,
        })
        fetchEditions()
      }
    } catch (error) {
      console.error('Failed to create edition:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (edition: Edition) => {
    setEditingEdition(edition)
    setEditFormData({
      title: edition.title,
      issueDate: new Date(edition.issueDate).toISOString().slice(0, 10),
      pdfUrl: edition.pdfUrl,
      thumbnailUrl: edition.thumbnailUrl || '',
      pageCount: edition.pageCount?.toString() || '',
      description: edition.description || '',
      isPublished: edition.isPublished,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingEdition) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/premier/digital-newspaper/editions/${editingEdition.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })

      if (res.ok) {
        setIsEditDialogOpen(false)
        setEditingEdition(null)
        fetchEditions()
      }
    } catch (error) {
      console.error('Failed to update edition:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingEdition) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/premier/digital-newspaper/editions/${deletingEdition.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setIsDeleteDialogOpen(false)
        setDeletingEdition(null)
        fetchEditions()
      }
    } catch (error) {
      console.error('Failed to delete edition:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading || loading) {
    return (
      <PremierAdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PremierAdminLayout>
    )
  }

  return (
    <PremierAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">電子版リフォーム産業新聞</h1>
            <p className="text-gray-600">電子版の号数管理とアクセス権限管理</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規号を追加
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Newspaper className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-gray-600">総号数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Eye className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.published}</p>
                    <p className="text-sm text-gray-600">公開中</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{accessList.length}</p>
                    <p className="text-sm text-gray-600">アクセス権付与済み</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="editions">
          <TabsList>
            <TabsTrigger value="editions">号数一覧</TabsTrigger>
            <TabsTrigger value="access">アクセス権限</TabsTrigger>
          </TabsList>

          <TabsContent value="editions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>号数一覧</CardTitle>
              </CardHeader>
              <CardContent>
                {editions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    電子版がありません
                  </div>
                ) : (
                  <div className="space-y-4">
                    {editions.map((edition) => (
                      <div
                        key={edition.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center">
                            {edition.thumbnailUrl ? (
                              <img
                                src={edition.thumbnailUrl}
                                alt={edition.title}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Newspaper className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{edition.title}</h3>
                              {edition.isPublished ? (
                                <Badge variant="default">公開中</Badge>
                              ) : (
                                <Badge variant="secondary">非公開</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(edition.issueDate)}
                              </span>
                              {edition.pageCount && (
                                <span className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  {edition.pageCount}ページ
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(edition.pdfUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(edition)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeletingEdition(edition)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>アクセス権限一覧</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  電子版は1組織につき1名のみ閲覧可能です。組織詳細ページからアクセス権を設定できます。
                </p>
                {accessList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    アクセス権限が設定されている組織はありません
                  </div>
                ) : (
                  <div className="space-y-2">
                    {accessList.map((access) => (
                      <div
                        key={access.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{access.organization.name}</p>
                          <p className="text-sm text-gray-600">
                            {access.user?.name || '不明'} ({access.user?.email})
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(access.grantedAt)}から
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>新規号を追加</DialogTitle>
              <DialogDescription>
                電子版リフォーム産業新聞の新しい号を追加します
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">タイトル（号数） *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例: 2026年2月15日号"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="issueDate">発行日 *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pageCount">ページ数</Label>
                  <Input
                    id="pageCount"
                    type="number"
                    value={formData.pageCount}
                    onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pdfUrl">PDF URL *</Label>
                <Input
                  id="pdfUrl"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="thumbnailUrl">サムネイル画像URL</Label>
                <Input
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">概要</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
                <Label htmlFor="isPublished">公開する</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleCreate} disabled={submitting || !formData.title || !formData.issueDate || !formData.pdfUrl}>
                {submitting ? '作成中...' : '作成'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>号を編集</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">タイトル（号数） *</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-issueDate">発行日 *</Label>
                  <Input
                    id="edit-issueDate"
                    type="date"
                    value={editFormData.issueDate}
                    onChange={(e) => setEditFormData({ ...editFormData, issueDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-pageCount">ページ数</Label>
                  <Input
                    id="edit-pageCount"
                    type="number"
                    value={editFormData.pageCount}
                    onChange={(e) => setEditFormData({ ...editFormData, pageCount: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-pdfUrl">PDF URL *</Label>
                <Input
                  id="edit-pdfUrl"
                  value={editFormData.pdfUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, pdfUrl: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-thumbnailUrl">サムネイル画像URL</Label>
                <Input
                  id="edit-thumbnailUrl"
                  value={editFormData.thumbnailUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, thumbnailUrl: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">概要</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isPublished"
                  checked={editFormData.isPublished}
                  onCheckedChange={(checked) => setEditFormData({ ...editFormData, isPublished: checked })}
                />
                <Label htmlFor="edit-isPublished">公開する</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleUpdate} disabled={submitting}>
                {submitting ? '更新中...' : '更新'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>号を削除</DialogTitle>
              <DialogDescription>
                「{deletingEdition?.title}」を削除しますか？この操作は取り消せません。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                {submitting ? '削除中...' : '削除'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PremierAdminLayout>
  )
}
