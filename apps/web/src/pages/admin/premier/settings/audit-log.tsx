import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { FileText, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

interface AuditLogEntry {
  id: string
  userId: string | null
  action: string
  resource: string | null
  metadata: Record<string, unknown> | null
  timestamp: string
  user: {
    id: string
    name: string | null
    email: string
  } | null
}

export default function AuditLogPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [filterAction, setFilterAction] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const limit = 50

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login')
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) fetchLogs()
  }, [isAuthenticated, isReformCompany, page, filterAction, filterStartDate, filterEndDate])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', String(limit))
      params.set('offset', String(page * limit))
      if (filterAction) params.set('action', filterAction)
      if (filterStartDate) params.set('startDate', filterStartDate)
      if (filterEndDate) params.set('endDate', filterEndDate)

      const res = await fetch(`/api/admin/premier/audit-log?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Failed to fetch audit log:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPages = Math.ceil(total / limit)

  if (isLoading) {
    return (
      <PremierAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </PremierAdminLayout>
    )
  }

  return (
    <PremierAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">操作ログ</h1>
            <p className="text-slate-600">管理者の操作履歴（{total}件）</p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="操作種別でフィルタ（例: CREATE_ADMIN_USER）"
                  value={filterAction}
                  onChange={(e) => { setFilterAction(e.target.value); setPage(0) }}
                />
              </div>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => { setFilterStartDate(e.target.value); setPage(0) }}
                className="w-40"
              />
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => { setFilterEndDate(e.target.value); setPage(0) }}
                className="w-40"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              操作履歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-slate-500">読み込み中...</div>
            ) : logs.length === 0 ? (
              <div className="py-8 text-center">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">操作ログがありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map(log => (
                  <div key={log.id} className="flex items-start justify-between p-3 border rounded-lg text-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{log.action}</Badge>
                        {log.resource && <Badge variant="secondary">{log.resource}</Badge>}
                      </div>
                      <p className="text-slate-600">
                        {log.user ? (log.user.name || log.user.email) : '不明なユーザー'}
                      </p>
                      {log.metadata && (
                        <p className="text-xs text-slate-400 mt-1">
                          {JSON.stringify(log.metadata).substring(0, 200)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  前へ
                </Button>
                <span className="text-sm text-slate-500">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
                  次へ
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PremierAdminLayout>
  )
}
