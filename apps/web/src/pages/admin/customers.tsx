import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Building,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function CustomersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlan, setFilterPlan] = useState('all')

  const customers = [
    {
      id: 1,
      name: '株式会社大手リフォーム',
      email: 'admin@ohte-reform.co.jp',
      phone: '03-1234-5678',
      plan: 'ENTERPRISE',
      status: 'active',
      users: 45,
      revenue: 180000,
      joinedAt: '2023-01-15',
      lastActive: '1時間前',
      features: ['e-paper', 'training', 'online-salon', 'materials-catalog']
    },
    {
      id: 2,
      name: '田中工務店',
      email: 'tanaka@tanaka-koumuten.jp',
      phone: '045-987-6543',
      plan: 'STARTER',
      status: 'active',
      users: 3,
      revenue: 0,
      joinedAt: '2023-06-20',
      lastActive: '3日前',
      features: ['e-paper']
    },
    {
      id: 3,
      name: '山田建設株式会社',
      email: 'info@yamada-kensetsu.co.jp',
      phone: '06-2222-3333',
      plan: 'PREMIUM',
      status: 'active',
      users: 12,
      revenue: 100000,
      joinedAt: '2023-03-10',
      lastActive: '5時間前',
      features: ['e-paper', 'training', 'materials-catalog']
    },
    {
      id: 4,
      name: '佐藤リフォーム',
      email: 'sato@sato-reform.jp',
      phone: '052-444-5555',
      plan: 'PREMIUM',
      status: 'suspended',
      users: 8,
      revenue: 100000,
      joinedAt: '2022-11-05',
      lastActive: '1週間前',
      features: ['e-paper', 'training']
    },
    {
      id: 5,
      name: '高橋工業',
      email: 'takahashi@takahashi-kogyo.com',
      phone: '011-666-7777',
      plan: 'ENTERPRISE',
      status: 'active',
      users: 67,
      revenue: 200000,
      joinedAt: '2022-08-15',
      lastActive: '30分前',
      features: ['e-paper', 'training', 'online-salon', 'materials-catalog', 'analytics']
    }
  ]

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
      case 'ENTERPRISE':
        return <Badge className="bg-purple-100 text-purple-700">エンタープライズ</Badge>
      case 'PREMIUM':
        return <Badge className="bg-blue-100 text-blue-700">プレミアム</Badge>
      case 'STARTER':
        return <Badge className="bg-slate-100 text-slate-700">スターター</Badge>
      default:
        return <Badge>{plan}</Badge>
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus
    const matchesPlan = filterPlan === 'all' || customer.plan === filterPlan
    
    return matchesSearch && matchesStatus && matchesPlan
  })

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
              <p className="text-2xl font-bold">2,547</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">+12.5%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">アクティブ顧客</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">2,103</p>
              <p className="text-xs text-slate-500 mt-1">82.6% of total</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">月間収益</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">¥45.2M</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">+8.2%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">平均顧客単価</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">¥17,731</p>
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
                    <SelectItem value="ENTERPRISE">エンタープライズ</SelectItem>
                    <SelectItem value="PREMIUM">プレミアム</SelectItem>
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
                  {filteredCustomers.map((customer) => (
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
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-600">
                {filteredCustomers.length} 件中 1-{Math.min(10, filteredCustomers.length)} 件を表示
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4" />
                  前へ
                </Button>
                <Button variant="outline" size="sm">
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