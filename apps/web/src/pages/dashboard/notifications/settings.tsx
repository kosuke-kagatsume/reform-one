import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import {
  Bell,
  Mail,
  Smartphone,
  Calendar,
  Video,
  FileText,
  MessageSquare,
  Building2,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Info
} from 'lucide-react'

interface NotificationPreference {
  seminarEmail: boolean
  seminarInApp: boolean
  archiveEmail: boolean
  archiveInApp: boolean
  databookEmail: boolean
  databookInApp: boolean
  newsletterEmail: boolean
  newsletterInApp: boolean
  communityEmail: boolean
  communityInApp: boolean
  siteVisitEmail: boolean
  siteVisitInApp: boolean
  systemEmail: boolean
  systemInApp: boolean
}

const defaultPreference: NotificationPreference = {
  seminarEmail: true,
  seminarInApp: true,
  archiveEmail: true,
  archiveInApp: true,
  databookEmail: true,
  databookInApp: true,
  newsletterEmail: true,
  newsletterInApp: true,
  communityEmail: true,
  communityInApp: true,
  siteVisitEmail: true,
  siteVisitInApp: true,
  systemEmail: true,
  systemInApp: true
}

const notificationCategories = [
  {
    id: 'seminar',
    label: 'セミナー',
    description: '新規セミナーの案内・リマインダー',
    icon: Calendar,
    color: 'text-green-600',
    emailKey: 'seminarEmail' as keyof NotificationPreference,
    inAppKey: 'seminarInApp' as keyof NotificationPreference
  },
  {
    id: 'archive',
    label: 'アーカイブ',
    description: '新着動画の追加通知',
    icon: Video,
    color: 'text-purple-600',
    emailKey: 'archiveEmail' as keyof NotificationPreference,
    inAppKey: 'archiveInApp' as keyof NotificationPreference
  },
  {
    id: 'databook',
    label: 'データブック',
    description: '新着データブックの配信',
    icon: FileText,
    color: 'text-indigo-600',
    emailKey: 'databookEmail' as keyof NotificationPreference,
    inAppKey: 'databookInApp' as keyof NotificationPreference
  },
  {
    id: 'newsletter',
    label: 'ニュースレター',
    description: '経営レポート・業界情報の配信',
    icon: Mail,
    color: 'text-pink-600',
    emailKey: 'newsletterEmail' as keyof NotificationPreference,
    inAppKey: 'newsletterInApp' as keyof NotificationPreference
  },
  {
    id: 'community',
    label: 'コミュニティ',
    description: '定例会・投稿の通知',
    icon: MessageSquare,
    color: 'text-cyan-600',
    emailKey: 'communityEmail' as keyof NotificationPreference,
    inAppKey: 'communityInApp' as keyof NotificationPreference
  },
  {
    id: 'siteVisit',
    label: '視察会',
    description: '視察会の募集・リマインダー',
    icon: Building2,
    color: 'text-amber-600',
    emailKey: 'siteVisitEmail' as keyof NotificationPreference,
    inAppKey: 'siteVisitInApp' as keyof NotificationPreference
  },
  {
    id: 'system',
    label: 'システム通知',
    description: '重要なお知らせ・メンテナンス情報',
    icon: AlertCircle,
    color: 'text-blue-600',
    emailKey: 'systemEmail' as keyof NotificationPreference,
    inAppKey: 'systemInApp' as keyof NotificationPreference,
    required: true
  }
]

export default function NotificationSettingsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [preference, setPreference] = useState<NotificationPreference>(defaultPreference)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isLoadingPreference, setIsLoadingPreference] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user?.id) {
      fetchPreference()
    }
  }, [user?.id])

  const fetchPreference = async () => {
    if (!user?.id) return

    setIsLoadingPreference(true)
    try {
      const res = await fetch(`/api/notifications/preference?userId=${user.id}`)
      const data = await res.json()
      if (data.success && data.data) {
        setPreference(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch preference:', error)
    } finally {
      setIsLoadingPreference(false)
    }
  }

  const handleToggle = (key: keyof NotificationPreference) => {
    setPreference(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    if (!user?.id) return

    setIsSaving(true)
    try {
      const res = await fetch('/api/notifications/preference', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...preference })
      })

      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save preference:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || isLoadingPreference) {
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
        {/* 戻るリンク */}
        <Link
          href="/dashboard/notifications"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          通知一覧に戻る
        </Link>

        {/* ヘッダー */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            通知設定
          </h1>
          <p className="text-slate-600">
            通知の受け取り方法をカスタマイズできます
          </p>
        </div>

        {/* 説明 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">通知方法について</p>
                <ul className="space-y-1 text-blue-700">
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>メール通知: 登録メールアドレスに配信されます</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span>アプリ内通知: ヘッダーのベルアイコンに表示されます</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 設定カード */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">通知カテゴリ</CardTitle>
            <CardDescription>
              カテゴリごとに通知のON/OFFを切り替えられます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {notificationCategories.map((category) => {
                const Icon = category.icon
                return (
                  <div key={category.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-slate-100 ${category.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {category.label}
                            {category.required && (
                              <span className="text-xs text-slate-500">（必須）</span>
                            )}
                          </p>
                          <p className="text-sm text-slate-500">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <Switch
                            checked={preference[category.emailKey]}
                            onCheckedChange={() => handleToggle(category.emailKey)}
                            disabled={category.required}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-slate-400" />
                          <Switch
                            checked={preference[category.inAppKey]}
                            onCheckedChange={() => handleToggle(category.inAppKey)}
                            disabled={category.required}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 保存ボタン */}
        <div className="flex items-center justify-between">
          {saveSuccess && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              設定を保存しました
            </p>
          )}
          <div className="ml-auto">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? '保存中...' : '設定を保存'}
            </Button>
          </div>
        </div>

        {/* 注意事項 */}
        <Card className="bg-slate-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p>
                  システム通知（重要なお知らせ・メンテナンス情報）は、サービス運営上必要なため、
                  オフにすることができません。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
