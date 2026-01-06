import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

const isDevelopment = process.env.NODE_ENV === 'development'

export default function Login() {
  const router = useRouter()
  const { login, isLoading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    setIsSlowConnection(false)

    // 5秒後に遅い接続の警告を表示
    const slowConnectionTimer = setTimeout(() => {
      setIsSlowConnection(true)
    }, 5000)

    try {
      const result = await login(email, password)

      if (result.success) {
        // リフォーム産業新聞社のユーザーは管理画面へ、それ以外はダッシュボードへ
        // ログイン後のユーザー情報からリダイレクト先を判定
        const savedUser = localStorage.getItem('premier_user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          if (userData.organization?.type === 'REFORM_COMPANY') {
            router.push('/admin/premier')
            return
          }
        }
        router.push('/dashboard')
      } else {
        setError(result.error || 'ログインに失敗しました')
      }
    } catch (err) {
      setError('ログイン中にエラーが発生しました')
    } finally {
      clearTimeout(slowConnectionTimer)
      setIsLoading(false)
      setIsSlowConnection(false)
    }
  }, [email, password, login, router])

  const fillDemoAccount = useCallback(async (accountType: string) => {
    const accounts: { [key: string]: { email: string; password: string }} = {
      'reform-admin': { email: 'admin@the-reform.co.jp', password: 'Admin123!' },
      'expert-admin': { email: 'admin@expert-reform.co.jp', password: 'Admin123!' },
      'expert-member': { email: 'member@expert-reform.co.jp', password: 'User123!' },
      'standard-admin': { email: 'admin@standard-koumuten.jp', password: 'Admin123!' }
    }

    const account = accounts[accountType]
    if (account) {
      setEmail(account.email)
      setPassword(account.password)
      setError('')
      setIsLoading(true)

      try {
        const result = await login(account.email, account.password)
        if (result.success) {
          const savedUser = localStorage.getItem('premier_user')
          if (savedUser) {
            const userData = JSON.parse(savedUser)
            if (userData.organization?.type === 'REFORM_COMPANY') {
              router.push('/admin/premier')
              return
            }
          }
          router.push('/dashboard')
        } else {
          setError(result.error || 'ログインに失敗しました')
        }
      } catch (err) {
        setError('ログイン中にエラーが発生しました')
      } finally {
        setIsLoading(false)
      }
    }
  }, [login, router])

  const loading = isLoading || authLoading

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">ログイン</h1>
            <p className="text-slate-600">
              プレミア購読アカウントにログイン
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>アカウント情報を入力</CardTitle>
              <CardDescription>
                メールアドレスとパスワードでログインしてください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 flex items-start gap-2" role="alert" aria-live="polite">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">パスワード</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="********"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                      onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {capsLockOn && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Caps Lockがオンになっています
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-slate-600">
                        ログイン状態を保持
                      </span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      パスワードを忘れた方
                    </Link>
                  </div>
                  <p className="text-xs text-slate-500">
                    ※共有PCをご利用の場合はチェックを外してください
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      認証中...
                    </>
                  ) : (
                    <>
                      ログイン
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {isSlowConnection && (
                  <p className="text-sm text-amber-600 text-center mt-2">
                    通信に時間がかかっています。通信環境をご確認ください。
                  </p>
                )}
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 bg-slate-50 rounded-b-lg">
              <div className="text-sm text-slate-600 space-y-2">
                <p>
                  リフォーム産業新聞プレミア購読のご契約者様はこちらからログインしてください。
                </p>
                <p>
                  アカウントをお持ちでない方は、法人管理者または{' '}
                  <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                    弊社までお問い合わせ
                  </Link>
                  ください。
                </p>
              </div>
            </CardFooter>
          </Card>

          {isDevelopment && (
            <div className="mt-8 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800 font-medium">開発環境専用 - 本番では非表示</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-3">リフォーム産業新聞社 管理者</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('reform-admin')}
                  className="text-xs bg-white hover:bg-blue-50"
                >
                  管理者
                </Button>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-900 mb-3">エキスパートプラン</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoAccount('expert-admin')}
                    className="text-xs bg-white hover:bg-purple-50"
                  >
                    法人管理者
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoAccount('expert-member')}
                    className="text-xs bg-white hover:bg-purple-50"
                  >
                    一般社員
                  </Button>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 mb-3">スタンダードプラン</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('standard-admin')}
                  className="text-xs bg-white hover:bg-green-50"
                >
                  法人管理者
                </Button>
              </div>

              <p className="text-xs text-slate-500 text-center">
                ボタンをクリックすると自動ログインします
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
