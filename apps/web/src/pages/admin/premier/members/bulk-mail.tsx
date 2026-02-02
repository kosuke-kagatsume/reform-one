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
  Loader2
} from 'lucide-react'

interface Recipient {
  id: string
  name: string | null
  email: string
  organizationName: string
  planType: string | null
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany && target) {
      fetchRecipients()
      fetchSignature()
    }
  }, [isAuthenticated, isReformCompany, target, loginFilter, planFilter, orgFilter])

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
        body: JSON.stringify({ testEmail, subject, body, signature })
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
          body
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
    </PremierAdminLayout>
  )
}
