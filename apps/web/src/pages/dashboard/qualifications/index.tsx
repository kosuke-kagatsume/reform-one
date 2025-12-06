import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth-context'
import {
  GraduationCap,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  Calendar
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

const statusLabels: Record<string, { label: string; color: string }> = {
  ENROLLED: { label: '受講中', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: '学習中', color: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: '修了', color: 'bg-green-100 text-green-700' },
  EXPIRED: { label: '期限切れ', color: 'bg-red-100 text-red-700' },
}

export default function QualificationsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchQualifications()
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

  const handleEnroll = async (qualificationId: string) => {
    setEnrolling(qualificationId)
    try {
      const res = await fetch(`/api/qualifications/${qualificationId}/enroll`, {
        method: 'POST',
      })

      if (res.ok) {
        fetchQualifications()
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

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  const enrolledQualifications = qualifications.filter(q => q.enrollment)
  const availableQualifications = qualifications.filter(q => !q.enrollment && q.isActive)
  const completedCount = enrolledQualifications.filter(q => q.enrollment?.status === 'COMPLETED').length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">資格・研修</h1>
          <p className="text-slate-600">専門資格の取得・研修プログラム</p>
        </div>

        {/* 進捗サマリー */}
        {enrolledQualifications.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">学習進捗</h3>
                    <p className="text-sm text-blue-700">
                      {completedCount} / {enrolledQualifications.length} 資格を修了
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-blue-600">
                    {Math.round((completedCount / enrolledQualifications.length) * 100)}%
                  </span>
                </div>
              </div>
              <Progress
                value={(completedCount / enrolledQualifications.length) * 100}
                className="h-2"
              />
            </CardContent>
          </Card>
        )}

        {/* 受講中の資格 */}
        {enrolledQualifications.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">受講中の資格</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledQualifications.map((qualification) => {
                const status = statusLabels[qualification.enrollment?.status || 'ENROLLED']

                return (
                  <Card key={qualification.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <GraduationCap className="h-6 w-6 text-indigo-600" />
                        </div>
                        <Badge className={status.color}>
                          {qualification.enrollment?.status === 'COMPLETED' && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {status.label}
                        </Badge>
                      </div>
                      <CardTitle className="text-base mt-3">
                        {qualification.name}
                      </CardTitle>
                      <CardDescription>
                        コード: {qualification.code}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {qualification.description && (
                        <p className="text-sm text-slate-600 mb-4">
                          {qualification.description}
                        </p>
                      )}

                      <div className="space-y-2 text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            登録日: {formatDate(qualification.enrollment!.enrolledAt)}
                          </span>
                        </div>
                        {qualification.enrollment?.completedAt && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>
                              修了日: {formatDate(qualification.enrollment.completedAt)}
                            </span>
                          </div>
                        )}
                        {qualification.enrollment?.expiresAt && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              有効期限: {formatDate(qualification.enrollment.expiresAt)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {qualification.enrollment?.status === 'COMPLETED' && qualification.enrollment?.certificateUrl ? (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(qualification.enrollment!.certificateUrl!, '_blank')}
                          >
                            <Award className="h-4 w-4 mr-2" />
                            修了証を見る
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1"
                            variant={qualification.enrollment?.status === 'COMPLETED' ? 'outline' : 'default'}
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            学習を続ける
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* 受講可能な資格 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">受講可能な資格</h2>
          {availableQualifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">現在受講可能な資格はありません</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableQualifications.map((qualification) => (
                <Card key={qualification.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="p-2 bg-slate-100 rounded-lg w-fit">
                      <GraduationCap className="h-6 w-6 text-slate-600" />
                    </div>
                    <CardTitle className="text-base mt-3">
                      {qualification.name}
                    </CardTitle>
                    <CardDescription>
                      コード: {qualification.code}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {qualification.description && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                        {qualification.description}
                      </p>
                    )}

                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleEnroll(qualification.id)}
                      disabled={enrolling === qualification.id}
                    >
                      {enrolling === qualification.id ? (
                        '処理中...'
                      ) : (
                        <>
                          受講を申し込む
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
