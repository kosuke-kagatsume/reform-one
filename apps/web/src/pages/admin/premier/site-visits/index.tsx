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
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  JapaneseYen,
  Building2,
  Edit,
  Trash2,
  Wine,
  UserCheck
} from 'lucide-react'

interface SiteVisit {
  id: string
  title: string
  companyName: string | null
  description: string | null
  location: string
  address: string | null
  imageUrl: string | null
  scheduledAt: string
  duration: number | null
  capacity: number
  price: number
  hasAfterParty: boolean
  afterPartyPrice: number | null
  isPublished: boolean
  isCanceled: boolean
  participantCount?: number
  _count?: { participants: number }
}

interface Participant {
  id: string
  userId: string
  userName: string | null
  userEmail: string | null
  organizationName: string | null
  status: string
  paymentStatus: string
  joinAfterParty: boolean
  afterPartyPaymentStatus: string
  registeredAt: string
}

export default function AdminSiteVisitsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null)
  const [deletingVisit, setDeletingVisit] = useState<SiteVisit | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    location: '',
    address: '',
    imageUrl: '',
    scheduledAt: '',
    duration: '',
    capacity: '20',
    price: '',
    hasAfterParty: false,
    afterPartyPrice: '',
    isPublished: false,
  })

  const [editFormData, setEditFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    location: '',
    address: '',
    imageUrl: '',
    scheduledAt: '',
    duration: '',
    capacity: '20',
    price: '',
    hasAfterParty: false,
    afterPartyPrice: '',
    isPublished: false,
    isCanceled: false,
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchSiteVisits()
    }
  }, [isAuthenticated, user])

  const fetchSiteVisits = async () => {
    try {
      const res = await fetch('/api/admin/premier/site-visits')
      if (res.ok) {
        const data = await res.json()
        setSiteVisits(data)
      }
    } catch (error) {
      console.error('Failed to fetch site visits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/premier/site-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companyName: formData.companyName || null,
          duration: formData.duration ? parseInt(formData.duration) : null,
          capacity: parseInt(formData.capacity),
          price: parseFloat(formData.price),
          afterPartyPrice: formData.afterPartyPrice ? parseFloat(formData.afterPartyPrice) : null,
        }),
      })

      if (res.ok) {
        setIsDialogOpen(false)
        setFormData({
          title: '',
          companyName: '',
          description: '',
          location: '',
          address: '',
          imageUrl: '',
          scheduledAt: '',
          duration: '',
          capacity: '20',
          price: '',
          hasAfterParty: false,
          afterPartyPrice: '',
          isPublished: false,
        })
        fetchSiteVisits()
      } else {
        const error = await res.json()
        alert(error.error || '作成に失敗しました')
      }
    } catch (error) {
      console.error('Failed to create site visit:', error)
      alert('作成に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (visit: SiteVisit) => {
    setEditingVisit(visit)
    const scheduledDate = new Date(visit.scheduledAt)
    const localDateTime = new Date(scheduledDate.getTime() - scheduledDate.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 16)
    setEditFormData({
      title: visit.title,
      companyName: visit.companyName || '',
      description: visit.description || '',
      location: visit.location,
      address: visit.address || '',
      imageUrl: visit.imageUrl || '',
      scheduledAt: localDateTime,
      duration: visit.duration ? String(visit.duration) : '',
      capacity: String(visit.capacity),
      price: String(visit.price),
      hasAfterParty: visit.hasAfterParty,
      afterPartyPrice: visit.afterPartyPrice ? String(visit.afterPartyPrice) : '',
      isPublished: visit.isPublished,
      isCanceled: visit.isCanceled,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVisit) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/admin/premier/site-visits/${editingVisit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          companyName: editFormData.companyName || null,
          duration: editFormData.duration ? parseInt(editFormData.duration) : null,
          capacity: parseInt(editFormData.capacity),
          price: parseFloat(editFormData.price),
          afterPartyPrice: editFormData.afterPartyPrice ? parseFloat(editFormData.afterPartyPrice) : null,
        }),
      })

      if (res.ok) {
        setIsEditDialogOpen(false)
        setEditingVisit(null)
        fetchSiteVisits()
      } else {
        const error = await res.json()
        alert(error.error || '更新に失敗しました')
      }
    } catch (error) {
      console.error('Failed to update site visit:', error)
      alert('更新に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (visit: SiteVisit) => {
    setDeletingVisit(visit)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingVisit) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/admin/premier/site-visits/${deletingVisit.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setIsDeleteDialogOpen(false)
        setDeletingVisit(null)
        fetchSiteVisits()
      } else {
        const error = await res.json()
        alert(error.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete site visit:', error)
      alert('削除に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP').format(price)
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
            <h1 className="text-2xl font-bold">視察会管理</h1>
            <p className="text-slate-600">視察会イベントの作成・管理</p>
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
                <DialogTitle>視察会を作成</DialogTitle>
                <DialogDescription>
                  新しい視察会イベントを作成します
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="title">タイトル *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="第10回 リフォーム現場視察会"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">視察先企業名</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="株式会社〇〇リフォーム"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">説明</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="視察会の詳細説明"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">場所 *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        placeholder="東京都渋谷区"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">住所</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="渋谷区渋谷1-1-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">画像URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduledAt">開催日時 *</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">所要時間（分）</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="120"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="capacity">定員 *</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        required
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">参加費（円） *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        min="0"
                        placeholder="5000"
                      />
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hasAfterParty"
                        checked={formData.hasAfterParty}
                        onCheckedChange={(checked) => setFormData({ ...formData, hasAfterParty: checked })}
                      />
                      <Label htmlFor="hasAfterParty">懇親会あり</Label>
                    </div>
                    {formData.hasAfterParty && (
                      <div>
                        <Label htmlFor="afterPartyPrice">懇親会費（円）</Label>
                        <Input
                          id="afterPartyPrice"
                          type="number"
                          value={formData.afterPartyPrice}
                          onChange={(e) => setFormData({ ...formData, afterPartyPrice: e.target.value })}
                          min="0"
                          placeholder="3000"
                        />
                      </div>
                    )}
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
                総視察会数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{siteVisits.length}</p>
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
                {siteVisits.filter(v => v.isPublished && !v.isCanceled).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                今後の開催
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {siteVisits.filter(v => new Date(v.scheduledAt) > new Date()).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                総参加者数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {siteVisits.reduce((sum, v) => sum + (v.participantCount || 0), 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 視察会一覧 */}
        {siteVisits.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">視察会がまだありません</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                最初の視察会を作成
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {siteVisits.map((visit) => (
              <Card key={visit.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{visit.title}</h3>
                        {visit.isPublished ? (
                          <Badge className="bg-green-100 text-green-700">公開中</Badge>
                        ) : (
                          <Badge variant="outline">下書き</Badge>
                        )}
                        {visit.isCanceled && (
                          <Badge className="bg-red-100 text-red-700">中止</Badge>
                        )}
                        {visit.hasAfterParty && (
                          <Badge className="bg-purple-100 text-purple-700">
                            <Wine className="h-3 w-3 mr-1" />
                            懇親会あり
                          </Badge>
                        )}
                      </div>

                      {visit.companyName && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{visit.companyName}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(visit.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{visit.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{visit.participantCount || 0} / {visit.capacity}名</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <JapaneseYen className="h-4 w-4" />
                          <span>¥{formatPrice(visit.price)}</span>
                          {visit.hasAfterParty && visit.afterPartyPrice && (
                            <span className="text-purple-600">（懇親会: ¥{formatPrice(visit.afterPartyPrice)}）</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/premier/site-visits/${visit.id}/participants`)}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        参加者
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(visit)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(visit)}>
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
              <DialogTitle>視察会を編集</DialogTitle>
              <DialogDescription>
                視察会の情報を編集します
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="edit-title">タイトル *</Label>
                  <Input
                    id="edit-title"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-companyName">視察先企業名</Label>
                  <Input
                    id="edit-companyName"
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                    placeholder="株式会社〇〇リフォーム"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">説明</Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-location">場所 *</Label>
                    <Input
                      id="edit-location"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-address">住所</Label>
                    <Input
                      id="edit-address"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-imageUrl">画像URL</Label>
                  <Input
                    id="edit-imageUrl"
                    value={editFormData.imageUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-scheduledAt">開催日時 *</Label>
                    <Input
                      id="edit-scheduledAt"
                      type="datetime-local"
                      value={editFormData.scheduledAt}
                      onChange={(e) => setEditFormData({ ...editFormData, scheduledAt: e.target.value })}
                      required
                    />
                  </div>
                  <div>
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
                  <div>
                    <Label htmlFor="edit-capacity">定員 *</Label>
                    <Input
                      id="edit-capacity"
                      type="number"
                      value={editFormData.capacity}
                      onChange={(e) => setEditFormData({ ...editFormData, capacity: e.target.value })}
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-price">参加費（円） *</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                      required
                      min="0"
                    />
                  </div>
                </div>
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-hasAfterParty"
                      checked={editFormData.hasAfterParty}
                      onCheckedChange={(checked) => setEditFormData({ ...editFormData, hasAfterParty: checked })}
                    />
                    <Label htmlFor="edit-hasAfterParty">懇親会あり</Label>
                  </div>
                  {editFormData.hasAfterParty && (
                    <div>
                      <Label htmlFor="edit-afterPartyPrice">懇親会費（円）</Label>
                      <Input
                        id="edit-afterPartyPrice"
                        type="number"
                        value={editFormData.afterPartyPrice}
                        onChange={(e) => setEditFormData({ ...editFormData, afterPartyPrice: e.target.value })}
                        min="0"
                        placeholder="3000"
                      />
                    </div>
                  )}
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
                    <Label htmlFor="edit-isCanceled">中止</Label>
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
              <DialogTitle>視察会を削除</DialogTitle>
              <DialogDescription>
                「{deletingVisit?.title}」を削除しますか？この操作は取り消せません。
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
