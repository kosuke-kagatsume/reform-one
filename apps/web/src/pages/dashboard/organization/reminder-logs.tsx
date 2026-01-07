import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  MousePointerClick,
  Clock,
  Users,
  BarChart3
} from 'lucide-react'

interface ReminderLog {
  id: string
  userId: string
  emailAddress: string
  daysInactive: number
  status: string
  sentAt: string
  openedAt?: string | null
  clickedAt?: string | null
  user?: {
    id: string
    name: string | null
    email: string
  }
}

interface Stats {
  sent: number
  failed: number
  opened: number
  clicked: number
}

export default function ReminderLogsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [logs, setLogs] = useState<ReminderLog[]>([])
  const [stats, setStats] = useState<Stats>({ sent: 0, failed: 0, opened: 0, clicked: 0 })
  const [total, setTotal] = useState(0)
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    if (!isLoading && isAuthenticated && user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, user, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchLogs()
    }
  }, [isAuthenticated, user])

  const fetchLogs = async () => {
    setIsLoadingLogs(true)
    try {
      const res = await fetch('/api/organization/reminder-logs')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setLogs(data.data.logs)
          setStats(data.data.stats)
          setTotal(data.data.total)
        }
      }
    } catch (error) {
      console.error('Failed to fetch reminder logs:', error)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return (
          <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            送信済み
          </Badge>
        )
      case 'FAILED':
        return (
          <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50">
            <XCircle className="h-3 w-3 mr-1" />
            失敗
          </Badge>
        )
      case 'OPENED':
        return (
          <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50">
            <Eye className="h-3 w-3 mr-1" />
            開封済み
          </Badge>
        )
      case 'CLICKED':
        return (
          <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
            <MousePointerClick className="h-3 w-3 mr-1" />
            クリック済み
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading || isLoadingLogs) {
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

  const openRate = stats.sent > 0 ? Math.round((stats.opened / stats.sent) * 100) : 0
  const clickRate = stats.sent > 0 ? Math.round((stats.clicked / stats.sent) * 100) : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 戻るリンク */}
        <Link
          href="/dashboard/organization"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          組織設定に戻る
        </Link>

        {/* ヘッダー */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            リマインドメール送信履歴
          </h1>
          <p className="text-slate-600">
            未ログインメンバーへのリマインドメール送信記録
          </p>
        </div>

        {/* 統計 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{stats.sent}</p>
                  <p className="text-sm text-slate-600">送信成功</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700">{stats.failed}</p>
                  <p className="text-sm text-slate-600">送信失敗</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{openRate}%</p>
                  <p className="text-sm text-slate-600">開封率</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MousePointerClick className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">{clickRate}%</p>
                  <p className="text-sm text-slate-600">クリック率</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ログ一覧 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">送信履歴</CardTitle>
            <CardDescription>
              合計 {total} 件の送信記録
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="py-12 text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 mb-2">送信履歴はありません</p>
                <p className="text-sm text-slate-400">
                  リマインドメールを有効にすると、送信履歴がここに表示されます
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {logs.map((log) => (
                  <div key={log.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <Users className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {log.user?.name || log.emailAddress}
                          </p>
                          <p className="text-sm text-slate-500">{log.emailAddress}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(log.sentAt), {
                                addSuffix: true,
                                locale: ja
                              })}
                            </span>
                            <span>
                              未ログイン: {log.daysInactive}日
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(log.status)}
                        {log.openedAt && (
                          <span className="text-xs text-slate-500">
                            開封: {formatDistanceToNow(new Date(log.openedAt), {
                              addSuffix: true,
                              locale: ja
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
