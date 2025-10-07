import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface TrainingEvent {
  id: number
  title: string
  date: string
  time: string
  location: string
  type: 'online' | 'offline'
  capacity: number
  registered: number
  status: 'upcoming' | 'full' | 'completed'
}

export function TrainingCalendarWidget() {
  const [currentMonth] = useState(new Date())

  // Mock training events
  const events: TrainingEvent[] = [
    {
      id: 1,
      title: 'リフォーム営業基礎研修',
      date: '2025-10-15',
      time: '10:00-16:00',
      location: 'オンライン',
      type: 'online',
      capacity: 50,
      registered: 32,
      status: 'upcoming'
    },
    {
      id: 2,
      title: '建材トレンド最新情報セミナー',
      date: '2025-10-20',
      time: '14:00-17:00',
      location: '東京会場',
      type: 'offline',
      capacity: 30,
      registered: 28,
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'マネジメント実践研修',
      date: '2025-10-25',
      time: '13:00-18:00',
      location: 'オンライン',
      type: 'online',
      capacity: 40,
      registered: 40,
      status: 'full'
    },
    {
      id: 4,
      title: 'デジタルマーケティング入門',
      date: '2025-11-05',
      time: '10:00-15:00',
      location: '大阪会場',
      type: 'offline',
      capacity: 25,
      registered: 15,
      status: 'upcoming'
    }
  ]

  const upcomingEvents = events
    .filter((e) => e.status !== 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  const getStatusBadge = (event: TrainingEvent) => {
    if (event.status === 'full') {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          満席
        </Badge>
      )
    }
    if (event.registered / event.capacity > 0.8) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          残りわずか
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        受付中
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>研修カレンダー</CardTitle>
            <CardDescription>今後の研修予定と空き状況</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/training">
              すべて表示
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>今後の研修予定はありません</p>
            </div>
          ) : (
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 border rounded-lg hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">{event.title}</h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.registered}/{event.capacity}名
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(event)}
                    <Button
                      size="sm"
                      disabled={event.status === 'full'}
                      asChild={event.status !== 'full'}
                    >
                      {event.status === 'full' ? (
                        '満席'
                      ) : (
                        <Link href={`/dashboard/training/${event.id}`}>申込</Link>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(event.registered / event.capacity) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
