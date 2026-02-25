import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth-context'
import {
  Mail,
  Send,
  Users,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  FileText,
  Trash2,
  Paperclip,
  X,
  Upload,
  File
} from 'lucide-react'
import { toast } from 'sonner'
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
} from '@/components/ui/dialog'

interface Recipient {
  id: string
  name: string | null
  email: string
  organizationName: string
  planType: string | null
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
}

interface Attachment {
  url: string
  fileName: string
  size: number
  type: string
}

type TargetType = 'all' | 'expert' | 'standard' | 'filtered'

export default function BulkMailPage() {
  const router = useRouter()
  const { target, loginFilter, planFilter, orgFilter } = router.query
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()

  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [signature, setSignature] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [testSending, setTestSending] = useState(false)
  const [testSent, setTestSent] = useState(false)

  // テンプレート関連
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [savingTemplate, setSavingTemplate] = useState(false)

  // 添付ファイル関連
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany && target) {
      fetchRecipients()
      fetchSignature()
      fetchTemplates()
    }
  }, [isAuthenticated, isReformCompany, target, loginFilter, planFilter, orgFilter])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/premier/email-templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates || [])
      }
    } catch {}
  }

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSubject(template.subject)
      setBody(template.body)
    }
  }

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim() || !subject.trim() || !body.trim()) {
      setError('テンプレート名、件名、本文を入力してください')
      return
    }

    setSavingTemplate(true)
    try {
      const res = await fetch('/api/admin/premier/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTemplateName, subject, body })
      })

      if (res.ok) {
        setSaveTemplateOpen(false)
        setNewTemplateName('')
        fetchTemplates()
      } else {
        const data = await res.json()
        setError(data.error || 'テンプレートの保存に失敗しました')
      }
    } catch {
      setError('テンプレートの保存に失敗しました')
    } finally {
      setSavingTemplate(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('このテンプレートを削除しますか？')) return

    try {
      const res = await fetch(`/api/admin/premier/email-templates/${templateId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchTemplates()
        if (selectedTemplateId === templateId) {
          setSelectedTemplateId('')
        }
      }
    } catch {}
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/admin/premier/upload-attachment', {
          method: 'POST',
          body: formData
        })

        if (res.ok) {
          const data = await res.json()
          setAttachments(prev => [...prev, {
            url: data.url,
            fileName: data.fileName,
            size: data.size,
            type: data.type
          }])
          toast.success(`${file.name} をアップロードしました`)
        } else {
          const data = await res.json()
          setError(data.error || 'ファイルのアップロードに失敗しました')
        }
      } catch {
        setError('ファイルのアップロードに失敗しました')
      }
    }

    setUploading(false)
    // Reset input
    e.target.value = ''
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const fetchSignature = async () => {
    try {
      const res = await fetch('/api/admin/premier/settings/email-signature')
      if (res.ok) {
        const data = await res.json()
        setSignature(data.signature)
      }
    } catch {}
  }

  const handleTestSend = async () => {
    if (!testEmail || !subject.trim() || !body.trim()) {
      setError('テスト送信先、件名、本文を入力してください')
      return
    }

    setTestSending(true)
    setTestSent(false)
    setError(null)

    try {
      const res = await fetch('/api/admin/premier/members/test-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail,
          subject,
          body,
          signature,
          attachments: attachments.map(a => ({ url: a.url, fileName: a.fileName }))
        })
      })

      if (res.ok) {
        setTestSent(true)
        setTimeout(() => setTestSent(false), 5000)
      } else {
        const data = await res.json()
        setError(data.error || 'テスト送信に失敗しました')
      }
    } catch {
      setError('テスト送信に失敗しました')
    } finally {
      setTestSending(false)
    }
  }

  const fetchRecipients = async () => {
    try {
      const params = new URLSearchParams()
      params.set('target', target as string)
      if (loginFilter) params.set('loginFilter', loginFilter as string)
      if (planFilter) params.set('planFilter', planFilter as string)
      if (orgFilter) params.set('orgFilter', orgFilter as string)

      const res = await fetch(`/api/admin/premier/members/bulk-mail-recipients?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setRecipients(data.recipients)
      }
    } catch (error) {
      console.error('Failed to fetch recipients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('件名と本文を入力してください')
      return
    }

    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/premier/members/bulk-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientIds: recipients.map(r => r.id),
          subject,
          body,
          attachments: attachments.map(a => ({ url: a.url, fileName: a.fileName }))
        })
      })

      if (res.ok) {
        setSent(true)
      } else {
        const data = await res.json()
        setError(data.error || '送信に失敗しました')
      }
    } catch (error) {
      setError('送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  const getTargetLabel = (t: TargetType) => {
    switch (t) {
      case 'all': return '全会員'
      case 'expert': return 'エキスパートコース会員'
      case 'standard': return 'スタンダードコース会員'
      case 'filtered': return '絞り込み結果'
      default: return '選択された会員'
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

  if (sent) {
    return (
      <PremierAdminLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800 mb-2">送信完了</h2>
                <p className="text-green-700 mb-6">
                  {recipients.length}名の会員にメールを送信しました
                </p>
                <Button onClick={() => router.push('/admin/premier/members')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  会員一覧に戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PremierAdminLayout>
    )
  }

  return (
    <PremierAdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
          <div>
            <h1 className="text-2xl font-bold">一斉メール送信</h1>
            <p className="text-slate-600">
              {getTargetLabel(target as TargetType)}へメールを送信
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 送信先一覧 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                送信先
              </CardTitle>
              <CardDescription>
                {recipients.length}名の会員
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {recipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="p-2 bg-slate-50 rounded text-sm"
                  >
                    <p className="font-medium truncate">
                      {recipient.name || recipient.email}
                    </p>
                    <p className="text-slate-500 text-xs truncate">
                      {recipient.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">
                        {recipient.organizationName}
                      </span>
                      {recipient.planType && (
                        <Badge variant="secondary" className="text-xs">
                          {recipient.planType === 'EXPERT' ? 'Expert' : 'Standard'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* メール作成フォーム */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                メール内容
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              {/* テンプレート選択 */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    テンプレートから選択
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSaveTemplateOpen(true)}
                    disabled={!subject.trim() || !body.trim()}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    現在の内容を保存
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedTemplateId} onValueChange={handleSelectTemplate}>
                    <SelectTrigger className="flex-1 bg-white">
                      <SelectValue placeholder="テンプレートを選択..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplateId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTemplate(selectedTemplateId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {templates.length === 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    まだテンプレートがありません。メールを作成後「現在の内容を保存」で保存できます。
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">件名</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="メールの件名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">本文</label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="メールの本文を入力..."
                  rows={12}
                />
                <p className="text-xs text-slate-500 mt-1">
                  ※ {'{{name}}'} で受信者名、{'{{organization}}'} で組織名に置換されます
                </p>
              </div>

              {/* 添付ファイル */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  添付ファイル
                </label>

                {/* アップロード済みファイル一覧 */}
                {attachments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium">{attachment.fileName}</span>
                          <span className="text-xs text-slate-500">
                            ({formatFileSize(attachment.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* アップロードボタン */}
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                    />
                    <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 text-slate-500" />
                      )}
                      <span className="text-sm text-slate-600">
                        {uploading ? 'アップロード中...' : 'ファイルを選択'}
                      </span>
                    </div>
                  </label>
                  <span className="text-xs text-slate-500">
                    PDF, Word, Excel, 画像（10MB以下）
                  </span>
                </div>
              </div>

              {signature && (
                <div>
                  <label className="block text-sm font-medium mb-1">署名（自動付与）</label>
                  <div className="p-3 bg-slate-50 rounded border text-sm whitespace-pre-wrap text-slate-600 font-mono">
                    {signature}
                  </div>
                </div>
              )}

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <label className="block text-sm font-medium mb-2">テスト送信</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="テスト送信先メールアドレス"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleTestSend}
                    disabled={testSending || !testEmail}
                    size="sm"
                  >
                    {testSending ? '送信中...' : 'テスト送信'}
                  </Button>
                </div>
                {testSent && (
                  <p className="text-sm text-green-600 mt-2">テストメールを送信しました</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => router.back()}>
                  キャンセル
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={sending || recipients.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {recipients.length}名に送信
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* テンプレート保存ダイアログ */}
      <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>テンプレートとして保存</DialogTitle>
            <DialogDescription>
              現在の件名と本文をテンプレートとして保存します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">テンプレート名</label>
              <Input
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="例: セミナー案内メール"
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium mb-1">件名:</p>
              <p className="text-sm text-slate-600">{subject}</p>
              <p className="text-sm font-medium mb-1 mt-3">本文:</p>
              <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-3">{body}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveTemplateOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSaveTemplate} disabled={savingTemplate || !newTemplateName.trim()}>
              {savingTemplate ? '保存中...' : '保存する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PremierAdminLayout>
  )
}
