import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import {
  User,
  Building,
  Mail,
  CreditCard,
  Calendar,
  Shield,
  CheckCircle,
  ArrowRight,
  Bell,
  LogOut,
  Info,
  ExternalLink
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, planType, isAdmin, logout } = useAuth()
  const isMember = !isAdmin
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
    }
  }, [user])

  const handleSaveName = async () => {
    if (!user) return

    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name })
      })

      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save name:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* タイトル（14-1）- 一般社員向け */}
        <div>
          <h1 className="text-2xl font-bold">
            {isMember ? 'マイアカウント' : 'アカウント・組織設定'}
          </h1>
          <p className="text-slate-600">
            {isMember ? 'プロフィールや通知設定を変更できます' : 'アカウント情報と組織の設定を管理'}
          </p>
        </div>

        {/* セクション1: あなた個人（14-2） */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            あなた個人の設定
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* プロフィール */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">プロフィール</CardTitle>
                <CardDescription>あなたのアカウント情報</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 表示名（14-3） */}
                <div className="space-y-2">
                  <Label htmlFor="name">表示名</Label>
                  <div className="flex gap-2">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="名前を入力"
                    />
                    <Button onClick={handleSaveName} disabled={saving}>
                      {saving ? '保存中...' : '保存'}
                    </Button>
                  </div>
                  {/* 表示名説明（14-3） */}
                  <p className="text-xs text-slate-500">
                    この名前は社内メンバー一覧やコミュニティ内で表示されます
                  </p>
                  {saveSuccess && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      保存しました
                    </p>
                  )}
                </div>

                {/* メールアドレス（14-4） */}
                <div className="space-y-2">
                  <Label>メールアドレス</Label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-700">{user.email}</span>
                  </div>
                  {/* メールアドレス説明（14-4） */}
                  <p className="text-xs text-slate-500">
                    メールアドレスの変更は
                    <a href="mailto:support@the-reform.co.jp" className="text-blue-600 hover:underline ml-1">
                      サポートへご連絡ください
                    </a>
                  </p>
                </div>

                {/* 権限（14-5） */}
                <div className="space-y-2">
                  <Label>権限</Label>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-600" />
                    <Badge variant={isAdmin ? 'default' : 'secondary'}>
                      {isAdmin ? '管理者' : 'メンバー'}
                    </Badge>
                  </div>
                  {/* 権限説明追加（14-5） */}
                  <p className="text-xs text-slate-500">
                    {isAdmin
                      ? '管理者は社員招待、組織設定、請求管理などの操作が可能です'
                      : 'メンバーはコンテンツの閲覧・利用が可能です'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* クイックリンク（14-8） */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">設定メニュー</CardTitle>
                <CardDescription>各種設定へのリンク</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* セキュリティ導線（14-8） */}
                <Link
                  href="/dashboard/security"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">セキュリティ設定</p>
                      <p className="text-xs text-slate-500">パスワード変更・二要素認証</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>

                {/* 通知導線（14-8） */}
                <Link
                  href="/dashboard/notifications"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">通知設定</p>
                      <p className="text-xs text-slate-500">メール・アプリ内通知の設定</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* セクション2: 組織（管理者のみ）（14-2） */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building className="h-5 w-5" />
            組織の設定
            {!isAdmin && (
              <Badge variant="outline" className="ml-2 text-xs">
                管理者のみ編集可能
              </Badge>
            )}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 組織情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">組織情報</CardTitle>
                <CardDescription>所属する組織の情報</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>組織名</Label>
                  <p className="text-slate-900 font-medium">{user.organization.name}</p>
                </div>

                {/* プラン表示強化（14-6） */}
                <div className="space-y-2">
                  <Label>契約プラン</Label>
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <Badge className={planType === 'EXPERT' ? 'bg-blue-600' : ''}>
                          {planType === 'EXPERT' ? 'エキスパートプラン' : 'スタンダードプラン'}
                        </Badge>
                      </div>
                      <Button variant="link" asChild className="p-0 h-auto text-sm">
                        <Link href="/dashboard/billing">
                          詳細を見る
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {user.subscription && (
                  <>
                    {/* 更新日表示（14-6） */}
                    <div className="space-y-2">
                      <Label>契約期間</Label>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(user.subscription.currentPeriodStart.toString())} 〜{' '}
                          {formatDate(user.subscription.currentPeriodEnd.toString())}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        次回更新: {formatDate(user.subscription.currentPeriodEnd.toString())}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>自動更新</Label>
                      <Badge variant={user.subscription.autoRenewal ? 'default' : 'outline'}>
                        {user.subscription.autoRenewal ? '有効' : '無効'}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 管理者向けリンク */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">組織管理</CardTitle>
                  <CardDescription>管理者向けメニュー</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link
                    href="/dashboard/members"
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">メンバー管理</p>
                        <p className="text-xs text-slate-500">社員の招待・権限管理</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  <Link
                    href="/dashboard/organization"
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">組織設定</p>
                        <p className="text-xs text-slate-500">組織情報・ドメイン設定</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>

                  <Link
                    href="/dashboard/billing"
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium">請求・支払い</p>
                        <p className="text-xs text-slate-500">契約情報・請求履歴</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* ログイン操作（14-7） */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-700">ログイン操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  現在 <span className="font-medium">{user.email}</span> でログイン中
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                ログアウト
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ヘルプ */}
        <Card className="bg-slate-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Info className="h-4 w-4" />
              <span>
                設定に関するご質問は
                <a href="mailto:support@the-reform.co.jp" className="text-blue-600 hover:underline ml-1">
                  サポート
                </a>
                までお問い合わせください
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
