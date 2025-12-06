import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
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
  CheckCircle
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, planType, logout } = useAuth()
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
        <div>
          <h1 className="text-2xl font-bold">設定</h1>
          <p className="text-slate-600">アカウントと組織の設定</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                プロフィール
              </CardTitle>
              <CardDescription>
                あなたのアカウント情報
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                {saveSuccess && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    保存しました
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>メールアドレス</Label>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>権限</Label>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-600" />
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role === 'ADMIN' ? '管理者' : 'メンバー'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                組織情報
              </CardTitle>
              <CardDescription>
                所属する組織の情報
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>組織名</Label>
                <p className="text-slate-900 font-medium">{user.organization.name}</p>
              </div>

              <div className="space-y-2">
                <Label>契約プラン</Label>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-600" />
                  <Badge variant={planType === 'EXPERT' ? 'default' : 'secondary'}>
                    {planType === 'EXPERT' ? 'エキスパートプラン' : 'スタンダードプラン'}
                  </Badge>
                </div>
              </div>

              {user.subscription && (
                <>
                  <div className="space-y-2">
                    <Label>契約期間</Label>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(user.subscription.currentPeriodStart.toString())} 〜{' '}
                        {formatDate(user.subscription.currentPeriodEnd.toString())}
                      </span>
                    </div>
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">アカウント操作</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleLogout}>
              ログアウト
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
