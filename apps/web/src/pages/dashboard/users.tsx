import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Download,
  Upload
} from 'lucide-react'

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    seatLimit: 50,
    activeUsers: 0,
    pendingInvites: 0,
    adminCount: 0
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/dashboard/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        if (data.stats) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const roleLabels = {
    ADMIN: { label: '管理者', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    DEPARTMENT_MANAGER: { label: 'マネージャー', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    MEMBER: { label: 'メンバー', color: 'bg-slate-100 text-slate-700 border-slate-200' }
  }

  const statusLabels = {
    active: { label: 'アクティブ', icon: CheckCircle, color: 'text-green-500' },
    inactive: { label: '非アクティブ', icon: XCircle, color: 'text-slate-400' },
    pending: { label: '招待中', icon: Clock, color: 'text-yellow-500' }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">ユーザー管理</h2>
            <p className="text-slate-600">組織のメンバーを管理</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              CSVインポート
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              ユーザーを招待
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総ユーザー数</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-xs text-slate-500">ライセンス: {stats.seatLimit}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>アクティブ</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
              <p className="text-xs text-slate-500">過去30日間</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>招待中</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingInvites}</p>
              <p className="text-xs text-slate-500">返答待ち</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>管理者</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">{stats.adminCount}</p>
              <p className="text-xs text-slate-500">全権限あり</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ユーザー一覧</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSVエクスポート
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="名前、メール、部署で検索..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <select
                className="px-3 py-2 border border-slate-200 rounded-md text-sm"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">すべての役割</option>
                <option value="ADMIN">管理者</option>
                <option value="DEPARTMENT_MANAGER">マネージャー</option>
                <option value="MEMBER">メンバー</option>
              </select>
              
              <select
                className="px-3 py-2 border border-slate-200 rounded-md text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">すべてのステータス</option>
                <option value="active">アクティブ</option>
                <option value="inactive">非アクティブ</option>
                <option value="pending">招待中</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">ユーザー</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">部署</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">役割</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">ステータス</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">最終アクティブ</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">参加日</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const StatusIcon = statusLabels[user.status as keyof typeof statusLabels].icon
                    return (
                      <tr key={user.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-slate-600">
                                {user.name.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{user.department}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant="outline"
                            className={roleLabels[user.role as keyof typeof roleLabels].color}
                          >
                            {roleLabels[user.role as keyof typeof roleLabels].label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <StatusIcon 
                              className={`h-4 w-4 ${statusLabels[user.status as keyof typeof statusLabels].color}`} 
                            />
                            <span className="text-sm">
                              {statusLabels[user.status as keyof typeof statusLabels].label}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-slate-600">{user.lastActive}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-slate-600">{user.joinedDate}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">該当するユーザーが見つかりません</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}