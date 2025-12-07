import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Mail,
  TrendingUp,
  Clock,
  Download,
  Edit,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import AdminLayout from '@/components/layout/admin-layout'
import { useAuth } from '@/lib/auth-context'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  plan: string
  status: string
  users: number
  revenue: number
  joinedAt: string
  lastActive: string
  features: string[]
}

interface CustomerStats {
  totalCustomers: number
  customerChange: string
  activeCustomers: number
  activeRate: string
  monthlyRevenue: number
  revenueChange: string
  avgRevenue: number
}

export default function CustomersPage() {
  const router = useRouter()
  const { isLoading: authLoading, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlan, setFilterPlan] = useState('all')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomers()
    }
  }, [isAuthenticated, page, searchQuery, filterStatus, filterPlan])

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      if (searchQuery) params.append('search', searchQuery)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterPlan !== 'all') params.append('plan', filterPlan)

      const res = await fetch(`/api/admin/customers?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
        setStats(data.stats || null)
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">アクティブ</Badge>
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-700">一時停止</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">解約</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'EXPERT':
        return <Badge className="bg-purple-100 text-purple-700">エキスパート</Badge>
      case 'STANDARD':
        return <Badge className="bg-blue-100 text-blue-700">スタンダード</Badge>
      case 'STARTER':
        return <Badge className="bg-slate-100 text-slate-700">スターター</Badge>
      default:
        return <Badge>{plan}</Badge>
    }
  }

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">顧客管理</h1>
          <p className="text-slate-600">顧客情報の管理と契約状況の確認</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">総顧客数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.totalCustomers.toLocaleString() || '-'}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">{stats?.customerChange || '-'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">アクティブ顧客</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.activeCustomers.toLocaleString() || '-'}</p>
              <p className="text-xs text-slate-500 mt-1">{stats?.activeRate || '-'}% of total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">月間収益</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ¥{stats ? (stats.monthlyRevenue / 1000000).toFixed(1) + 'M' : '-'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">{stats?.revenueChange || '-'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">平均顧客単価</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ¥{stats?.avgRevenue.toLocaleString() || '-'}
              </p>
              <p className="text-xs text-slate-500 mt-1">per month</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="顧客名・メールで検索..."
                    className="pl-10 w-full sm:w-80"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="ステータス" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="active">アクティブ</SelectItem>
                    <SelectItem value="suspended">一時停止</SelectItem>
                    <SelectItem value="cancelled">解約</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPlan} onValueChange={setFilterPlan}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="プラン" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="EXPERT">エキスパート</SelectItem>
                    <SelectItem value="STANDARD">スタンダード</SelectItem>
                    <SelectItem value="STARTER">スターター</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  エクスポート
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  新規顧客追加
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>顧客名</TableHead>
                    <TableHead>プラン</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>ユーザー数</TableHead>
                    <TableHead>月間収益</TableHead>
                    <TableHead>最終アクセス</TableHead>
                    <TableHead className="text-right">アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length > 0 ? customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">{customer.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(customer.plan)}</TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span>{customer.users}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ¥{customer.revenue.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-sm">{customer.lastActive}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>アクション</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              詳細を見る
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              メール送信
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        顧客が見つかりません
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-600">
                {customers.length} 件を表示
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  前へ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  次へ
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
