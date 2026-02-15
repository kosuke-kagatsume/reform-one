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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Building2,
  Edit,
  Trash2,
  Video,
  Monitor,
  ExternalLink
} from 'lucide-react'

interface OnlineSiteVisit {
  id: string
  title: string
  companyName: string | null
  description: string | null
  location: string | null
  imageUrl: string | null
  zoomUrl: string | null
  scheduledAt: string
  duration: number | null
  capacity: number
  requiredPlan: string
  isPublished: boolean
  isCanceled: boolean
  _count?: { participants: number }
}

interface Stats {
  total: number
  upcoming: number
  past: number
  published: number
}

export default function AdminOnlineSiteVisitsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [onlineSiteVisits, setOnlineSiteVisits] = useState<OnlineSiteVisit[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingVisit, setEditingVisit] = useState<OnlineSiteVisit | null>(null)
  const [deletingVisit, setDeletingVisit] = useState<OnlineSiteVisit | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    location: '',
    imageUrl: '',
    zoomUrl: '',
    scheduledAt: '',
    duration: '',
    capacity: '100',
    requiredPlan: 'STANDARD',
    isPublished: false,
  })

  const [editFormData, setEditFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    location: '',
    imageUrl: '',
    zoomUrl: '',
    scheduledAt: '',
    duration: '',
    capacity: '',
    requiredPlan: 'STANDARD',
    isPublished: false,
    isCanceled: false,
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchOnlineSiteVisits()
    }
  }, [isAuthenticated])

  const fetchOnlineSiteVisits = async () => {
    try {
      const res = await fetch('/api/admin/premier/online-site-visits')
      if (res.ok) {
        const data = await res.json()
        setOnlineSiteVisits(data.data.onlineSiteVisits || [])
        setStats(data.data.stats || null)
      }
    } catch (error) {
      console.error('Failed to fetch online site visits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/premier/online-site-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setIsDialogOpen(false)
        setFormData({
          title: '',
          companyName: '',
          description: '',
          location: '',
          imageUrl: '',
          zoomUrl: '',
          scheduledAt: '',
          duration: '',
          capacity: '100',
          requiredPlan: 'STANDARD',
          isPublished: false,
        })
        fetchOnlineSiteVisits()
      }
    } catch (error) {
      console.error('Failed to create online site visit:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (visit: OnlineSiteVisit) => {
    setEditingVisit(visit)
    setEditFormData({
      title: visit.title,
      companyName: visit.companyName || '',
      description: visit.description || '',
      location: visit.location || '',
      imageUrl: visit.imageUrl || '',
      zoomUrl: visit.zoomUrl || '',
      scheduledAt: new Date(visit.scheduledAt).toISOString().slice(0, 16),
      duration: visit.duration?.toString() || '',
      capacity: visit.capacity.toString(),
      requiredPlan: visit.requiredPlan,
      isPublished: visit.isPublished,
      isCanceled: visit.isCanceled,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingVisit) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/premier/online-site-visits/${editingVisit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })

      if (res.ok) {
        setIsEditDialogOpen(false)
        setEditingVisit(null)
        fetchOnlineSiteVisits()
      }
    } catch (error) {
      console.error('Failed to update online site visit:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingVisit) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/premier/online-site-visits/${deletingVisit.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setIsDeleteDialogOpen(false)
        setDeletingVisit(null)
        fetchOnlineSiteVisits()
      }
    } catch (error) {
      console.error('Failed to delete online site visit:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
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
            <h1 className="text-2xl font-bold">オンライン現場見学会</h1>
            <p className="text-gray-600">Zoom配信の現場見学会を管理</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Monitor className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-gray-600">総数</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.upcoming}</p>
                    <p className="text-sm text-gray-600">今後の開催</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Video className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.past}</p>
                    <p className="text-sm text-gray-600">過去の開催</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.published}</p>
                    <p className="text-sm text-gray-600">公開中</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>見学会一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {onlineSiteVisits.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                オンライン現場見学会がありません
              </div>
            ) : (
              <div className="space-y-4">
                {onlineSiteVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{visit.title}</h3>
                        {visit.isPublished ? (
                          <Badge variant="default">公開中</Badge>
                        ) : (
                          <Badge variant="secondary">非公開</Badge>
                        )}
                        {visit.isCanceled && (
                          <Badge variant="destructive">中止</Badge>
                        )}
                        <Badge variant={visit.requiredPlan === 'EXPERT' ? 'default' : 'outline'}>
                          {visit.requiredPlan === 'EXPERT' ? 'エキスパート限定' : '全プラン'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(visit.scheduledAt)}
                        </span>
                        {visit.companyName && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {visit.companyName}
                          </span>
                        )}
                        {visit.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {visit.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {visit._count?.participants || 0} / {visit.capacity}名
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {visit.zoomUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(visit.zoomUrl!, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Zoom
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/premier/online-site-visits/${visit.id}/participants`)}
                      >
                        参加者
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(visit)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeletingVisit(visit)
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

        {/* Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>オンライン現場見学会を作成</DialogTitle>
              <DialogDescription>
                Zoom配信の現場見学会を新規作成します
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">タイトル *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例: ○○工務店 新築現場見学会"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyName">視察先企業名</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">所在地</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="例: 東京都渋谷区"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="scheduledAt">開催日時 *</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">所要時間（分）</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="60"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="capacity">定員</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="requiredPlan">対象プラン</Label>
                  <Select
                    value={formData.requiredPlan}
                    onValueChange={(value) => setFormData({ ...formData, requiredPlan: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD">全プラン（スタンダード以上）</SelectItem>
                      <SelectItem value="EXPERT">エキスパート限定</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zoomUrl">Zoom URL</Label>
                <Input
                  id="zoomUrl"
                  value={formData.zoomUrl}
                  onChange={(e) => setFormData({ ...formData, zoomUrl: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">画像URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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
              <Button onClick={handleCreate} disabled={submitting || !formData.title || !formData.scheduledAt}>
                {submitting ? '作成中...' : '作成'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>オンライン現場見学会を編集</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">タイトル *</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-companyName">視察先企業名</Label>
                  <Input
                    id="edit-companyName"
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">所在地</Label>
                  <Input
                    id="edit-location"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">説明</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-scheduledAt">開催日時 *</Label>
                  <Input
                    id="edit-scheduledAt"
                    type="datetime-local"
                    value={editFormData.scheduledAt}
                    onChange={(e) => setEditFormData({ ...editFormData, scheduledAt: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-duration">所要時間（分）</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={editFormData.duration}
                    onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-capacity">定員</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    value={editFormData.capacity}
                    onChange={(e) => setEditFormData({ ...editFormData, capacity: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-requiredPlan">対象プラン</Label>
                  <Select
                    value={editFormData.requiredPlan}
                    onValueChange={(value) => setEditFormData({ ...editFormData, requiredPlan: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD">全プラン（スタンダード以上）</SelectItem>
                      <SelectItem value="EXPERT">エキスパート限定</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-zoomUrl">Zoom URL</Label>
                <Input
                  id="edit-zoomUrl"
                  value={editFormData.zoomUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, zoomUrl: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-imageUrl">画像URL</Label>
                <Input
                  id="edit-imageUrl"
                  value={editFormData.imageUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isPublished"
                    checked={editFormData.isPublished}
                    onCheckedChange={(checked) => setEditFormData({ ...editFormData, isPublished: checked })}
                  />
                  <Label htmlFor="edit-isPublished">公開する</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isCanceled"
                    checked={editFormData.isCanceled}
                    onCheckedChange={(checked) => setEditFormData({ ...editFormData, isCanceled: checked })}
                  />
                  <Label htmlFor="edit-isCanceled" className="text-red-600">中止にする</Label>
                </div>
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
              <DialogTitle>オンライン現場見学会を削除</DialogTitle>
              <DialogDescription>
                「{deletingVisit?.title}」を削除しますか？この操作は取り消せません。
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
