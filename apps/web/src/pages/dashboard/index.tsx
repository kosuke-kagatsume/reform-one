import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'
import { DashboardCustomizeDialog } from '@/components/dashboard/DashboardCustomizeDialog'
import { StatsWidget } from '@/components/dashboard/widgets/StatsWidget'
import { ServicesWidget } from '@/components/dashboard/widgets/ServicesWidget'
import { QuickActionsWidget } from '@/components/dashboard/widgets/QuickActionsWidget'
import { RecentActivityWidget } from '@/components/dashboard/widgets/RecentActivityWidget'
import { TrainingCalendarWidget } from '@/components/dashboard/widgets/TrainingCalendarWidget'
import { WidgetType } from '@/types/dashboard'

export default function Dashboard() {
  const { config } = useDashboardStore()
  const enabledWidgets = config.widgets
    .filter((w) => w.enabled)
    .sort((a, b) => a.order - b.order)

  const renderWidget = (type: WidgetType) => {
    switch (type) {
      case 'stats':
        return <StatsWidget />
      case 'services':
        return <ServicesWidget />
      case 'quick-actions':
        return <QuickActionsWidget />
      case 'recent-activity':
        return <RecentActivityWidget />
      case 'training-calendar':
        return <TrainingCalendarWidget />
      default:
        return (
          <div className="p-8 border rounded-lg bg-slate-50 text-center text-slate-500">
            {type} ウィジェット（実装予定）
          </div>
        )
    }
  }

  const getWidgetClassName = (width: string) => {
    switch (width) {
      case 'full':
        return 'col-span-full'
      case 'half':
        return 'lg:col-span-6'
      case 'third':
        return 'lg:col-span-4'
      case 'two-thirds':
        return 'lg:col-span-8'
      default:
        return 'col-span-full'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">ダッシュボード</h2>
            <p className="text-slate-600">全体的な利用状況とパフォーマンスを確認</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              レポートをダウンロード
            </Button>
            <DashboardCustomizeDialog />
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {enabledWidgets.map((widget) => (
            <div key={widget.id} className={getWidgetClassName(widget.width)}>
              {renderWidget(widget.type)}
            </div>
          ))}
        </div>

        {enabledWidgets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">表示するウィジェットがありません</p>
            <DashboardCustomizeDialog />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
