import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import { EmailSendDialog } from '@/components/admin/email-send-dialog'
import { PLAN_OPTIONS, EXISTING_SUBSCRIPTION_OPTIONS, DISCOUNT_TYPE_LABELS, type ExistingSubscriptionType, type DiscountType } from '@/types/premier'
import {
  ArrowLeft,
  Save,
  Building,
  Users,
  CreditCard,
  Mail,
  Calendar,
  Trash2,
  UserPlus,
  Link as LinkIcon,
  Clock,
  RefreshCw,
  History,
  CheckCircle,
  XCircle,
  Send,
  Percent,
  FileText
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Subscription {
  id: string
  planType: string
  status: string
  discountType: string
  currentPeriodStart: string
  currentPeriodEnd: string
  basePrice: number
  finalPrice: number
}

interface Member {
  userId: string
  role: string
  joinedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface Invitation {
  id: string
  email: string
  role: string
  token: string
  status: string
  expiresAt: string
  createdAt: string
}

interface Organization {
  id: string
  name: string
  slug: string
  type: string
  createdAt: string
  existingSubscriptionTypes: string
  adminNotes: string | null
  subscriptions: Subscription[]
  users: Member[]
  invitations: Invitation[]
}

interface EmailHistoryItem {
  id: string
  templateType: string
  recipientEmail: string
  recipientName: string | null
  recipientType: string
  subject: string
  status: string
  sentAt: string
  metadata: {
    organizationName?: string
    planType?: string
    daysRemaining?: number
  } | null
}

type EmailType = 'CONTACT' | 'RENEWAL_NOTICE'

interface EmailRecipient {
  id: string
  name: string
  planType?: string
  expiresAt?: string | null
  daysRemaining?: number
  userCount?: number
}

export default function OrganizationDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([])
  const [emailHistoryLoading, setEmailHistoryLoading] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailType, setEmailType] = useState<EmailType>('CONTACT')
  const [emailRecipient, setEmailRecipient] = useState<EmailRecipient | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    planIndex: 0,
    status: '',
    startDate: '',
    endDate: '',
    existingSubscriptionTypes: [] as string[],
    adminNotes: ''
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany && id) {
      fetchOrganization()
    }
  }, [isAuthenticated, isReformCompany, id])

  // Fetch email history when tab changes to email-history
  useEffect(() => {
    if (activeTab === 'email-history' && id) {
      fetchEmailHistory()
    }
  }, [activeTab, id])

  const fetchOrganization = async () => {
    try {
      const res = await fetch(`/api/admin/premier/organizations/${id}`)
      if (res.ok) {
        const data = await res.json()
        setOrganization(data.organization)

        const activeSubscription = data.organization.subscriptions.find(
          (s: Subscription) => s.status === 'ACTIVE'
        )

        const currentPlanType = activeSubscription?.planType || 'STANDARD'
        const currentDiscountType = activeSubscription?.discountType || 'NONE'
        const planIdx = PLAN_OPTIONS.findIndex(
          p => p.planType === currentPlanType && p.discountType === currentDiscountType
        )

        let existingSubTypes: string[] = []
        try {
          existingSubTypes = JSON.parse(data.organization.existingSubscriptionTypes || '[]')
        } catch {}

        setFormData({
          name: data.organization.name,
          slug: data.organization.slug,
          planIndex: planIdx >= 0 ? planIdx : 0,
          status: activeSubscription?.status || '',
          startDate: activeSubscription?.currentPeriodStart?.split('T')[0] || '',
          endDate: activeSubscription?.currentPeriodEnd?.split('T')[0] || '',
          existingSubscriptionTypes: existingSubTypes,
          adminNotes: data.organization.adminNotes || ''
        })
      } else {
        setError('組織が見つかりません')
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error)
      setError('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const selectedPlan = PLAN_OPTIONS[formData.planIndex]
      const res = await fetch(`/api/admin/premier/organizations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          planType: selectedPlan.planType,
          discountType: selectedPlan.discountType,
          status: formData.status,
          startDate: formData.startDate,
          endDate: formData.endDate,
          existingSubscriptionTypes: formData.existingSubscriptionTypes,
          adminNotes: formData.adminNotes
        })
      })

      if (res.ok) {
        fetchOrganization()
        setError('')
      } else {
        const data = await res.json()
        setError(data.error || '更新に失敗しました')
      }
    } catch (error) {
      console.error('Failed to update organization:', error)
      setError('更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/premier/organizations/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.push('/admin/premier/organizations')
      } else {
        const data = await res.json()
        setError(data.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete organization:', error)
      setError('削除に失敗しました')
    } finally {
      setDeleting(false)
    }
  }

  const copyInviteUrl = (token: string) => {
    const fullUrl = window.location.origin + `/invite/${token}`
    navigator.clipboard.writeText(fullUrl)
    alert('招待URLをコピーしました')
  }

  const fetchEmailHistory = async () => {
    if (!id) return
    setEmailHistoryLoading(true)
    try {
      const res = await fetch(`/api/admin/premier/email/history?recipientId=${id}&recipientType=ORGANIZATION`)
      if (res.ok) {
        const data = await res.json()
        setEmailHistory(data.history)
      }
    } catch (error) {
      console.error('Failed to fetch email history:', error)
    } finally {
      setEmailHistoryLoading(false)
    }
  }

  const openEmailDialog = (type: EmailType) => {
    if (!organization) return
    const activeSubscription = organization.subscriptions.find(s => s.status === 'ACTIVE')

    setEmailType(type)
    setEmailRecipient({
      id: organization.id,
      name: organization.name,
      planType: activeSubscription?.planType,
      expiresAt: activeSubscription?.currentPeriodEnd ?? null,
      daysRemaining: activeSubscription ? Math.ceil(
        (new Date(activeSubscription.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ) : undefined,
      userCount: organization.users.length
    })
    setEmailDialogOpen(true)
  }

  const handleEmailSuccess = () => {
    fetchEmailHistory()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
  }

  if (isLoading || loading) {
    return (
      <PremierAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </PremierAdminLayout>
    )
  }

  if (!organization) {
    return (
      <PremierAdminLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">組織が見つかりません</p>
          <Button asChild className="mt-4">
            <Link href="/admin/premier/organizations">一覧に戻る</Link>
          </Button>
        </div>
      </PremierAdminLayout>
    )
  }

  const activeSubscription = organization.subscriptions.find(s => s.status === 'ACTIVE')
  const pendingInvitations = organization.invitations.filter(i => i.status === 'PENDING')

  return (
    <PremierAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/premier/organizations">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{organization.name}</h1>
              <p className="text-slate-600">組織詳細・設定</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => openEmailDialog('CONTACT')}>
              <Mail className="h-4 w-4 mr-2" />
              連絡する
            </Button>
            <Button
              variant="outline"
              onClick={() => openEmailDialog('RENEWAL_NOTICE')}
              disabled={!activeSubscription}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              契約更新案内
            </Button>
            <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                組織を削除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>組織を削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  この操作は取り消せません。組織に関連するすべてのデータ（メンバー、購読情報など）も削除されます。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  削除する
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{organization.users.length}</p>
                  <p className="text-sm text-slate-600">メンバー数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <Badge variant={activeSubscription?.planType === 'EXPERT' ? 'default' : 'secondary'}>
                    {activeSubscription?.planType === 'EXPERT' ? 'エキスパート' : 'スタンダード'}
                  </Badge>
                  <p className="text-sm text-slate-600 mt-1">契約プラン</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingInvitations.length}</p>
                  <p className="text-sm text-slate-600">保留中の招待</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {activeSubscription ? formatDate(activeSubscription.currentPeriodEnd) : '-'}
                  </p>
                  <p className="text-sm text-slate-600">契約終了日</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">
              <Building className="h-4 w-4 mr-2" />
              基本情報
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              メンバー
            </TabsTrigger>
            <TabsTrigger value="invitations">
              <Mail className="h-4 w-4 mr-2" />
              招待
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <CreditCard className="h-4 w-4 mr-2" />
              購読
            </TabsTrigger>
            <TabsTrigger value="email-history">
              <History className="h-4 w-4 mr-2" />
              メール履歴
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>組織情報の編集</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">組織名</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">識別子</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="planIndex">プラン</Label>
                      <select
                        id="planIndex"
                        value={formData.planIndex}
                        onChange={(e) => setFormData({ ...formData, planIndex: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        {PLAN_OPTIONS.map((option, index) => (
                          <option key={index} value={index}>
                            {option.label}（¥{option.price.toLocaleString()}）
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">ステータス</Label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="ACTIVE">アクティブ</option>
                        <option value="CANCELLED">キャンセル</option>
                        <option value="EXPIRED">期限切れ</option>
                      </select>
                    </div>
                  </div>

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

                  <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Percent className="h-5 w-5 text-purple-600" />
                      <Label className="text-base font-medium">既存購読ステータス</Label>
                    </div>
                    <div className="space-y-2">
                      {EXISTING_SUBSCRIPTION_OPTIONS.map(option => (
                        <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.existingSubscriptionTypes.includes(option.value)}
                            onChange={() => {
                              const types = formData.existingSubscriptionTypes.includes(option.value)
                                ? formData.existingSubscriptionTypes.filter(t => t !== option.value)
                                : [...formData.existingSubscriptionTypes, option.value]
                              setFormData({ ...formData, existingSubscriptionTypes: types })
                            }}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                      {formData.existingSubscriptionTypes.length === 0 && (
                        <p className="text-sm text-slate-500">未購読</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <Label htmlFor="adminNotes">備考/メモ</Label>
                    </div>
                    <Textarea
                      id="adminNotes"
                      value={formData.adminNotes}
                      onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                      placeholder="管理者向けメモ"
                      rows={3}
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? '保存中...' : '変更を保存'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>メンバー一覧</CardTitle>
              </CardHeader>
              <CardContent>
                {organization.users.length === 0 ? (
                  <div className="py-8 text-center">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">メンバーがいません</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {organization.users.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-100 p-2 rounded-full">
                            <Users className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{member.user.name || member.user.email}</p>
                              {member.role === 'ADMIN' && (
                                <Badge variant="secondary" className="text-xs">管理者</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">{member.user.email}</p>
                          </div>
                        </div>
                        <div className="text-sm text-slate-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatDate(member.joinedAt)}から
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>招待一覧</CardTitle>
              </CardHeader>
              <CardContent>
                {organization.invitations.length === 0 ? (
                  <div className="py-8 text-center">
                    <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">招待がありません</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {organization.invitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            invitation.status === 'PENDING' ? 'bg-yellow-100' :
                            invitation.status === 'ACCEPTED' ? 'bg-green-100' : 'bg-slate-100'
                          }`}>
                            <Mail className={`h-5 w-5 ${
                              invitation.status === 'PENDING' ? 'text-yellow-600' :
                              invitation.status === 'ACCEPTED' ? 'text-green-600' : 'text-slate-600'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{invitation.email}</p>
                              <Badge variant={
                                invitation.status === 'PENDING' ? 'secondary' :
                                invitation.status === 'ACCEPTED' ? 'default' : 'outline'
                              } className="text-xs">
                                {invitation.status === 'PENDING' ? '保留中' :
                                 invitation.status === 'ACCEPTED' ? '承認済み' : '期限切れ'}
                              </Badge>
                              {invitation.role === 'ADMIN' && (
                                <Badge variant="outline" className="text-xs">管理者</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">
                              有効期限: {formatDate(invitation.expiresAt)}
                            </p>
                          </div>
                        </div>
                        {invitation.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyInviteUrl(invitation.token)}
                          >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            URLをコピー
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>購読履歴</CardTitle>
              </CardHeader>
              <CardContent>
                {organization.subscriptions.length === 0 ? (
                  <div className="py-8 text-center">
                    <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">購読履歴がありません</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {organization.subscriptions.map((subscription) => (
                      <div
                        key={subscription.id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={subscription.planType === 'EXPERT' ? 'default' : 'secondary'}>
                              {subscription.planType === 'EXPERT' ? 'エキスパート' : 'スタンダード'}
                            </Badge>
                            <Badge variant={
                              subscription.status === 'ACTIVE' ? 'default' :
                              subscription.status === 'CANCELLED' ? 'destructive' : 'outline'
                            }>
                              {subscription.status === 'ACTIVE' ? 'アクティブ' :
                               subscription.status === 'CANCELLED' ? 'キャンセル' : '期限切れ'}
                            </Badge>
                          </div>
                          <p className="font-bold">{formatPrice(subscription.finalPrice)}/月</p>
                        </div>
                        <div className="text-sm text-slate-500">
                          <p>期間: {formatDate(subscription.currentPeriodStart)} 〜 {formatDate(subscription.currentPeriodEnd)}</p>
                          <p>基本価格: {formatPrice(subscription.basePrice)} → {formatPrice(subscription.finalPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email-history" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>メール送信履歴</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEmailDialog('CONTACT')}>
                    <Send className="h-4 w-4 mr-2" />
                    新規メール
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchEmailHistory} disabled={emailHistoryLoading}>
                    <RefreshCw className={`h-4 w-4 ${emailHistoryLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {emailHistoryLoading ? (
                  <div className="py-8 text-center">
                    <p className="text-slate-500">読み込み中...</p>
                  </div>
                ) : emailHistory.length === 0 ? (
                  <div className="py-8 text-center">
                    <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">メール送信履歴がありません</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {emailHistory.map((email) => (
                      <div
                        key={email.id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {email.status === 'SENT' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <Badge variant={
                              email.templateType === 'CONTACT' ? 'secondary' :
                              email.templateType === 'RENEWAL_NOTICE' ? 'outline' : 'default'
                            }>
                              {email.templateType === 'CONTACT' ? '連絡' :
                               email.templateType === 'RENEWAL_NOTICE' ? '契約更新' : email.templateType}
                            </Badge>
                            <span className="font-medium">{email.subject}</span>
                          </div>
                          <Badge variant={email.status === 'SENT' ? 'default' : 'destructive'}>
                            {email.status === 'SENT' ? '送信済み' : '失敗'}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-500 space-y-1">
                          <p>
                            宛先: {email.recipientName || email.recipientEmail} ({email.recipientEmail})
                          </p>
                          <p>
                            送信日時: {formatDate(email.sentAt)} {new Date(email.sentAt).toLocaleTimeString('ja-JP')}
                          </p>
                          {email.metadata?.daysRemaining !== undefined && (
                            <p>残り日数: {email.metadata.daysRemaining}日</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Email Dialog */}
        <EmailSendDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          emailType={emailType}
          recipientType="ORGANIZATION"
          recipient={emailRecipient}
          onSuccess={handleEmailSuccess}
        />
      </div>
    </PremierAdminLayout>
  )
}
