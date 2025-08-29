import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Mail, Lock, User, Building, AlertCircle, CheckCircle } from 'lucide-react'

export default function Signup() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: '',
    companyDomain: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateStep = () => {
    setError('')
    
    if (step === 1) {
      if (!formData.companyName || !formData.companyDomain) {
        setError('すべての項目を入力してください')
        return false
      }
      if (!formData.companyDomain.includes('.')) {
        setError('正しいドメイン形式で入力してください')
        return false
      }
    } else if (step === 2) {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('すべての項目を入力してください')
        return false
      }
      if (!formData.email.includes('@')) {
        setError('正しいメールアドレスを入力してください')
        return false
      }
      if (formData.password.length < 8) {
        setError('パスワードは8文字以上で入力してください')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('パスワードが一致しません')
        return false
      }
      if (!formData.agreeToTerms) {
        setError('利用規約に同意してください')
        return false
      }
    }
    
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep()) return
    
    setIsLoading(true)
    
    try {
      // TODO: Implement actual signup logic
      console.log('Signup attempt:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Success
      setStep(3)
    } catch (err) {
      setError('登録中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 3) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">登録完了</CardTitle>
              <CardDescription>
                アカウントの作成が完了しました
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">次のステップ：</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>確認メールを送信しました</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>メール内のリンクをクリックして認証を完了してください</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>認証後、ログインが可能になります</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/login">ログインページへ</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">アカウント作成</h1>
            <p className="text-slate-600">
              Reform Oneで業務を効率化しましょう
            </p>
          </div>

          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
              1
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
              2
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 ? '組織情報' : 'アカウント情報'}
              </CardTitle>
              <CardDescription>
                {step === 1 
                  ? '所属する組織の情報を入力してください' 
                  : '個人アカウント情報を入力してください'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 flex items-start gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {step === 1 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">会社名</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="companyName"
                          name="companyName"
                          placeholder="株式会社リフォーム"
                          className="pl-10"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyDomain">会社ドメイン</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="companyDomain"
                          name="companyDomain"
                          placeholder="reform.co.jp"
                          className="pl-10"
                          value={formData.companyDomain}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        同じドメインのメールアドレスを持つユーザーが自動的に組織に参加できます
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">お名前</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="name"
                          name="name"
                          placeholder="山田 太郎"
                          className="pl-10"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">メールアドレス</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@reform.co.jp"
                          className="pl-10"
                          value={formData.email}
                          onChange={handleInputChange}
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
                          name="password"
                          type="password"
                          placeholder="8文字以上"
                          className="pl-10"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">パスワード（確認）</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="パスワードを再入力"
                          className="pl-10"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-start">
                      <input
                        id="agreeToTerms"
                        name="agreeToTerms"
                        type="checkbox"
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="agreeToTerms" className="ml-2 text-sm text-slate-600">
                        <Link href="/terms" className="text-blue-600 hover:text-blue-700">利用規約</Link>
                        および
                        <Link href="/privacy" className="text-blue-600 hover:text-blue-700">プライバシーポリシー</Link>
                        に同意します
                      </label>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-4">
                  {step === 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      戻る
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      '処理中...'
                    ) : step === 1 ? (
                      <>
                        次へ
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      '登録する'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-center text-sm text-slate-600 w-full">
                すでにアカウントをお持ちの方は{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  ログイン
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  )
}