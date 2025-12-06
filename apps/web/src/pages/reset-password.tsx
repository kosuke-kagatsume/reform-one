import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, CheckCircle, XCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { token } = router.query as { token: string }

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    match: password === confirmPassword && password.length > 0,
  }

  const allValid = Object.values(passwordChecks).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!allValid) {
      setError('すべての要件を満たしてください')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'エラーが発生しました')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>パスワードを変更しました</CardTitle>
            <CardDescription>
              新しいパスワードでログインできます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">
                ログインする
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>無効なリンク</CardTitle>
            <CardDescription>
              このリンクは無効または期限切れです。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/forgot-password">
              <Button variant="outline" className="w-full">
                パスワードリセットを再リクエスト
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>新しいパスワードを設定</CardTitle>
          <CardDescription>
            安全なパスワードを設定してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="password">新しいパスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">パスワードの確認</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-700">パスワード要件:</p>
              <ul className="space-y-1">
                <li className={`flex items-center gap-2 ${passwordChecks.length ? 'text-green-600' : 'text-slate-500'}`}>
                  {passwordChecks.length ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-slate-300" />}
                  8文字以上
                </li>
                <li className={`flex items-center gap-2 ${passwordChecks.uppercase ? 'text-green-600' : 'text-slate-500'}`}>
                  {passwordChecks.uppercase ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-slate-300" />}
                  大文字を含む
                </li>
                <li className={`flex items-center gap-2 ${passwordChecks.lowercase ? 'text-green-600' : 'text-slate-500'}`}>
                  {passwordChecks.lowercase ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-slate-300" />}
                  小文字を含む
                </li>
                <li className={`flex items-center gap-2 ${passwordChecks.number ? 'text-green-600' : 'text-slate-500'}`}>
                  {passwordChecks.number ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-slate-300" />}
                  数字を含む
                </li>
                <li className={`flex items-center gap-2 ${passwordChecks.match ? 'text-green-600' : 'text-slate-500'}`}>
                  {passwordChecks.match ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border border-slate-300" />}
                  パスワードが一致
                </li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !allValid}>
              {loading ? '変更中...' : 'パスワードを変更'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
