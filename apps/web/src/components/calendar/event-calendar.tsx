// A-5: イベントカレンダーコンポーネント
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
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
import { ChevronLeft, ChevronRight, Calendar, MapPin, Video, Monitor, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CalendarEvent {
  id: string
  title: string
  type: 'seminar' | 'site_visit' | 'online_site_visit'
  scheduledAt: string
  duration?: number | null
  location?: string | null
  description?: string | null
  isRegistered: boolean
  requiredPlan?: string
}

interface EventCalendarProps {
  onEventClick?: (event: CalendarEvent) => void
}

const EVENT_TYPE_STYLES = {
  seminar: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
    icon: Video,
    label: 'セミナー'
  },
  site_visit: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
    icon: MapPin,
    label: '視察会'
  },
  online_site_visit: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
    icon: Monitor,
    label: 'オンライン見学会'
  }
}

export function EventCalendar({ onEventClick }: EventCalendarProps) {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [currentMonth])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)

      const res = await fetch(`/api/calendar/events?start=${monthStart.toISOString()}&end=${monthEnd.toISOString()}`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data.data.events || [])
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => isSameDay(new Date(event.scheduledAt), date))
  }

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event)
    } else {
      // デフォルトの動作: 対応するページにリダイレクト
      switch (event.type) {
        case 'seminar':
          router.push('/dashboard/seminars')
          break
        case 'site_visit':
          router.push(`/dashboard/site-visits/${event.id}`)
          break
        case 'online_site_visit':
          router.push(`/dashboard/online-site-visits/${event.id}`)
          break
      }
    }
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
            className={`min-h-[100px] border-b border-r p-1 ${
              !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
            } ${dayIsToday ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedDate(currentDay)}
          >
            <div className={`text-sm font-medium mb-1 ${
              dayIsToday ? 'text-blue-600' : ''
            }`}>
              {format(day, 'd')}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((event) => {
                const style = EVENT_TYPE_STYLES[event.type]
                return (
                  <button
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEventClick(event)
                    }}
                    className={`w-full text-left text-xs p-1 rounded truncate ${style.bg} ${style.text} hover:opacity-80`}
                  >
                    {event.isRegistered && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    {format(new Date(event.scheduledAt), 'HH:mm')} {event.title}
                  </button>
                )
              })}
              {dayEvents.length > 3 && (
                <div className="text-xs text-gray-500 pl-1">
                  +{dayEvents.length - 3} more
                </div>
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

  return (
    <div className="space-y-6">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
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
              <CheckCircle className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">参加登録済み</span>
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
                return (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className={`w-full text-left p-4 rounded-lg border ${style.border} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${style.bg}`}>
                        <Icon className={`h-5 w-5 ${style.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{event.title}</h4>
                          {event.isRegistered && (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              登録済み
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
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
