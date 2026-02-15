// A-5: カレンダー表示ページ
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { EventCalendar } from '@/components/calendar/event-calendar'
import { Calendar as CalendarIcon } from 'lucide-react'

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            イベントカレンダー
          </h1>
          <p className="text-gray-600 mt-1">
            セミナー、視察会、オンライン見学会のスケジュールを確認できます
          </p>
        </div>

        {/* Calendar */}
        <EventCalendar />
      </div>
    </DashboardLayout>
  )
}
