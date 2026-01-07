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
  Bell,
  Check,
  CheckCheck,
  Calendar,
  Video,
  Megaphone,
  AlertCircle,
  FileText,
  Mail,
  Building2,
  MessageSquare,
  Settings,
  ArrowRight
} from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  SYSTEM: { icon: AlertCircle, color: 'text-blue-600 bg-blue-50', label: 'システム' },
  SEMINAR: { icon: Calendar, color: 'text-green-600 bg-green-50', label: 'セミナー' },
  ARCHIVE: { icon: Video, color: 'text-purple-600 bg-purple-50', label: 'アーカイブ' },
  ANNOUNCEMENT: { icon: Megaphone, color: 'text-orange-600 bg-orange-50', label: 'お知らせ' },
  DATABOOK: { icon: FileText, color: 'text-indigo-600 bg-indigo-50', label: 'データブック' },
  NEWSLETTER: { icon: Mail, color: 'text-pink-600 bg-pink-50', label: 'ニュースレター' },
  SITE_VISIT: { icon: Building2, color: 'text-amber-600 bg-amber-50', label: '視察会' },
  COMMUNITY: { icon: MessageSquare, color: 'text-cyan-600 bg-cyan-50', label: 'コミュニティ' }
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
    }
  }, [user?.id])

  const fetchNotifications = async () => {
    if (!user?.id) return

    setIsLoadingNotifications(true)
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}`)
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return

    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user?.id) return

    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" />
              通知
            </h1>
            <p className="text-slate-600">
              セミナー・アーカイブ・お知らせなどの通知を確認できます
            </p>
          </div>
          <Link href="/dashboard/notifications/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              通知設定
            </Button>
          </Link>
        </div>

        {/* フィルター・アクション */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  すべて
                  <Badge variant="secondary" className="ml-2">
                    {notifications.length}
                  </Badge>
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                >
                  未読のみ
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  すべて既読にする
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 通知一覧 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">通知一覧</CardTitle>
            <CardDescription>
              クリックすると詳細ページに移動します
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingNotifications ? (
              <div className="py-12 text-center text-slate-500">
                読み込み中...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 mb-2">
                  {filter === 'unread' ? '未読の通知はありません' : '通知はありません'}
                </p>
                <p className="text-sm text-slate-400">
                  新しいコンテンツが追加されるとここに通知が届きます
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => {
                  const config = typeConfig[notification.type] || typeConfig.SYSTEM
                  const Icon = config.icon

                  const content = (
                    <div
                      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id)
                        }
                      }}
                    >
                      <div className="flex gap-4">
                        <div className={`p-2.5 rounded-lg ${config.color} flex-shrink-0`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {config.label}
                              </Badge>
                              <p className={`font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                {notification.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!notification.read && (
                                <span className="h-2.5 w-2.5 bg-blue-500 rounded-full" />
                              )}
                              {notification.link && (
                                <ArrowRight className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-2">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ja
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )

                  if (notification.link) {
                    return (
                      <Link key={notification.id} href={notification.link}>
                        {content}
                      </Link>
                    )
                  }

                  return <div key={notification.id}>{content}</div>
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
