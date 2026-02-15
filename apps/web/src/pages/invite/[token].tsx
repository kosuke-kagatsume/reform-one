import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Building2 } from 'lucide-react'

interface InvitationInfo {
  organizationName: string
  email: string
  role: string
  expiresAt: string
}

export default function AcceptInvite() {
  const router = useRouter()
  const { token } = router.query

  const [invitation, setInvitation] = useState<InvitationInfo | null>(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (token) {
      fetchInvitation()
    }
  }, [token])

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/members/invitation?token=${token}`)
      if (response.ok) {
        const data = await response.json()
        setInvitation(data.invitation)
      } else {
        const data = await response.json()
        setError(data.error || 'Invalid invitation')
      }
    } catch {
      setError('Failed to load invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上である必要があります')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/members/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password })
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          // A-4: 登録後はプロフィール設定ページへリダイレクト
          router.push('/login?redirect=/profile-setup')
        }, 3000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to accept invitation')
      }
    } catch {
      setError('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </Layout>
    )
  }

  if (success) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">登録完了</h2>
                <p className="text-slate-600 mb-4">
                  アカウントが作成されました。ログインページへ移動します...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  if (!invitation) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">招待が無効です</h2>
                <p className="text-slate-600">{error || '招待が見つからないか、期限切れです'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle>招待を受け入れる</CardTitle>
              <CardDescription>
                <span className="font-semibold text-slate-900">{invitation.organizationName}</span>
                に招待されています
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="bg-slate-50 rounded-md p-3">
                  <p className="text-sm text-slate-600">
                    メールアドレス: <span className="font-medium text-slate-900">{invitation.email}</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    権限: <span className="font-medium text-slate-900">
                      {invitation.role === 'ADMIN' ? '管理者' : '一般社員'}
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">お名前</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="山田 太郎"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">パスワード</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="8文字以上"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">パスワード（確認）</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="もう一度入力"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '処理中...' : 'アカウントを作成'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
