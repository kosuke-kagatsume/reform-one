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
      
      // Updated test accounts with new schema
      const validAccounts = [
        // Reform Company employees
        { email: 'admin@reform-s.co.jp', password: 'Admin123!', userType: 'EMPLOYEE', role: 'ADMIN' },
        { email: 'planning@reform-s.co.jp', password: 'User123!', userType: 'EMPLOYEE', role: 'DEPARTMENT_MANAGER' },
        { email: 'editor@reform-s.co.jp', password: 'User123!', userType: 'EMPLOYEE', role: 'MEMBER' },
        // Heavy customers
        { email: 'admin@ohte-reform.co.jp', password: 'Admin123!', userType: 'CUSTOMER', role: 'ADMIN' },
        { email: 'user@ohte-reform.co.jp', password: 'User123!', userType: 'CUSTOMER', role: 'MEMBER' },
        // Light customers
        { email: 'tanaka@tanaka-koumuten.jp', password: 'User123!', userType: 'CUSTOMER', role: 'ADMIN' },
        // Demo accounts
        { email: 'admin@test-org.com', password: 'Admin123!', userType: 'CUSTOMER', role: 'ADMIN' },
        { email: 'manager@test-org.com', password: 'User123!', userType: 'CUSTOMER', role: 'DEPARTMENT_MANAGER' },
        { email: 'member@test-org.com', password: 'User123!', userType: 'CUSTOMER', role: 'MEMBER' },
        // External instructor
        { email: 'instructor@external.com', password: 'User123!', userType: 'EXTERNAL_INSTRUCTOR', role: 'MEMBER' }
      ]
      
      const account = validAccounts.find(
        acc => acc.email === email && acc.password === password
      )
      
      if (account) {
        // Route based on user type
        if (account.userType === 'EMPLOYEE') {
          router.push('/admin/dashboard')
        } else if (account.userType === 'EXTERNAL_INSTRUCTOR') {
          router.push('/instructor/dashboard')
        } else {
          // Customer - check if heavy or light user
          if (['admin@ohte-reform.co.jp', 'user@ohte-reform.co.jp', 'admin@test-org.com', 'manager@test-org.com', 'member@test-org.com'].includes(account.email)) {
            router.push('/dashboard') // Heavy user dashboard
          } else {
            router.push('/dashboard/simple') // Light user dashboard
          }
        }
      } else {
        setError('メールアドレスまたはパスワードが正しくありません')
      }
    } catch (err) {
      setError('ログイン中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoAccount = (accountType: string) => {
    const accounts: { [key: string]: { email: string; password: string }} = {
      // Reform Company employees
      'reform-admin': { email: 'admin@reform-s.co.jp', password: 'Admin123!' },
      'reform-planning': { email: 'planning@reform-s.co.jp', password: 'User123!' },
      'reform-editor': { email: 'editor@reform-s.co.jp', password: 'User123!' },
      // Heavy customers
      'heavy-admin': { email: 'admin@ohte-reform.co.jp', password: 'Admin123!' },
      'heavy-user': { email: 'user@ohte-reform.co.jp', password: 'User123!' },
      // Light customer
      'light-owner': { email: 'tanaka@tanaka-koumuten.jp', password: 'User123!' },
      // Demo accounts
      'demo-admin': { email: 'admin@test-org.com', password: 'Admin123!' },
      'demo-manager': { email: 'manager@test-org.com', password: 'User123!' },
      'demo-member': { email: 'member@test-org.com', password: 'User123!' },
      // External instructor
      'instructor': { email: 'instructor@external.com', password: 'User123!' }
    }
    
    const account = accounts[accountType]
    if (account) {
      setEmail(account.email)
      setPassword(account.password)
      setError('')
    }
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

          <div className="mt-8 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-3">🏢 リフォーム産業新聞社 社員</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('reform-admin')}
                  className="text-xs bg-white hover:bg-blue-50"
                >
                  管理者
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('reform-planning')}
                  className="text-xs bg-white hover:bg-blue-50"
                >
                  企画部長
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('reform-editor')}
                  className="text-xs bg-white hover:bg-blue-50"
                >
                  編集スタッフ
                </Button>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-900 mb-3">🎓 ヘビーユーザー（研修・サロン参加）</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('heavy-admin')}
                  className="text-xs bg-white hover:bg-purple-50"
                >
                  大手リフォーム管理者
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('heavy-user')}
                  className="text-xs bg-white hover:bg-purple-50"
                >
                  大手リフォーム社員
                </Button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 mb-3">📰 ライトユーザー（電子版のみ）</p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('light-owner')}
                  className="text-xs bg-white hover:bg-green-50"
                >
                  田中工務店
                </Button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-700 mb-3">🎯 デモアカウント（テスト用）</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('demo-admin')}
                  className="text-xs bg-white hover:bg-slate-100"
                >
                  管理者
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('demo-manager')}
                  className="text-xs bg-white hover:bg-slate-100"
                >
                  マネージャー
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoAccount('demo-member')}
                  className="text-xs bg-white hover:bg-slate-100"
                >
                  メンバー
                </Button>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center">
              ボタンをクリックすると、自動的にフォームに入力されます
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}