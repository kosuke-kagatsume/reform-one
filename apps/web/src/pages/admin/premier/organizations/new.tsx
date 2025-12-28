import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { ArrowLeft, Save, Building, User, CreditCard, Calendar, Link as LinkIcon } from 'lucide-react'

export default function NewOrganizationPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ inviteUrl: string } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    planType: 'STANDARD',
    adminEmail: '',
    adminName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(null)
    setSaving(true)

    if (!formData.name || !formData.slug || !formData.adminEmail) {
      setError('必須項目を入力してください')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/admin/premier/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess({ inviteUrl: data.inviteUrl })
      } else {
        setError(data.error || '作成に失敗しました')
      }
    } catch (error) {
      console.error('Failed to create organization:', error)
      setError('作成に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const copyInviteUrl = () => {
    if (success?.inviteUrl) {
      const fullUrl = window.location.origin + success.inviteUrl
      navigator.clipboard.writeText(fullUrl)
      alert('招待URLをコピーしました')
    }
  }

  if (isLoading) {
    return (
      <PremierAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </PremierAdminLayout>
    )
  }

  if (success) {
    return (
      <PremierAdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/premier/organizations">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">組織を作成しました</h1>
              <p className="text-slate-600">招待URLを管理者に送信してください</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Building className="h-5 w-5" />
                組織の作成が完了しました
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 mb-4">
                  組織「{formData.name}」を作成しました。以下の招待URLを管理者（{formData.adminEmail}）に送信してください。
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={window.location.origin + success.inviteUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={copyInviteUrl} variant="outline">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    コピー
                  </Button>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  この招待URLは7日間有効です
                </p>
              </div>

              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/admin/premier/organizations">組織一覧に戻る</Link>
                </Button>
                <Button variant="outline" onClick={() => {
                  setSuccess(null)
                  setFormData({
                    name: '',
                    slug: '',
                    planType: 'STANDARD',
                    adminEmail: '',
                    adminName: '',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                  })
                }}>
                  別の組織を作成
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/premier/organizations">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">新規契約組織登録</h1>
            <p className="text-slate-600">プレミア購読の新規契約組織を登録します</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  組織情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">組織名 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="例: 株式会社サンプル"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">識別子（スラッグ） *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="例: sample-company"
                    />
                    <p className="text-xs text-slate-500">
                      URLに使用される識別子です。英数字とハイフンのみ使用できます。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  管理者情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">管理者メールアドレス *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="admin@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminName">管理者名</Label>
                  <Input
                    id="adminName"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    placeholder="山田 太郎"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  契約プラン
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="planType">プラン *</Label>
                  <select
                    id="planType"
                    value={formData.planType}
                    onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="STANDARD">スタンダード（年額110,000円・税込）</option>
                    <option value="EXPERT">エキスパート（年額220,000円・税込）</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    ※ 既存購読者は22,000円（税込）の割引が適用されます
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg text-sm">
                  {formData.planType === 'STANDARD' ? (
                    <div>
                      <p className="font-medium mb-2">スタンダードプラン</p>
                      <ul className="list-disc list-inside text-slate-600 space-y-1">
                        <li>セミナー参加</li>
                        <li>アーカイブ視聴</li>
                        <li>メンバー管理</li>
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium mb-2">エキスパートプラン</p>
                      <ul className="list-disc list-inside text-slate-600 space-y-1">
                        <li>スタンダードの全機能</li>
                        <li>コミュニティアクセス</li>
                        <li>定例会参加</li>
                        <li>専門家への相談</li>
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  契約期間
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">契約開始日</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">契約終了日</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" type="button" asChild>
              <Link href="/admin/premier/organizations">キャンセル</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? '作成中...' : '組織を登録'}
            </Button>
          </div>
        </form>
      </div>
    </PremierAdminLayout>
  )
}
