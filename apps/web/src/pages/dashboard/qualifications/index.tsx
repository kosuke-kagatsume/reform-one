import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import {
  GraduationCap,
  CheckCircle,
  Clock,
  Award,
  ArrowRight,
  Calendar,
  Users,
  Info,
  ExternalLink,
  RefreshCw,
  Building2,
  Mail
} from 'lucide-react'

interface Qualification {
  id: string
  name: string
  code: string
  description: string | null
  isActive: boolean
  enrollment?: {
    id: string
    status: string
    enrolledAt: string
    completedAt: string | null
    expiresAt: string | null
    certificateUrl: string | null
  } | null
}

interface QualificationStats {
  freeSlotUsed: number
  freeSlotTotal: number
  completedCount: number
  enrolledCount: number
  resetDate: string | null
}

const statusLabels: Record<string, { label: string; color: string }> = {
  ENROLLED: { label: '受講中', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: '学習中', color: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: '修了', color: 'bg-green-100 text-green-700' },
  EXPIRED: { label: '期限切れ', color: 'bg-red-100 text-red-700' },
}

// メイン資格情報（9-1）
const MAIN_QUALIFICATION = {
  name: '全国住宅リフォーム取扱主任者（2級）認定講座',
  target: 'リフォーム営業・現場管理者向け',
  duration: '約3ヶ月（オンライン）',
  standardPrice: 15000,
  expertFreeSlots: 1,
}

