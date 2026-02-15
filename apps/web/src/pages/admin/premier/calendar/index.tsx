import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Video,
  Monitor,
  Users,
  AlertCircle,
  EyeOff,
  XCircle
} from 'lucide-react'

interface AdminCalendarEvent {
  id: string
  title: string
  type: 'seminar' | 'site_visit' | 'online_site_visit'
  scheduledAt: string
  duration?: number | null
  location?: string | null
  description?: string | null
  participantCount: number
  capacity?: number | null
  isPublished?: boolean
  isCanceled?: boolean
  requiredPlan?: string
}

const EVENT_TYPE_STYLES = {
  seminar: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
    icon: Video,
    label: 'セミナー',
    adminPath: '/admin/premier/seminars'
  },
  site_visit: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
    icon: MapPin,
    label: '視察会',
    adminPath: '/admin/premier/site-visits'
  },
  online_site_visit: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
    icon: Monitor,
    label: 'オンライン見学会',
    adminPath: '/admin/premier/online-site-visits'
  }
}

export default function AdminCalendarPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<AdminCalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)

      const res = await fetch(
        `/api/admin/premier/calendar/events?start=${monthStart.toISOString()}&end=${monthEnd.toISOString()}`
      )
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }, [currentMonth])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login')
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) fetchEvents()
  }, [isAuthenticated, isReformCompany, fetchEvents])

  const getEventsForDate = (date: Date): AdminCalendarEvent[] => {
    return events.filter(event => isSameDay(new Date(event.scheduledAt), date))
  }

  const handleEventClick = (event: AdminCalendarEvent) => {
    const style = EVENT_TYPE_STYLES[event.type]
    router.push(`${style.adminPath}/${event.id}`)
  }

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayEvents = getEventsForDate(day)
        const isCurrentMonth = isSameMonth(day, currentMonth)
        const dayIsToday = isToday(day)
        const isSelected = selectedDate && isSameDay(day, selectedDate)
        const currentDay = day

        days.push(
          <div
            key={day.toISOString()}
            className={`min-h-[100px] border-b border-r p-1 cursor-pointer transition-colors ${
              !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
            } ${dayIsToday ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''} hover:bg-gray-50`}
            onClick={() => setSelectedDate(currentDay)}
          >
            <div className={`text-sm font-medium mb-1 ${dayIsToday ? 'text-blue-600' : ''}`}>
              {format(day, 'd')}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((event) => {
                const style = EVENT_TYPE_STYLES[event.type]
                const isCanceled = event.isCanceled
                const isUnpublished = event.isPublished === false
                return (
                  <button
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEventClick(event)
                    }}
                    className={`w-full text-left text-xs p-1 rounded truncate ${
                      isCanceled
                        ? 'bg-gray-200 text-gray-500 line-through'
                        : isUnpublished
                        ? 'bg-yellow-100 text-yellow-700'
                        : `${style.bg} ${style.text}`
                    } hover:opacity-80`}
                  >
                    {format(new Date(event.scheduledAt), 'HH:mm')} {event.title}
                  </button>
                )
              })}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500 pl-1">+{dayEvents.length - 3} more</div>
              )}
            </div>
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toISOString()} className="grid grid-cols-7">
          {days}
        </div>
      )
      days = []
    }

    return rows
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            イベントカレンダー
          </h1>
          <p className="text-gray-600 mt-1">
            セミナー、視察会、オンライン見学会のスケジュール管理
          </p>
        </div>

        {/* Calendar Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {format(currentMonth, 'yyyy年 M月', { locale: ja })}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                今月
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 border-t border-l">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                <div
                  key={day}
                  className={`p-2 text-center text-sm font-medium border-r border-b ${
                    index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* カレンダー本体 */}
            <div className="border-t border-l">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                renderCalendarDays()
              )}
            </div>

            {/* 凡例 */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
              {Object.entries(EVENT_TYPE_STYLES).map(([type, style]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${style.bg}`} />
                  <span className="text-sm text-gray-600">{style.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-100" />
                <span className="text-sm text-gray-600">非公開</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-200" />
                <span className="text-sm text-gray-600">キャンセル済み</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 選択日のイベント詳細 */}
        {selectedDate && selectedDateEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, 'M月d日（E）', { locale: ja })}のイベント
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedDateEvents.map((event) => {
                  const style = EVENT_TYPE_STYLES[event.type]
                  const Icon = style.icon
                  const isCanceled = event.isCanceled
                  const isUnpublished = event.isPublished === false

                  return (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className={`w-full text-left p-4 rounded-lg border hover:shadow-md transition-shadow ${
                        isCanceled
                          ? 'border-gray-300 bg-gray-50'
                          : isUnpublished
                          ? 'border-yellow-300 bg-yellow-50'
                          : style.border
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            isCanceled ? 'bg-gray-200' : isUnpublished ? 'bg-yellow-100' : style.bg
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              isCanceled
                                ? 'text-gray-500'
                                : isUnpublished
                                ? 'text-yellow-700'
                                : style.text
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`font-medium ${isCanceled ? 'line-through text-gray-500' : ''}`}>
                              {event.title}
                            </h4>
                            {isCanceled && (
                              <Badge variant="outline" className="text-red-600 border-red-300">
                                <XCircle className="h-3 w-3 mr-1" />
                                キャンセル
                              </Badge>
                            )}
                            {isUnpublished && (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                                <EyeOff className="h-3 w-3 mr-1" />
                                非公開
                              </Badge>
                            )}
                            {event.requiredPlan === 'EXPERT' && (
                              <Badge variant="outline" className="text-purple-600 border-purple-300">
                                EXPERT
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {format(new Date(event.scheduledAt), 'HH:mm')}
                            {event.duration && ` (${event.duration}分)`}
                            {event.location && ` - ${event.location}`}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-gray-500">
                              <Users className="h-4 w-4" />
                              参加者: {event.participantCount}名
                              {event.capacity && ` / ${event.capacity}名`}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{event.description}</p>
                          )}
                        </div>
                        <AlertCircle className="h-5 w-5 text-gray-400" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* クイックアクション */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">クイックアクション</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => router.push('/admin/premier/seminars/new')}>
                <Video className="h-4 w-4 mr-2" />
                新規セミナー
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/premier/site-visits/new')}>
                <MapPin className="h-4 w-4 mr-2" />
                新規視察会
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/premier/online-site-visits/new')}>
                <Monitor className="h-4 w-4 mr-2" />
                新規オンライン見学会
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PremierAdminLayout>
  )
}
