import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/lib/auth-context'
import {
  Building,
  Users,
  Shield,
  Globe,
  Calendar,
  Edit,
  Save,
  X,
  Upload,
  AlertCircle,
  AlertTriangle,
  Crown,
  Clock,
  History,
  Plus,
  Trash2,
  ChevronRight,
  Info,
  Mail,
  Send,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface DomainInfo {
  id: string
  domain: string
  verified: boolean
  autoJoin: boolean
  addedAt: string
  addedBy: string
}

interface ChangeLog {
  id: string
  type: 'organization' | 'domain'
  action: string
  description: string
  changedBy: string
  changedAt: string
}

export default function OrganizationSettings() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, planType } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [orgData, setOrgData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    industry: 'リフォーム・建設',
    description: ''
  })
  const [editData, setEditData] = useState(orgData)

  // Domain settings
  const [domains, setDomains] = useState<DomainInfo[]>([
    {
      id: '1',
      domain: 'test-org.com',
      verified: true,
      autoJoin: true,
      addedAt: '2024-01-15',
      addedBy: '管理者'
    }
  ])
  const [autoJoinDialogOpen, setAutoJoinDialogOpen] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<DomainInfo | null>(null)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [deleteStep, setDeleteStep] = useState(1)

  // Reminder settings (B-3)
  const [reminderSettings, setReminderSettings] = useState({
    enabled: false,
    daysThreshold: 14,
    targetType: 'ALL'
  })
  const [reminderSaving, setReminderSaving] = useState(false)
  const [reminderSaveSuccess, setReminderSaveSuccess] = useState(false)

  // Change logs
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([
    {
      id: '1',
      type: 'organization',
      action: '組織名変更',
      description: '「旧組織名」から「株式会社テスト組織」に変更',
      changedBy: '田中太郎',
      changedAt: '2024-12-01'
    },
    {
      id: '2',
      type: 'domain',
      action: 'ドメイン追加',
      description: 'test-org.com を追加',
      changedBy: '田中太郎',
      changedAt: '2024-01-15'
    }
  ])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    if (!isLoading && isAuthenticated && user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, user, router])

  useEffect(() => {
    if (user?.organization) {
      const org = user.organization
      setOrgData({
        name: org.name || '',
        email: org.email || '',
        phone: org.phone || '',
        address: org.address || '',
        website: org.website || '',
        industry: org.industry || 'リフォーム・建設',
        description: org.description || ''
      })
      // リマインド設定を取得
      fetchReminderSettings()
    }
  }, [user])

  const fetchReminderSettings = async () => {
    try {
      const res = await fetch('/api/organization/reminder-settings')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data) {
          setReminderSettings(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch reminder settings:', error)
    }
  }

  const handleSaveReminderSettings = async () => {
    setReminderSaving(true)
    try {
      const res = await fetch('/api/organization/reminder-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderSettings)
      })
      if (res.ok) {
        setReminderSaveSuccess(true)
        setTimeout(() => setReminderSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save reminder settings:', error)
    } finally {
      setReminderSaving(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditData(orgData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData(orgData)
  }

  const handleSave = async () => {
    // TODO: API call to save organization data
    setOrgData(editData)
    setIsEditing(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAutoJoinToggle = (domain: DomainInfo) => {
    if (domain.autoJoin) {
      // Turning off - no confirmation needed
      setDomains(domains.map(d =>
        d.id === domain.id ? { ...d, autoJoin: false } : d
      ))
    } else {
      // Turning on - need confirmation
      setSelectedDomain(domain)
      setAutoJoinDialogOpen(true)
    }
  }

  const confirmAutoJoinEnable = () => {
    if (selectedDomain) {
      setDomains(domains.map(d =>
        d.id === selectedDomain.id ? { ...d, autoJoin: true } : d
      ))
    }
    setAutoJoinDialogOpen(false)
    setSelectedDomain(null)
  }

  const handleDeleteOrganization = () => {
    if (deleteStep === 1) {
      setDeleteStep(2)
    } else if (deleteStep === 2 && deleteConfirmName === orgData.name) {
      // TODO: API call to delete organization
      console.log('Organization deleted')
      setDeleteDialogOpen(false)
      setDeleteStep(1)
      setDeleteConfirmName('')
    }
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

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  const memberCount = user.organization?.memberCount || 0
  const maxMembers = user.organization?.maxMembers || 50
  const remainingMembers = maxMembers - memberCount
  const subscriptionEndDate = user.subscription?.currentPeriodEnd

  const planLabel = planType === 'EXPERT' ? 'エキスパートコース' : 'スタンダードコース'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 重要性警告 (11-1) */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">この画面は管理者専用です</p>
              <p>
                組織設定の変更は全メンバーに影響します。変更前に内容をよく確認してください。
                不明な点はサポートまでお問い合わせください。
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">組織設定</h2>
            <p className="text-slate-600">組織の基本情報と設定を管理</p>
          </div>
          {!isEditing ? (
            <div className="text-right">
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                編集
              </Button>
              {/* 編集ボタン説明 (11-2) */}
              <p className="text-xs text-slate-500 mt-1">
                組織名・メール・住所を変更
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                キャンセル
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organization Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>組織の基本的な情報を管理します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">組織名</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        name="name"
                        value={editData.name}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-slate-700">{orgData.name || '未設定'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={editData.email}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-slate-700">{orgData.email || '未設定'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">電話番号</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        name="phone"
                        value={editData.phone}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-slate-700">{orgData.phone || '未設定'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">ウェブサイト</Label>
                    {isEditing ? (
                      <Input
                        id="website"
                        name="website"
                        value={editData.website}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-slate-700">{orgData.website || '未設定'}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">住所</Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      name="address"
                      value={editData.address}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{orgData.address || '未設定'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  {isEditing ? (
                    <textarea
                      id="description"
                      name="description"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                      rows={3}
                      value={editData.description}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{orgData.description || '未設定'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Domain Settings (11-3, 11-4) */}
            <Card>
              <CardHeader>
                <CardTitle>ドメイン設定</CardTitle>
                <CardDescription>組織のドメインと自動参加設定を管理</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {domains.map((domain) => (
                  <div key={domain.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Globe className="h-5 w-5 text-slate-500" />
                        <div>
                          <p className="font-medium">{domain.domain}</p>
                          <p className="text-sm text-slate-500">
                            追加日: {formatDate(domain.addedAt)} / 追加者: {domain.addedBy}
                          </p>
                        </div>
                      </div>
                      {domain.verified && (
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          認証済み
                        </Badge>
                      )}
                    </div>

                    {/* 自動参加スイッチ (11-3) */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium">自動参加を許可</p>
                          <p className="text-xs text-slate-500">
                            @{domain.domain} のメールアドレスを持つユーザーが自動で組織に参加可能
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={domain.autoJoin}
                        onCheckedChange={() => handleAutoJoinToggle(domain)}
                      />
                    </div>

                    {domain.autoJoin && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-amber-800">
                            <p className="font-medium">自動参加が有効です</p>
                            <p>
                              このドメインのメールアドレスを持つ人は、招待なしで組織に参加できます。
                              セキュリティ上の懸念がある場合はオフにしてください。
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* ドメイン追加 (11-4) */}
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4">
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    ドメインを追加
                  </Button>
                  <p className="text-xs text-slate-500 text-center mt-2">
                    複数のドメインを追加すると、それぞれのドメインからメンバーが参加できます
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* リマインドメール設定 (B-3) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  リマインドメール設定
                </CardTitle>
                <CardDescription>
                  未ログインメンバーへの自動リマインドメールを設定
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Send className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">自動リマインドメール</p>
                      <p className="text-sm text-slate-500">
                        一定期間ログインしていないメンバーに自動でメールを送信
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={reminderSettings.enabled}
                    onCheckedChange={(checked) =>
                      setReminderSettings(prev => ({ ...prev, enabled: checked }))
                    }
                  />
                </div>

                {reminderSettings.enabled && (
                  <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                    <div className="space-y-2">
                      <Label>未ログイン日数の閾値</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={90}
                          value={reminderSettings.daysThreshold}
                          onChange={(e) =>
                            setReminderSettings(prev => ({
                              ...prev,
                              daysThreshold: parseInt(e.target.value, 10) || 14
                            }))
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-slate-600">日以上未ログインで送信</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        7日以内に既に送信済みのユーザーには再送信されません
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {reminderSaveSuccess && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          設定を保存しました
                        </p>
                      )}
                      <Button
                        onClick={handleSaveReminderSettings}
                        disabled={reminderSaving}
                        className="ml-auto"
                      >
                        {reminderSaving ? '保存中...' : '設定を保存'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-slate-600">送信履歴を確認</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/organization/reminder-logs">
                      履歴を見る
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 変更履歴 (11-9) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  変更履歴
                </CardTitle>
                <CardDescription>組織設定の変更記録</CardDescription>
              </CardHeader>
              <CardContent>
                {changeLogs.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    変更履歴はありません
                  </p>
                ) : (
                  <div className="space-y-3">
                    {changeLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className={`p-1.5 rounded ${
                          log.type === 'organization' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {log.type === 'organization' ? (
                            <Building className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Globe className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-slate-600">{log.description}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDate(log.changedAt)} / {log.changedBy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization Stats (11-5, 11-6) */}
            <Card>
              <CardHeader>
                <CardTitle>組織の統計</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* メンバー数 (11-5) */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">メンバー数</span>
                    </div>
                    <span className="font-bold text-blue-700">
                      {memberCount}名
                      <span className="text-sm font-normal text-slate-500">（招待{maxMembers}名）</span>
                    </span>
                  </div>
                  <div className="h-2 bg-blue-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min((memberCount / maxMembers) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">
                      残り{remainingMembers}名招待可能
                    </span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                      <Link href="/dashboard/members">
                        メンバー確認
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* プラン詳細 (11-6) */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">契約プラン</span>
                  </div>
                  <p className="font-bold text-purple-700">{planLabel}</p>
                  {subscriptionEndDate && (
                    <p className="text-xs text-slate-600 mt-1">
                      更新日: {formatDate(subscriptionEndDate.toString())}
                    </p>
                  )}
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs mt-2" asChild>
                    <Link href="/dashboard/billing">
                      契約詳細を見る
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">登録日</span>
                  </div>
                  <span className="text-sm font-medium">
                    {user.organization?.createdAt
                      ? formatDate(user.organization.createdAt.toString())
                      : '不明'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Logo Upload (11-7) */}
            <Card>
              <CardHeader>
                <CardTitle>組織ロゴ</CardTitle>
                <CardDescription>ロゴをアップロードして組織をカスタマイズ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Building className="h-12 w-12 text-slate-400" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    ロゴをアップロード
                  </Button>
                  {/* ロゴ用途説明 (11-7) */}
                  <div className="bg-slate-50 p-3 rounded-lg w-full">
                    <div className="flex gap-2">
                      <Info className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-600">
                        <p className="font-medium mb-1">ロゴの表示場所</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>ダッシュボードヘッダー</li>
                          <li>コミュニティ投稿</li>
                          <li>資料・レポート</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    推奨: 512x512px、PNG または JPG
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone (11-8) */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  危険ゾーン
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800 font-medium mb-2">
                    組織を削除すると以下が失われます:
                  </p>
                  <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
                    <li>全メンバーのアカウントとデータ</li>
                    <li>セミナー参加履歴、動画視聴履歴</li>
                    <li>コミュニティ投稿、ダウンロード履歴</li>
                    <li>契約情報、請求履歴</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setDeleteDialogOpen(true)
                    setDeleteStep(1)
                    setDeleteConfirmName('')
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  組織を削除
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  この操作は取り消せません
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 自動参加確認ダイアログ (11-3) */}
      <AlertDialog open={autoJoinDialogOpen} onOpenChange={setAutoJoinDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>自動参加を有効にしますか？</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                @{selectedDomain?.domain} のメールアドレスを持つユーザーは、
                招待なしで組織に参加できるようになります。
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-sm">
                  <strong>注意:</strong> このドメインのメールアドレスを持つ全員が
                  組織のコンテンツにアクセスできるようになります。
                  社内専用のドメインであることを確認してください。
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAutoJoinEnable}>
              有効にする
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 組織削除確認ダイアログ (11-8) */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              {deleteStep === 1 ? '組織を削除しますか？' : '最終確認'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteStep === 1 ? (
                <div className="space-y-3">
                  <p>
                    この操作は取り消すことができません。
                    組織に関連するすべてのデータが完全に削除されます。
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm font-medium mb-2">削除されるデータ:</p>
                    <ul className="text-red-700 text-sm list-disc list-inside">
                      <li>全メンバーのアカウント（{memberCount}名）</li>
                      <li>セミナー・アーカイブの利用履歴</li>
                      <li>コミュニティ投稿・コメント</li>
                      <li>契約情報・請求履歴</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>
                    削除を確定するには、組織名を入力してください。
                  </p>
                  <div className="space-y-2">
                    <Label>組織名: <strong>{orgData.name}</strong></Label>
                    <Input
                      placeholder="組織名を入力"
                      value={deleteConfirmName}
                      onChange={(e) => setDeleteConfirmName(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteStep(1)
              setDeleteConfirmName('')
            }}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrganization}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteStep === 2 && deleteConfirmName !== orgData.name}
            >
              {deleteStep === 1 ? '次へ' : '削除を実行'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