export default function QualificationsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, planType, isAdmin } = useAuth()
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [stats, setStats] = useState<QualificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [completedMembers, setCompletedMembers] = useState<{ name: string; completedAt: string }[]>([])

  const isExpert = planType === 'expert'

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchQualifications()
      fetchStats()
      fetchCompletedMembers()
    }
  }, [isAuthenticated])

  const fetchQualifications = async () => {
    try {
      const res = await fetch('/api/qualifications')
      if (res.ok) {
        const data = await res.json()
        setQualifications(data)
      }
    } catch (error) {
      console.error('Failed to fetch qualifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/qualifications/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
      // デモ用ダミーデータ
      setStats({
        freeSlotUsed: 0,
        freeSlotTotal: isExpert ? 1 : 0,
        completedCount: 3,
        enrolledCount: 1,
        resetDate: '2027-04-01',
      })
    }
  }

  const fetchCompletedMembers = async () => {
    try {
      const res = await fetch('/api/qualifications/completed')
      if (res.ok) {
        const data = await res.json()
        setCompletedMembers(data)
      }
    } catch {
      // デモ用ダミーデータ
      setCompletedMembers([
        { name: '山田太郎', completedAt: '2025-12-15' },
        { name: '鈴木花子', completedAt: '2025-10-20' },
        { name: '佐藤一郎', completedAt: '2025-08-10' },
      ])
    }
  }

  const handleEnroll = async (qualificationId: string, useFreeSlot: boolean) => {
    setEnrolling(qualificationId)
    try {
      const res = await fetch(`/api/qualifications/${qualificationId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useFreeSlot }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.checkoutUrl) {
          // Stripe決済へリダイレクト
          window.location.href = data.checkoutUrl
        } else {
          // 無料枠使用の場合
          fetchQualifications()
          fetchStats()
          alert('申込が完了しました。センリョクから受講案内メールが届きます。')
        }
      } else {
        const error = await res.json()
        alert(error.error || '登録に失敗しました')
      }
    } catch (error) {
      console.error('Failed to enroll:', error)
      alert('登録に失敗しました')
    } finally {
      setEnrolling(null)
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP').format(price)
  }

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  // メイン資格を取得（または最初の有効な資格）
  const mainQualification = qualifications.find(q => q.isActive) || qualifications[0]
  const hasEnrollment = mainQualification?.enrollment
  const enrollmentStatus = hasEnrollment ? statusLabels[mainQualification.enrollment!.status] : null

  // 無料枠の状態（9-4）
  const hasFreeSlot = isExpert && stats && stats.freeSlotUsed < stats.freeSlotTotal
  const freeSlotStatus = stats ? `${stats.freeSlotTotal - stats.freeSlotUsed}/${stats.freeSlotTotal}名` : '0/0名'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* タイトル（9-1, 9-7: 研修ワード削除） */}
        <div>
          <h1 className="text-2xl font-bold">資格｜{MAIN_QUALIFICATION.name}</h1>
          <p className="text-slate-600">
            リフォーム業界の専門資格を取得して、キャリアアップを目指しましょう
          </p>
        </div>

        {/* 管理者向けサマリー */}
        {isAdmin && stats && (
          <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>
                      受講中: <span className="font-medium text-blue-700">{stats.enrolledCount}名</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span>
                      修了者: <span className="font-medium text-blue-700">{stats.completedCount}名</span>
                    </span>
                  </div>
                  {isExpert && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      <span>
                        無料枠: <span className={`font-medium ${hasFreeSlot ? 'text-green-600' : 'text-slate-500'}`}>
                          {freeSlotStatus}
                        </span>
                        {hasFreeSlot ? '（未使用）' : '（使用済）'}
                      </span>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  社員に案内
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* メイン資格カード（9-2, 9-3: 空状態廃止、常設） */}
        <Card className="overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* 左: 資格情報 */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <GraduationCap className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{MAIN_QUALIFICATION.name}</h2>
                    <p className="text-sm text-slate-600">{MAIN_QUALIFICATION.target}</p>
                  </div>
                </div>
                {hasEnrollment && enrollmentStatus && (
                  <Badge className={enrollmentStatus.color}>
                    {hasEnrollment && mainQualification.enrollment?.status === 'COMPLETED' && (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    )}
                    {enrollmentStatus.label}
                  </Badge>
                )}
              </div>

              <p className="text-slate-600 mb-6">
                リフォーム業界で必要な知識とスキルを体系的に学べる認定講座です。
                オンラインで受講可能、修了後は認定証が発行されます。
              </p>

              {/* 詳細情報 */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>受講期間: {MAIN_QUALIFICATION.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span>運営: センリョク</span>
                </div>
              </div>

              {/* 受講状況表示 */}
              {hasEnrollment && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium mb-3">受講状況</h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>申込日: {formatDate(mainQualification.enrollment!.enrolledAt)}</span>
                    </div>
                    {mainQualification.enrollment?.completedAt && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>修了日: {formatDate(mainQualification.enrollment.completedAt)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      受講ページへ
                    </Button>
                    {mainQualification.enrollment?.certificateUrl && (
                      <Button size="sm" variant="outline">
                        <Award className="h-4 w-4 mr-2" />
                        認定証
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 右: 料金・申込（9-3, 9-4, 9-5） */}
            <div className="lg:w-80 bg-slate-50 p-6 border-t lg:border-t-0 lg:border-l">
              <h3 className="font-semibold mb-4">料金プラン</h3>

              {/* プラン別料金表示 */}
              <div className="space-y-3 mb-6">
                <div className={`p-3 rounded-lg ${isExpert ? 'bg-green-100 border-2 border-green-300' : 'bg-white border'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge className="bg-green-600">エキスパート</Badge>
                    {isExpert && <span className="text-xs text-green-600">あなたのプラン</span>}
                  </div>
                  <p className="text-lg font-bold text-green-700">年1名無料</p>
                  <p className="text-xs text-slate-600">追加受講: ¥{formatPrice(MAIN_QUALIFICATION.standardPrice)}/人</p>
                </div>

                <div className={`p-3 rounded-lg ${!isExpert ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white border'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline">スタンダード</Badge>
                    {!isExpert && <span className="text-xs text-blue-600">あなたのプラン</span>}
                  </div>
                  <p className="text-lg font-bold text-slate-700">¥{formatPrice(MAIN_QUALIFICATION.standardPrice)}/人</p>
                </div>
              </div>

              {/* 無料枠ステータス（9-4） */}
              {isExpert && stats && (
                <div className={`p-3 rounded-lg mb-6 ${hasFreeSlot ? 'bg-green-50 border border-green-200' : 'bg-slate-100 border border-slate-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className={`h-4 w-4 ${hasFreeSlot ? 'text-green-600' : 'text-slate-500'}`} />
                    <span className="font-medium text-sm">無料枠</span>
                  </div>
                  <p className={`text-2xl font-bold ${hasFreeSlot ? 'text-green-600' : 'text-slate-500'}`}>
                    {freeSlotStatus}
                  </p>
                  <p className="text-xs text-slate-600">
                    {hasFreeSlot ? '未使用' : '使用済み'}
                  </p>
                </div>
              )}

              {/* 受講ボタン（9-5） */}
              {!hasEnrollment && mainQualification && (
                <div className="space-y-3">
                  {isExpert && hasFreeSlot ? (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleEnroll(mainQualification.id, true)}
                      disabled={enrolling === mainQualification.id}
                    >
                      {enrolling === mainQualification.id ? '処理中...' : (
                        <>
                          無料枠で申し込む
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleEnroll(mainQualification.id, false)}
                      disabled={enrolling === mainQualification.id}
                    >
                      {enrolling === mainQualification.id ? '処理中...' : (
                        <>
                          {isExpert ? '追加受講を申し込む' : '受講を申し込む'}
                          （¥{formatPrice(MAIN_QUALIFICATION.standardPrice)}）
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {/* リセット日表示（9-6） */}
              {isExpert && stats?.resetDate && (
                <div className="mt-4 pt-4 border-t text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                    <RefreshCw className="h-4 w-4" />
                    <span>次回リセット: {formatDate(stats.resetDate)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    契約更新日に無料枠がリセットされます
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* センリョク連携説明（9-8） */}
        <Card className="bg-amber-50/50 border-amber-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">受講の流れ</p>
                <ol className="list-decimal list-inside space-y-1 text-amber-700">
                  <li>このページから申込（無料枠または決済）</li>
                  <li>運営元「センリョク」から受講案内メールが届きます</li>
                  <li>メールの案内に従ってオンライン受講開始</li>
                  <li>修了後、認定証が発行されます</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 修了者一覧（9-9） */}
        {completedMembers.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">修了者一覧</h2>
            <Card>
              <CardContent className="py-4">
                <div className="divide-y">
                  {completedMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Award className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                      <div className="text-sm text-slate-600">
                        {formatDate(member.completedAt)} 修了
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 注意事項 */}
        <Card className="bg-slate-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-slate-500 mt-0.5" />
              <div className="text-sm text-slate-600">
                <p className="font-medium mb-1">ご注意</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>エキスパートプランの無料枠は契約更新日にリセットされます</li>
                  <li>受講開始後のキャンセル・返金はできません</li>
                  <li>認定証の有効期限は修了日から3年間です</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
