import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { FileText, RefreshCw, ChevronLeft, ChevronRight, RotateCcw, AlertCircle } from 'lucide-react'

// A-6: ロールバック可能な操作のリスト
const ROLLBACKABLE_ACTIONS = [
  'online_site_visit.update',
  'online_site_visit.delete',
  'site_visit.update',
  'site_visit.delete',
  'seminar.update',
  'archive.update',
  'digital_newspaper_edition.update',
  'digital_newspaper_edition.delete'
]

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
  const [rollbackingId, setRollbackingId] = useState<string | null>(null)
  const [rollbackMessage, setRollbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const limit = 50

  // A-6: ロールバック可能かどうかをチェック
  const canRollback = (action: string, metadata: Record<string, unknown> | null) => {
    if (!ROLLBACKABLE_ACTIONS.includes(action)) return false
    // update操作の場合、beforeデータが必要
    if (action.endsWith('.update')) {
      return metadata && 'before' in metadata
    }
    // delete操作の場合は常にロールバック可能（isCanceledをfalseに戻す）
    return action.endsWith('.delete')
  }

  // A-6: ロールバック実行
  const handleRollback = async (logId: string) => {
    if (!confirm('この操作をロールバックしますか？')) return

    setRollbackingId(logId)
    setRollbackMessage(null)

    try {
      const res = await fetch('/api/admin/premier/audit-log/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId })
      })

      const data = await res.json()

      if (res.ok) {
        setRollbackMessage({ type: 'success', text: data.message || 'ロールバックしました' })
        fetchLogs() // ログを再読み込み
      } else {
        setRollbackMessage({ type: 'error', text: data.message || 'ロールバックに失敗しました' })
      }
    } catch {
      setRollbackMessage({ type: 'error', text: 'エラーが発生しました' })
    } finally {
      setRollbackingId(null)
    }
  }

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

        {/* A-6: ロールバックメッセージ */}
        {rollbackMessage && (
          <div className={`p-4 rounded-lg flex items-center gap-2 ${
            rollbackMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {rollbackMessage.type === 'error' && <AlertCircle className="h-4 w-4" />}
            <span>{rollbackMessage.text}</span>
            <button
              onClick={() => setRollbackMessage(null)}
              className="ml-auto text-sm underline"
            >
              閉じる
            </button>
          </div>
        )}

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
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </span>
                      {/* A-6: ロールバックボタン */}
                      {canRollback(log.action, log.metadata) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRollback(log.id)}
                          disabled={rollbackingId === log.id}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          title="この操作をロールバック"
                        >
                          <RotateCcw className={`h-4 w-4 ${rollbackingId === log.id ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                    </div>
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
