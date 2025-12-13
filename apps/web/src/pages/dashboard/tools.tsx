import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/lib/auth-context'
import {
  Wrench,
  FileText,
  Calculator,
  ClipboardCheck,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Calendar,
  Shield,
  Users,
  LucideIcon,
  Plus,
  Pencil,
  Trash2,
  Upload
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
  isPublished: boolean
}

const iconMap: Record<string, LucideIcon> = {
  FileSpreadsheet,
  FileText,
  Calculator,
  ClipboardCheck,
  Calendar,
  Shield,
  Users,
  Wrench
}

const CATEGORIES = ['テンプレート', 'チェックリスト', '計算ツール', '診断ツール', 'その他']
const ICONS = ['FileSpreadsheet', 'FileText', 'Calculator', 'ClipboardCheck', 'Calendar', 'Shield', 'Users', 'Wrench']

export default function ToolsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, planType, isReformCompany } = useAuth()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)

  // Admin state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'テンプレート',
    iconName: 'FileText',
    requiredPlan: 'STANDARD',
    fileUrl: '',
    externalUrl: '',
    isPublished: true
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchTools()
    }
  }, [isAuthenticated])

  const fetchTools = async () => {
    try {
      const res = await fetch('/api/tools')
      if (res.ok) {
        const data = await res.json()
        setTools(data.tools)
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (iconName: string | null): LucideIcon => {
    if (iconName && iconMap[iconName]) {
      return iconMap[iconName]
    }
    return Wrench
  }

  const canAccess = (requiredPlan: string): boolean => {
    if (user?.organization?.type === 'REFORM_COMPANY') return true
    if (requiredPlan === 'STANDARD') return true
    if (requiredPlan === 'EXPERT' && planType === 'EXPERT') return true
    return false
  }

  const openCreateDialog = () => {
    setEditingTool(null)
    setFormData({
      name: '',
      description: '',
      category: 'テンプレート',
      iconName: 'FileText',
      requiredPlan: 'STANDARD',
      fileUrl: '',
      externalUrl: '',
      isPublished: true
    })
    setSelectedFile(null)
    setDialogOpen(true)
  }

  const openEditDialog = (tool: Tool) => {
    setEditingTool(tool)
    setFormData({
      name: tool.name,
      description: tool.description || '',
      category: tool.category,
      iconName: tool.iconName || 'FileText',
      requiredPlan: tool.requiredPlan,
      fileUrl: tool.fileUrl || '',
      externalUrl: tool.externalUrl || '',
      isPublished: tool.isPublished
    })
    setSelectedFile(null)
    setDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) return

    setSaving(true)
    try {
      let fileUrl = formData.fileUrl

      // Upload file if selected
      if (selectedFile) {
        setUploadingFile(true)
        const uploadData = new FormData()
        uploadData.append('file', selectedFile)

        const uploadRes = await fetch('/api/tools/upload', {
          method: 'POST',
          body: uploadData
        })

        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json()
          fileUrl = uploadResult.url
        } else {
          alert('ファイルのアップロードに失敗しました')
          setUploadingFile(false)
          setSaving(false)
          return
        }
        setUploadingFile(false)
      }

      const payload = {
        ...formData,
        fileUrl: fileUrl || null,
        externalUrl: formData.externalUrl || null
      }

      const res = await fetch(
        editingTool ? `/api/tools/${editingTool.id}` : '/api/tools',
        {
          method: editingTool ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      )

      if (res.ok) {
        fetchTools()
        setDialogOpen(false)
      } else {
        const error = await res.json()
        alert(error.error || '保存に失敗しました')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!toolToDelete) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/tools/${toolToDelete.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchTools()
        setDeleteDialogOpen(false)
        setToolToDelete(null)
      }
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setDeleting(false)
    }
  }

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  const categories = [...new Set(tools.map(t => t.category))]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ツール</h1>
            <p className="text-slate-600">診断・フォーマット集</p>
          </div>
          {isReformCompany && (
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              新規登録
            </Button>
          )}
        </div>

        {tools.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">ツールを準備中です</p>
            </CardContent>
          </Card>
        ) : null}

        {categories.map(category => (
          <div key={category}>
            <h2 className="text-lg font-semibold mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools
                .filter(t => t.category === category)
                .map(tool => {
                  const IconComponent = getIcon(tool.iconName)
                  const hasAccess = canAccess(tool.requiredPlan)

                  return (
                    <Card key={tool.id} className={`hover:shadow-md transition-shadow ${!hasAccess ? 'opacity-60' : ''}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-100 p-2 rounded-lg">
                            <IconComponent className="h-5 w-5 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{tool.name}</CardTitle>
                              {tool.requiredPlan === 'EXPERT' && (
                                <Badge variant="secondary" className="text-xs">エキスパート</Badge>
                              )}
                              {isReformCompany && !tool.isPublished && (
                                <Badge variant="outline" className="text-xs">非公開</Badge>
                              )}
                            </div>
                          </div>
                          {isReformCompany && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(tool)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setToolToDelete(tool)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 mb-4">
                          {tool.description}
                        </p>
                        {tool.fileUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            disabled={!hasAccess}
                            asChild={hasAccess}
                          >
                            {hasAccess ? (
                              <a href={tool.fileUrl} download>
                                <Download className="h-4 w-4 mr-2" />
                                ダウンロード
                              </a>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                エキスパート限定
                              </>
                            )}
                          </Button>
                        )}
                        {tool.externalUrl && (
                          <Button
                            size="sm"
                            className="w-full"
                            disabled={!hasAccess}
                            asChild={hasAccess}
                          >
                            {hasAccess ? (
                              <a href={tool.externalUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                開く
                              </a>
                            ) : (
                              <>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                エキスパート限定
                              </>
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </div>
        ))}

        {!isReformCompany && (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="py-8 text-center">
              <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">新しいツールを順次追加予定です</p>
              <p className="text-sm text-slate-400 mt-1">
                ご要望があればお問い合わせください
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTool ? 'ツールを編集' : '新規ツール登録'}</DialogTitle>
            <DialogDescription>
              ツールの情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">ツール名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: 見積書テンプレート"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="ツールの説明を入力"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>カテゴリ</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>アイコン</Label>
                <Select
                  value={formData.iconName}
                  onValueChange={(value) => setFormData({ ...formData, iconName: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>必要プラン</Label>
              <Select
                value={formData.requiredPlan}
                onValueChange={(value) => setFormData({ ...formData, requiredPlan: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">スタンダード（全員）</SelectItem>
                  <SelectItem value="EXPERT">エキスパート限定</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">ファイル</Label>
              <div className="flex gap-2">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="flex-1"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                />
              </div>
              {selectedFile && (
                <p className="text-sm text-slate-600">
                  選択中: {selectedFile.name}
                </p>
              )}
              {formData.fileUrl && !selectedFile && (
                <p className="text-sm text-slate-600">
                  現在のファイル: {formData.fileUrl.split('/').pop()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="externalUrl">外部URL（オプション）</Label>
              <Input
                id="externalUrl"
                value={formData.externalUrl}
                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isPublished" className="font-normal">公開する</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.name.trim()}>
              {saving ? (uploadingFile ? 'アップロード中...' : '保存中...') : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ツールを削除</AlertDialogTitle>
            <AlertDialogDescription>
              「{toolToDelete?.name}」を削除しますか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? '削除中...' : '削除する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
