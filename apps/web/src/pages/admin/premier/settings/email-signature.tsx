import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth-context'
import { Save, Mail } from 'lucide-react'

export default function EmailSignaturePage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [signature, setSignature] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login')
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) fetchSignature()
  }, [isAuthenticated, isReformCompany])

  const fetchSignature = async () => {
    try {
      const res = await fetch('/api/admin/premier/settings/email-signature')
      if (res.ok) {
        const data = await res.json()
        setSignature(data.signature)
      }
    } catch (error) {
      console.error('Failed to fetch signature:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/admin/premier/settings/email-signature', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature })
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save signature:', error)
    } finally {
      setSaving(false)
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
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">メール署名設定</h1>
          <p className="text-slate-600">一斉メール送信時に自動付与される共通署名を設定</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              共通署名
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder={`--\nリフォーム産業新聞社\nプレミア購読運営事務局\nTEL: 03-XXXX-XXXX\nEmail: premium@the-reform.co.jp`}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-500">
              一斉メール送信時に、本文の末尾に自動で付与されます。
            </p>

            <div className="flex items-center gap-4">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? '保存中...' : '署名を保存'}
              </Button>
              {saved && (
                <span className="text-sm text-green-600">保存しました</span>
              )}
            </div>
          </CardContent>
        </Card>

        {signature && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">プレビュー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-slate-50 rounded-lg font-mono text-sm whitespace-pre-wrap">
                {signature}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PremierAdminLayout>
  )
}
