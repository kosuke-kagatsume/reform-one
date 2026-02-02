import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent } from '@/components/ui/card'
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
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/lib/auth-context'
import {
  Plus,
  Mail,
  Send,
  Pencil,
  Trash2,
  Clock,
  CheckCircle,
  Eye
} from 'lucide-react'

interface Newsletter {
  id: string
  title: string
  content: string
  summary: string | null
  authorId: string
  sentAt: string | null
  isPublished: boolean
  createdAt: string
}

export default function NewslettersAdmin() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null)
  const [sending, setSending] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
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
      fetchNewsletters()
    }
  }, [isAuthenticated, isReformCompany])

  const fetchNewsletters = async () => {
    try {
      const res = await fetch('/api/admin/premier/newsletters?includeUnpublished=true')
      if (res.ok) {
        const data = await res.json()
        setNewsletters(data.newsletters)
      }
    } catch (error) {
      console.error('Failed to fetch newsletters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (newsletter?: Newsletter) => {
    if (newsletter) {
      setEditingNewsletter(newsletter)
      setFormData({
        title: newsletter.title,
        content: newsletter.content,
        summary: newsletter.summary || '',
        isPublished: newsletter.isPublished
      })
    } else {
      setEditingNewsletter(null)
      setFormData({
        title: '',
        content: '',
        summary: '',
        isPublished: false
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!user) return

    try {
      const url = editingNewsletter
        ? `/api/admin/premier/newsletters/${editingNewsletter.id}`
        : '/api/admin/premier/newsletters'
      const method = editingNewsletter ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          authorId: user.id
        })
      })

      if (res.ok) {
        setDialogOpen(false)
        fetchNewsletters()
      } else {
        const data = await res.json()
        alert(data.error || '保存に失敗しました')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    }
  }

  const handleSend = async (id: string) => {
    if (!confirm('このニュースレターをエキスパートユーザー全員に送信しますか？')) return

    setSending(id)
    try {
      const res = await fetch(`/api/admin/premier/newsletters/${id}/send`, {
        method: 'POST'
      })

      if (res.ok) {
        const data = await res.json()
        alert(`${data.sent}名に送信しました`)
        fetchNewsletters()
      } else {
        const data = await res.json()
        alert(data.error || '送信に失敗しました')
      }
    } catch (error) {
      console.error('Send error:', error)
      alert('送信に失敗しました')
    } finally {
      setSending(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このニュースレターを削除しますか？')) return

    try {
      const res = await fetch(`/api/admin/premier/newsletters/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchNewsletters()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            <h1 className="text-2xl font-bold">ニュースレター管理</h1>
            <p className="text-slate-600">編集長ニュースレター（エキスパートプラン限定）</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            新規ニュースレター
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>タイトル</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead>送信日</TableHead>
                  <TableHead className="w-[150px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsletters.map((newsletter) => (
                  <TableRow key={newsletter.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{newsletter.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {newsletter.sentAt ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          送信済み
                        </Badge>
                      ) : newsletter.isPublished ? (
                        <Badge className="bg-blue-100 text-blue-700">公開中</Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          下書き
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(newsletter.createdAt)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {newsletter.sentAt ? formatDate(newsletter.sentAt) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {!newsletter.sentAt && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSend(newsletter.id)}
                            disabled={sending === newsletter.id}
                            title="送信"
                          >
                            <Send className="h-4 w-4 text-blue-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/dashboard/newsletters/${newsletter.id}?preview=true`, '_blank')}
                          title="プレビュー"
                        >
                          <Eye className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(newsletter)}
                          title="編集"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(newsletter.id)}
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {newsletters.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      ニュースレターがありません
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNewsletter ? 'ニュースレターを編集' : '新規ニュースレター'}
              </DialogTitle>
              <DialogDescription>
                ニュースレターの内容を入力してください
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例: 2025年1月号 編集長ニュースレター"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">要約（メール本文に使用）</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="メール本文に表示される要約..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">本文（HTML対応） *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="ニュースレターの本文を入力..."
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-slate-500">
                  HTMLタグを使用できます（例: &lt;p&gt;, &lt;strong&gt;, &lt;a href=&quot;...&quot;&gt;）
                </p>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <Label htmlFor="isPublished">アーカイブに公開</Label>
                  <p className="text-sm text-slate-500">
                    公開するとユーザーがアーカイブから閲覧できます
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
                {editingNewsletter ? '更新' : '作成'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PremierAdminLayout>
  )
}
