import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // TODO: Implement actual login logic
      console.log('Login attempt:', { email, password })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, check against test accounts
      const validAccounts = [
        { email: 'admin@test-org.com', password: 'Admin123!' },
        { email: 'manager@test-org.com', password: 'User123!' },
        { email: 'member@test-org.com', password: 'User123!' }
      ]
      
      const isValid = validAccounts.some(
        account => account.email === email && account.password === password
      )
      
      if (isValid) {
        router.push('/dashboard')
      } else {
        setError('メールアドレスまたはパスワードが正しくありません')
      }
    } catch (err) {
      setError('ログイン中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoAccount = (accountType: 'admin' | 'manager' | 'member') => {
    const accounts = {
      admin: { email: 'admin@test-org.com', password: 'Admin123!' },
      manager: { email: 'manager@test-org.com', password: 'User123!' },
      member: { email: 'member@test-org.com', password: 'User123!' }
    }
    
    const account = accounts[accountType]
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">ログイン</h1>
            <p className="text-slate-600">
              Reform Oneアカウントにログイン
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
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
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
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

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

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    '認証中...'
                  ) : (
                    <>
                      ログイン
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-slate-500">または</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                size="lg"
                asChild
              >
                <Link href="/magic-link">
                  <Mail className="mr-2 h-4 w-4" />
                  マジックリンクでログイン
                </Link>
              </Button>

              <p className="text-center text-sm text-slate-600">
                アカウントをお持ちでない方は{' '}
                <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  新規登録
                </Link>
              </p>
            </CardFooter>
          </Card>

          <div className="mt-8">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-700 mb-3">🎯 デモアカウントで試す</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('admin')}
                  className="text-xs"
                >
                  管理者
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('manager')}
                  className="text-xs"
                >
                  マネージャー
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('member')}
                  className="text-xs"
                >
                  メンバー
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                ボタンをクリックすると、自動的にフォームに入力されます
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}