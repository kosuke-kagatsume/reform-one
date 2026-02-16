import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import {
  Users,
  UserPlus,
  Mail,
  Calendar,
  Activity,
  MoreVertical,
  Trash2,
  ShieldCheck,
  Clock,
  XCircle,
  Eye,
  Search,
  Crown,
  AlertCircle,
  CheckCircle2,
  Video,
  FileText,
  MessageSquare,
  ArrowUpDown,
  Send
} from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Member {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  createdAt: string
  lastActivityAt?: string | null
  _count: {
    activities: number
  }
  // 利用カテゴリ（セミナー、アーカイブ、コミュニティ等）
  usageCategories?: string[]
}

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  expiresAt: string
  createdAt: string
}

type SortKey = 'name' | 'lastActivity' | 'createdAt'
type FilterRole = 'all' | 'ADMIN' | 'MEMBER'
type FilterStatus = 'all' | 'active' | 'inactive'

export default function MembersPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<FilterRole>('all')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [sortKey, setSortKey] = useState<SortKey>('lastActivity')
  const [sortAsc, setSortAsc] = useState(false)

  // Invite dialog state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Reminder dialog state
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [memberToRemind, setMemberToRemind] = useState<Member | null>(null)
  const [sendingReminder, setSendingReminder] = useState(false)

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
      fetchMembers()
    }
  }, [isAuthenticated, user])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members')
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members)
        setInvitations(data.invitations || [])
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !user) return

    setInviting(true)
    setInviteError('')
    setInviteSuccess('')

    try {
      const res = await fetch('/api/members/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          invitedBy: user.id,
          orgId: user.organization.id
        })
      })

      const data = await res.json()

      if (res.ok) {
        setInviteSuccess(`${inviteEmail} に招待メールを送信しました`)
        setInviteEmail('')
        fetchMembers()
        setTimeout(() => {
          setInviteDialogOpen(false)
          setInviteSuccess('')
        }, 2000)
      } else {
        setInviteError(data.error || '招待の送信に失敗しました')
      }
    } catch (error) {
      setInviteError('招待の送信に失敗しました')
    } finally {
      setInviting(false)
    }
  }

  const handleDeleteMember = async () => {
    if (!memberToDelete) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/members/${memberToDelete.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMembers(members.filter(m => m.id !== memberToDelete.id))
        setDeleteDialogOpen(false)
        setMemberToDelete(null)
      }
    } catch (error) {
      console.error('Failed to delete member:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleSendReminder = async () => {
    if (!memberToRemind) return

    setSendingReminder(true)
    try {
      const res = await fetch('/api/members/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: memberToRemind.id })
      })

      if (res.ok) {
        setReminderDialogOpen(false)
        setMemberToRemind(null)
        // TODO: 成功トースト表示
      }
    } catch (error) {
      console.error('Failed to send reminder:', error)
    } finally {
      setSendingReminder(false)
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

  const formatRelativeDate = (dateString: string | null | undefined) => {
    if (!dateString) return '未利用'
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`
    return `${Math.floor(diffDays / 30)}ヶ月前`
  }

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  const isInactive = (member: Member) => {
    if (!member.lastActivityAt) return true
    const lastActivity = new Date(member.lastActivityAt)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return lastActivity < thirtyDaysAgo
  }

  // Filtered and sorted members
  const filteredMembers = useMemo(() => {
    let result = [...members]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(m =>
        (m.name?.toLowerCase() || '').includes(query) ||
        m.email.toLowerCase().includes(query)
      )
    }

    // Role filter
    if (filterRole !== 'all') {
      result = result.filter(m => m.role === filterRole)
    }

    // Status filter
    if (filterStatus === 'active') {
      result = result.filter(m => !isInactive(m))
    } else if (filterStatus === 'inactive') {
      result = result.filter(m => isInactive(m))
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortKey) {
        case 'name':
          comparison = (a.name || a.email).localeCompare(b.name || b.email)
          break
        case 'lastActivity': {
          const aDate = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
          const bDate = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
          comparison = bDate - aDate
          break
        }
        case 'createdAt':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
      }
      return sortAsc ? -comparison : comparison
    })

    return result
  }, [members, searchQuery, filterRole, filterStatus, sortKey, sortAsc])

  if (isLoading || loading) {
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

  const activeMembers = members.filter(m => m.status === 'ACTIVE' && !isInactive(m))
  const inactiveMembers = members.filter(m => isInactive(m))
  const pendingInvitations = invitations.filter(i => i.status === 'PENDING')
  const maxMembers = user.organization.maxMembers || 50

  // Usage category icons
  const usageCategoryIcon = (category: string) => {
    switch (category) {
      case 'seminar': return <Calendar className="h-3 w-3" />
      case 'archive': return <Video className="h-3 w-3" />
      case 'community': return <MessageSquare className="h-3 w-3" />
      case 'databook': return <FileText className="h-3 w-3" />
      default: return <Activity className="h-3 w-3" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">メンバー管理</h1>
            <p className="text-slate-600">{user.organization.name} のメンバーを管理</p>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                メンバーを招待
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しいメンバーを招待</DialogTitle>
                <DialogDescription>
                  社内メンバーのみ招待できます。招待メールが送信され、リンクからアカウントを作成できます。
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <p className="text-xs text-slate-500">
                    ※ 社内のメールアドレスを入力してください
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>権限を選択</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={inviteRole === 'MEMBER' ? 'default' : 'outline'}
                      onClick={() => setInviteRole('MEMBER')}
                      className="flex-1"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      メンバー
                    </Button>
                    <Button
                      type="button"
                      variant={inviteRole === 'ADMIN' ? 'default' : 'outline'}
                      onClick={() => setInviteRole('ADMIN')}
                      className="flex-1"
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      管理者
                    </Button>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p><strong>メンバー:</strong> コンテンツの閲覧・利用のみ</p>
                    <p><strong>管理者:</strong> メンバー招待・削除、組織設定の変更が可能</p>
                  </div>
                </div>
                {inviteError && (
                  <p className="text-sm text-red-600">{inviteError}</p>
                )}
                {inviteSuccess && (
                  <p className="text-sm text-green-600">{inviteSuccess}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                  {inviting ? '送信中...' : '招待を送信'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 改善されたサマリーカード (10-1) - クリックでフィルタ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card
            className="border-blue-200 bg-blue-50/30 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setFilterStatus('all')
              setFilterRole('all')
              setSearchQuery('')
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">
                    {members.length}
                    <span className="text-sm font-normal text-slate-500">/{maxMembers}名</span>
                  </p>
                  <p className="text-sm text-slate-600">登録メンバー</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min((members.length / maxMembers) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  残り{maxMembers - members.length}名招待可能
                </p>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer hover:shadow-md transition-shadow ${filterStatus === 'active' ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => {
              setFilterStatus('active')
              setFilterRole('all')
              setSearchQuery('')
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{activeMembers.length}名</p>
                  <p className="text-sm text-slate-600">利用中</p>
                  <p className="text-xs text-slate-400">30日以内にアクセス</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer hover:shadow-md transition-shadow ${inactiveMembers.length > 0 ? 'border-amber-200 bg-amber-50/30' : ''} ${filterStatus === 'inactive' ? 'ring-2 ring-amber-500' : ''}`}
            onClick={() => {
              setFilterStatus('inactive')
              setFilterRole('all')
              setSearchQuery('')
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${inactiveMembers.length > 0 ? 'bg-amber-100' : 'bg-slate-100'}`}>
                  <AlertCircle className={`h-6 w-6 ${inactiveMembers.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${inactiveMembers.length > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                    {inactiveMembers.length}名
                  </p>
                  <p className="text-sm text-slate-600">未利用（要フォロー）</p>
                  <p className="text-xs text-slate-400">30日以上未アクセス</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">{pendingInvitations.length}件</p>
                  <p className="text-sm text-slate-600">招待待ち</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 検索・フィルタ・並び替え (10-7) */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">メンバー一覧</CardTitle>
                <CardDescription>
                  組織に所属するメンバーとその利用状況
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="名前・メールで検索"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-48"
                  />
                </div>
                <Select value={filterRole} onValueChange={(v) => setFilterRole(v as FilterRole)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="権限" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべての権限</SelectItem>
                    <SelectItem value="ADMIN">管理者</SelectItem>
                    <SelectItem value="MEMBER">メンバー</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="利用状況" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="active">利用中</SelectItem>
                    <SelectItem value="inactive">未利用</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (sortKey === 'lastActivity') {
                      setSortAsc(!sortAsc)
                    } else {
                      setSortKey('lastActivity')
                      setSortAsc(false)
                    }
                  }}
                >
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  {sortKey === 'lastActivity' ? '最終利用日' : sortKey === 'name' ? '名前' : '登録日'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredMembers.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                {members.length === 0 ? (
                  <>
                    <p className="text-slate-500">まだメンバーがいません</p>
                    <p className="text-sm text-slate-400">上のボタンからメンバーを招待してください</p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-500">条件に一致するメンバーがいません</p>
                    <Button variant="link" onClick={() => {
                      setSearchQuery('')
                      setFilterRole('all')
                      setFilterStatus('all')
                    }}>
                      フィルタをクリア
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMembers.map((member) => {
                  const isCurrentUser = member.id === user.id
                  const memberIsInactive = isInactive(member)

                  return (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                        isCurrentUser
                          ? 'bg-blue-50/50 border-blue-200'
                          : memberIsInactive
                            ? 'bg-amber-50/30 border-amber-200'
                            : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          member.role === 'ADMIN' ? 'bg-purple-100' : 'bg-slate-100'
                        }`}>
                          {member.role === 'ADMIN' ? (
                            <Crown className="h-5 w-5 text-purple-600" />
                          ) : (
                            <Users className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{member.name || member.email}</p>
                            {/* 管理者ラベル (10-5) */}
                            {member.role === 'ADMIN' && (
                              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                <Crown className="h-3 w-3 mr-1" />
                                管理者
                              </Badge>
                            )}
                            {/* あなた行強調 (10-6) */}
                            {isCurrentUser && (
                              <Badge variant="outline" className="border-blue-300 text-blue-600">
                                あなた
                              </Badge>
                            )}
                            {/* ステータスラベル (10-3) */}
                            {memberIsInactive && !isCurrentUser && (
                              <Badge variant="outline" className="border-amber-300 text-amber-600">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                未利用
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500 mt-1 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{member.email}</span>
                            </div>
                            {/* 最終利用日 (10-3) */}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>最終利用: {formatRelativeDate(member.lastActivityAt)}</span>
                            </div>
                            {/* 利用カテゴリ (10-3) */}
                            {member.usageCategories && member.usageCategories.length > 0 && (
                              <div className="flex items-center gap-1">
                                {member.usageCategories.slice(0, 3).map((cat, i) => (
                                  <span key={i} className="inline-flex items-center gap-0.5 text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                                    {usageCategoryIcon(cat)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {isCurrentUser && (
                            <p className="text-xs text-blue-600 mt-1">
                              このアカウントでログイン中です
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* 利用詳細を見る (10-4) */}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/members/${member.id}/usage`}>
                            <Eye className="h-4 w-4 mr-2" />
                            利用詳細を見る
                          </Link>
                        </Button>
                        {/* リマインドCTA (10-8) */}
                        {memberIsInactive && !isCurrentUser && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-600 border-amber-300 hover:bg-amber-50"
                            onClick={() => {
                              setMemberToRemind(member)
                              setReminderDialogOpen(true)
                            }}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            利用を促す
                          </Button>
                        )}
                        {!isCurrentUser && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setMemberToDelete(member)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">招待待ち</CardTitle>
              <CardDescription>
                まだ承諾されていない招待
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-100 p-2 rounded-full">
                        <Mail className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{invitation.email}</p>
                          <Badge variant="secondary" className="text-xs">
                            {invitation.role === 'ADMIN' ? '管理者' : 'メンバー'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>送信: {formatDate(invitation.createdAt)}</span>
                          </div>
                          {isExpired(invitation.expiresAt) ? (
                            <div className="flex items-center gap-1 text-red-500">
                              <XCircle className="h-3 w-3" />
                              <span>期限切れ</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>期限: {formatDate(invitation.expiresAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>メンバーを削除</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToDelete?.name || memberToDelete?.email} を組織から削除しますか？
              この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? '削除中...' : '削除する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* リマインドメール送信ダイアログ (10-8) */}
      <AlertDialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>利用促進メールを送信</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemind?.name || memberToRemind?.email} さんに、サービスの利用を促すメールを送信しますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="bg-slate-50 p-4 rounded-lg text-sm">
              <p className="font-medium mb-2">メール内容（プレビュー）</p>
              <p className="text-slate-600">
                {user.organization.name}のプレミア購読サービスをご利用いただけます。
                セミナーやアーカイブ動画など、お役立ちコンテンツをぜひご活用ください。
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendReminder}
              disabled={sendingReminder}
            >
              {sendingReminder ? '送信中...' : 'メールを送信'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
