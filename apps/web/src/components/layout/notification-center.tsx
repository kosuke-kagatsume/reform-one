import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Check, Calendar, Video, Megaphone, AlertCircle, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Notification {
  id: string
  type: 'SYSTEM' | 'SEMINAR' | 'ARCHIVE' | 'ANNOUNCEMENT'
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

interface NotificationCenterProps {
  userId: string
}

const typeIcons = {
  SYSTEM: AlertCircle,
  SEMINAR: Calendar,
  ARCHIVE: Video,
  ANNOUNCEMENT: Megaphone
}

const typeColors = {
  SYSTEM: 'text-blue-600 bg-blue-50',
  SEMINAR: 'text-green-600 bg-green-50',
  ARCHIVE: 'text-purple-600 bg-purple-50',
  ANNOUNCEMENT: 'text-orange-600 bg-orange-50'
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotifications = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`)
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
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
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-50 rounded-lg"
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-20 max-h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">通知</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    すべて既読
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500">
                  読み込み中...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p>通知はありません</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => {
                    const Icon = typeIcons[notification.type]
                    const colorClass = typeColors[notification.type]

                    const content = (
                      <div
                        className={`p-4 hover:bg-slate-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
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
            </div>
          </div>
        </>
      )}
    </div>
  )
}
