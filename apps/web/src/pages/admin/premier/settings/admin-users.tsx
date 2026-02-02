import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import { ADMIN_PERMISSION_LABELS, type AdminPermissionLevel } from '@/types/premier'
import { Users, Plus, Shield, Trash2, Clock } from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  name: string | null
  adminPermissionLevel: string | null
  lastLoginAt: string | null
  status: string
  createdAt: string
  role: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ email: '', name: '', adminPermissionLevel: 'VIEW' })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login')
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) fetchUsers()
  }, [isAuthenticated, isReformCompany])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/premier/admin-users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch admin users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.email) return

    try {
      const res = await fetch('/api/admin/premier/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setDialogOpen(false)
        setFormData({ email: '', name: '', adminPermissionLevel: 'VIEW' })
        fetchUsers()
      } else {
        const data = await res.json()
        alert(data.error || '作成に失敗しました')
      }
    } catch (error) {
      alert('作成に失敗しました')
    }
  }

  const handleUpdatePermission = async (userId: string, level: string) => {
    try {
      await fetch('/api/admin/premier/admin-users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, adminPermissionLevel: level })
      })
      fetchUsers()
    } catch (error) {
      console.error('Failed to update permission:', error)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('この管理者のアクセス権を削除しますか？')) return

    try {
      await fetch('/api/admin/premier/admin-users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete admin user:', error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未ログイン'
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPermissionBadge = (level: string | null) => {
    switch (level) {
      case 'FULL':
        return <Badge className="bg-red-100 text-red-700">フルアクセス</Badge>
      case 'EDIT':
        return <Badge className="bg-blue-100 text-blue-700">編集</Badge>
      case 'VIEW':
        return <Badge className="bg-green-100 text-green-700">閲覧のみ</Badge>
      default:
        return <Badge variant="secondary">未設定</Badge>
    }
  }

  if (isLoading || loading) {
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
            <h1 className="text-2xl font-bold">管理者アカウント管理</h1>
            <p className="text-slate-600">管理画面にアクセスできるスタッフを管理</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            管理者を追加
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              管理者一覧
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">管理者がいません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name || user.email}</p>
                          {getPermissionBadge(user.adminPermissionLevel)}
                        </div>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          最終ログイン: {formatDate(user.lastLoginAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={user.adminPermissionLevel || 'VIEW'}
                        onChange={(e) => handleUpdatePermission(user.id, e.target.value)}
                        className="px-2 py-1 text-sm border rounded"
                      >
                        <option value="VIEW">閲覧のみ</option>
                        <option value="EDIT">編集</option>
                        <option value="FULL">フルアクセス</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>管理者を追加</DialogTitle>
              <DialogDescription>新しい管理者アカウントを作成します</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>メールアドレス *</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@the-reform.co.jp"
                />
              </div>
              <div className="space-y-2">
                <Label>名前</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="山田 太郎"
                />
              </div>
              <div className="space-y-2">
                <Label>権限レベル</Label>
                <select
                  value={formData.adminPermissionLevel}
                  onChange={(e) => setFormData({ ...formData, adminPermissionLevel: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="VIEW">閲覧のみ（データ閲覧）</option>
                  <option value="EDIT">編集（データ作成・編集）</option>
                  <option value="FULL">フルアクセス（管理者設定含む）</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>キャンセル</Button>
              <Button onClick={handleCreate}>追加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PremierAdminLayout>
  )
}
