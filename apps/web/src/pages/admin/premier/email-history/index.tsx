import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { Mail, RefreshCw, CheckCircle, XCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react'

interface EmailHistoryItem {
  id: string
  templateType: string
  recipientEmail: string
  recipientName: string | null
  recipientType: string
  recipientId: string | null
  subject: string
  status: string
  sentAt: string
  metadata: Record<string, unknown> | null
}

export default function EmailHistoryPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [history, setHistory] = useState<EmailHistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [filterType, setFilterType] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const limit = 50

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login')
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) fetchHistory()
  }, [isAuthenticated, isReformCompany, page, filterType])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('limit', String(limit))
      params.set('offset', String(page * limit))
      if (filterType) params.set('templateType', filterType)

      const res = await fetch(`/api/admin/premier/email/history?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data.history)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Failed to fetch email history:', error)
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

  const getTypeBadge = (type: string) => {
    const labels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      CONTACT: { label: '連絡', variant: 'secondary' },
      RENEWAL_NOTICE: { label: '契約更新', variant: 'outline' },
      USAGE_PROMOTION: { label: '利用促進', variant: 'default' },
      BULK_MAIL: { label: '一斉メール', variant: 'default' },
      SEMINAR_NOTIFICATION: { label: 'セミナー告知', variant: 'secondary' },
      COMMUNITY_POST: { label: 'コミュニティ', variant: 'secondary' },
    }
    const config = labels[type] || { label: type, variant: 'outline' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredHistory = searchQuery
    ? history.filter(h =>
        h.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.recipientName || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : history

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
            <h1 className="text-2xl font-bold">メール送信履歴</h1>
            <p className="text-slate-600">全体のメール送信履歴（{total}件）</p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchHistory} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="宛先・件名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setPage(0) }}
                className="px-3 py-2 border rounded-md bg-white w-[180px]"
              >
                <option value="">すべての種別</option>
                <option value="CONTACT">連絡</option>
                <option value="RENEWAL_NOTICE">契約更新</option>
                <option value="USAGE_PROMOTION">利用促進</option>
                <option value="BULK_MAIL">一斉メール</option>
                <option value="SEMINAR_NOTIFICATION">セミナー告知</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              送信履歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-slate-500">読み込み中...</div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-8 text-center">
                <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">送信履歴がありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map(email => (
                  <div key={email.id} className="flex items-start justify-between p-3 border rounded-lg text-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {email.status === 'SENT' ? (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        )}
                        {getTypeBadge(email.templateType)}
                        <span className="font-medium truncate">{email.subject}</span>
                      </div>
                      <p className="text-slate-500">
                        宛先: {email.recipientName || email.recipientEmail} ({email.recipientEmail})
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <Badge variant={email.status === 'SENT' ? 'default' : 'destructive'} className="text-xs">
                        {email.status === 'SENT' ? '送信済み' : '失敗'}
                      </Badge>
                      <p className="text-xs text-slate-400 mt-1">{formatDate(email.sentAt)}</p>
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
                <span className="text-sm text-slate-500">{page + 1} / {totalPages}</span>
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
