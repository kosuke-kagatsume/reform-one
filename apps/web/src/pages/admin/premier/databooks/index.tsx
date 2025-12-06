import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/lib/auth-context'
import {
  Plus,
  FileText,
  Download,
  Video,
  Pencil,
  Trash2,
  ExternalLink
} from 'lucide-react'

interface Databook {
  id: string
  title: string
  description: string | null
  pdfUrl: string
  youtubeUrl: string | null
  quarter: string
  publishedAt: string
  isPublished: boolean
  _count: { downloads: number }
}

export default function DatabooksAdmin() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [databooks, setDatabooks] = useState<Databook[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDatabook, setEditingDatabook] = useState<Databook | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pdfUrl: '',
    youtubeUrl: '',
    quarter: '',
    isPublished: false
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    if (!isLoading && isAuthenticated && !isReformCompany) {
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, isReformCompany, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) {
      fetchDatabooks()
    }
  }, [isAuthenticated, isReformCompany])

  const fetchDatabooks = async () => {
    try {
      const res = await fetch('/api/admin/premier/databooks?includeUnpublished=true')
      if (res.ok) {
        const data = await res.json()
        setDatabooks(data.databooks)
      }
    } catch (error) {
      console.error('Failed to fetch databooks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (databook?: Databook) => {
    if (databook) {
      setEditingDatabook(databook)
      setFormData({
        title: databook.title,
        description: databook.description || '',
        pdfUrl: databook.pdfUrl,
        youtubeUrl: databook.youtubeUrl || '',
        quarter: databook.quarter,
        isPublished: databook.isPublished
      })
    } else {
      setEditingDatabook(null)
      // Generate default quarter
      const now = new Date()
      const quarter = `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`
      setFormData({
        title: '',
        description: '',
        pdfUrl: '',
        youtubeUrl: '',
        quarter,
        isPublished: false
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const url = editingDatabook
        ? `/api/admin/premier/databooks/${editingDatabook.id}`
        : '/api/admin/premier/databooks'
      const method = editingDatabook ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setDialogOpen(false)
        fetchDatabooks()
      } else {
        const data = await res.json()
        alert(data.error || '保存に失敗しました')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このデータブックを削除しますか？')) return

    try {
      const res = await fetch(`/api/admin/premier/databooks/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchDatabooks()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
            <h1 className="text-2xl font-bold">データブック管理</h1>
            <p className="text-slate-600">エキスパートプラン限定のPDFデータブック</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            新規データブック
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>タイトル</TableHead>
                  <TableHead>四半期</TableHead>
                  <TableHead>解説動画</TableHead>
                  <TableHead>DL数</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>公開日</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {databooks.map((databook) => (
                  <TableRow key={databook.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{databook.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{databook.quarter}</Badge>
                    </TableCell>
                    <TableCell>
                      {databook.youtubeUrl ? (
                        <a
                          href={databook.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Video className="h-4 w-4" />
                          あり
                        </a>
                      ) : (
                        <span className="text-slate-400">なし</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4 text-slate-400" />
                        {databook._count.downloads}
                      </div>
                    </TableCell>
                    <TableCell>
                      {databook.isPublished ? (
                        <Badge className="bg-green-100 text-green-700">公開中</Badge>
                      ) : (
                        <Badge variant="secondary">下書き</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(databook.publishedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(databook)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(databook.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {databooks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      データブックがありません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingDatabook ? 'データブックを編集' : '新規データブック'}
              </DialogTitle>
              <DialogDescription>
                データブックの情報を入力してください
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例: 2025年Q1 業界動向レポート"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="データブックの概要..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quarter">四半期 *</Label>
                <Input
                  id="quarter"
                  value={formData.quarter}
                  onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                  placeholder="例: 2025-Q1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdfUrl">PDF URL *</Label>
                <Input
                  id="pdfUrl"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">解説動画 URL (YouTube)</Label>
                <Input
                  id="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <Label htmlFor="isPublished">公開する</Label>
                  <p className="text-sm text-slate-500">
                    公開するとエキスパートユーザーに表示されます
                  </p>
                </div>
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPublished: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSubmit}>
                {editingDatabook ? '更新' : '作成'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PremierAdminLayout>
  )
}
