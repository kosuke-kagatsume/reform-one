import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import {
  ArrowLeft,
  Users,
  Search,
  Download,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Wine,
  Building2,
  Calendar,
  MapPin,
  JapaneseYen
} from 'lucide-react'

interface SiteVisit {
  id: string
  title: string
  companyName: string | null
  location: string
  scheduledAt: string
  capacity: number
  price: number
  hasAfterParty: boolean
  afterPartyPrice: number | null
}

interface Participant {
  id: string
  userId: string
  userName: string | null
  userEmail: string | null
  organizationName: string | null
  status: string
  paymentStatus: string
  joinAfterParty: boolean
  afterPartyPaymentStatus: string
  registeredAt: string
}

export default function SiteVisitParticipantsPage() {
  const router = useRouter()
  const { id } = router.query
  const { user, isLoading, isAuthenticated } = useAuth()
  const [siteVisit, setSiteVisit] = useState<SiteVisit | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [newPaymentStatus, setNewPaymentStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN' && id) {
      fetchData()
    }
  }, [isAuthenticated, user, id])

  const fetchData = async () => {
    try {
      const [visitRes, participantsRes] = await Promise.all([
        fetch(`/api/admin/premier/site-visits/${id}`),
        fetch(`/api/admin/premier/site-visits/${id}/participants`)
      ])

      if (visitRes.ok) {
        const data = await visitRes.json()
        setSiteVisit(data)
      }

      if (participantsRes.ok) {
        const data = await participantsRes.json()
        setParticipants(data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (participant: Participant) => {
    setSelectedParticipant(participant)
    setNewStatus(participant.status)
    setNewPaymentStatus(participant.paymentStatus)
    setIsStatusDialogOpen(true)
  }

  const confirmStatusChange = async () => {
    if (!selectedParticipant) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/admin/premier/site-visits/${id}/participants/${selectedParticipant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus,
        }),
      })

      if (res.ok) {
        setIsStatusDialogOpen(false)
        setSelectedParticipant(null)
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || '更新に失敗しました')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('更新に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const exportCSV = () => {
    if (!siteVisit || participants.length === 0) return

    const headers = ['名前', 'メールアドレス', '会社名', '申込状態', '支払状態', '懇親会参加', '懇親会支払', '申込日時']
    const rows = participants.map(p => [
      p.userName || '',
      p.userEmail || '',
      p.organizationName || '',
      getStatusLabel(p.status),
      getPaymentStatusLabel(p.paymentStatus),
      p.joinAfterParty ? '参加' : '不参加',
      p.joinAfterParty ? getPaymentStatusLabel(p.afterPartyPaymentStatus) : '-',
      formatDateTime(p.registeredAt)
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${siteVisit.title}_参加者一覧.csv`
    link.click()
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return '確定'
      case 'PENDING': return '保留'
      case 'CANCELED': return 'キャンセル'
      default: return status
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return '支払済'
      case 'UNPAID': return '未払い'
      case 'REFUNDED': return '返金済'
      default: return status
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />確定</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />保留</Badge>
      case 'CANCELED':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />キャンセル</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-blue-100 text-blue-700">支払済</Badge>
      case 'UNPAID':
        return <Badge className="bg-orange-100 text-orange-700">未払い</Badge>
      case 'REFUNDED':
        return <Badge className="bg-gray-100 text-gray-700">返金済</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP').format(price)
  }

  const filteredParticipants = participants.filter(p => {
    const name = p.userName || ''
    const email = p.userEmail || ''
    const org = p.organizationName || ''
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const confirmedCount = participants.filter(p => p.status === 'CONFIRMED').length
  const paidCount = participants.filter(p => p.paymentStatus === 'PAID').length
  const afterPartyCount = participants.filter(p => p.joinAfterParty).length

  if (isLoading || loading) {
    return (
      <PremierAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </PremierAdminLayout>
    )
  }

  if (!siteVisit) {
    return (
      <PremierAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">視察会が見つかりません</p>
        </div>
      </PremierAdminLayout>
    )
  }

  return (
    <PremierAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/premier/site-visits">
              <ArrowLeft className="h-4 w-4 mr-2" />
              視察会一覧に戻る
            </Link>
          </Button>
        </div>

        {/* 視察会情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {siteVisit.title} - 参加者管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {siteVisit.companyName && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="h-4 w-4" />
                  <span>{siteVisit.companyName}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(siteVisit.scheduledAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4" />
                <span>{siteVisit.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <JapaneseYen className="h-4 w-4" />
                <span>¥{formatPrice(siteVisit.price)}</span>
                {siteVisit.hasAfterParty && siteVisit.afterPartyPrice && (
                  <span className="text-purple-600">（懇親会: ¥{formatPrice(siteVisit.afterPartyPrice)}）</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">総申込数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{participants.length} / {siteVisit.capacity}名</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">確定者数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{confirmedCount}名</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">支払済</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{paidCount}名</p>
            </CardContent>
          </Card>
          {siteVisit.hasAfterParty && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">懇親会参加</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-600">{afterPartyCount}名</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* フィルター・アクション */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="名前、メール、会社名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="all">すべてのステータス</option>
              <option value="CONFIRMED">確定</option>
              <option value="PENDING">保留</option>
              <option value="CANCELED">キャンセル</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV} disabled={participants.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              CSV出力
            </Button>
          </div>
        </div>

        {/* 参加者一覧 */}
        <Card>
          <CardContent className="p-0">
            {filteredParticipants.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">参加者がいません</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>会社名</TableHead>
                    <TableHead>メール</TableHead>
                    <TableHead>申込状態</TableHead>
                    <TableHead>支払状態</TableHead>
                    {siteVisit.hasAfterParty && (
                      <>
                        <TableHead>懇親会</TableHead>
                        <TableHead>懇親会支払</TableHead>
                      </>
                    )}
                    <TableHead>申込日時</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">
                        {participant.userName || '-'}
                      </TableCell>
                      <TableCell>
                        {participant.organizationName || '-'}
                      </TableCell>
                      <TableCell>
                        {participant.userEmail ? (
                          <a
                            href={`mailto:${participant.userEmail}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {participant.userEmail}
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(participant.status)}</TableCell>
                      <TableCell>{getPaymentBadge(participant.paymentStatus)}</TableCell>
                      {siteVisit.hasAfterParty && (
                        <>
                          <TableCell>
                            {participant.joinAfterParty ? (
                              <Badge className="bg-purple-100 text-purple-700">
                                <Wine className="h-3 w-3 mr-1" />
                                参加
                              </Badge>
                            ) : (
                              <Badge variant="outline">不参加</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {participant.joinAfterParty ? getPaymentBadge(participant.afterPartyPaymentStatus) : '-'}
                          </TableCell>
                        </>
                      )}
                      <TableCell className="text-slate-500 text-sm">
                        {formatDateTime(participant.registeredAt)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleStatusChange(participant)}>
                          編集
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ステータス変更ダイアログ */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>参加者ステータスを変更</DialogTitle>
              <DialogDescription>
                {selectedParticipant?.userName || '参加者'} のステータスを変更します
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">申込状態</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONFIRMED">確定</SelectItem>
                    <SelectItem value="PENDING">保留</SelectItem>
                    <SelectItem value="CANCELED">キャンセル</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">支払状態</label>
                <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">支払済</SelectItem>
                    <SelectItem value="UNPAID">未払い</SelectItem>
                    <SelectItem value="REFUNDED">返金済</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                キャンセル
              </Button>
              <Button type="button" onClick={confirmStatusChange} disabled={submitting}>
                {submitting ? '更新中...' : '更新'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PremierAdminLayout>
  )
}
