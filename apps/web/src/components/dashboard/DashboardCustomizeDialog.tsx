import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard-store'

export function DashboardCustomizeDialog() {
  const { config, setWidgetEnabled, resetToDefault } = useDashboardStore()
  const [open, setOpen] = useState(false)

  const handleReset = () => {
    if (confirm('ダッシュボードをデフォルト設定に戻しますか？')) {
      resetToDefault()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          カスタマイズ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ダッシュボードのカスタマイズ</DialogTitle>
          <DialogDescription>
            表示したいウィジェットを選択してください
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {config.widgets.map((widget) => (
            <div
              key={widget.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <Label htmlFor={widget.id} className="font-medium">
                  {widget.title}
                </Label>
                <p className="text-sm text-slate-500">
                  {getWidgetDescription(widget.type)}
                </p>
              </div>
              <Switch
                id={widget.id}
                checked={widget.enabled}
                onCheckedChange={(checked) => setWidgetEnabled(widget.id, checked)}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            デフォルトに戻す
          </Button>
          <Button onClick={() => setOpen(false)}>完了</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getWidgetDescription(type: string): string {
  const descriptions: Record<string, string> = {
    stats: '統計情報を表示',
    services: 'サービスの利用状況を表示',
    'quick-actions': 'よく使う機能へのショートカット',
    'recent-activity': '最近のアクティビティを表示',
    'training-calendar': '研修予定をカレンダー形式で表示',
    'data-books': 'プレミア特典のデータブックをダウンロード',
    newsletter: '編集長ニュースレターを閲覧',
    community: 'プレミア購読者同士の情報交換',
    'digital-edition': '電子版へのアクセス',
    'materials-catalog': '建材カタログへのアクセス',
    store: '公式ストアへのアクセス',
    'fair-registration': 'フェア来場登録',
    'expert-recommendations': 'エキスパートプラン向けの今月のおすすめコンテンツ',
    'admin-summary': 'メンバー数・利用状況などの管理者向けサマリー',
    'kpi-cards': 'セミナー数・アーカイブ数などのKPIカード',
    'upcoming-seminars': '今後のセミナー予定を表示',
    'recent-archives': '最新のアーカイブ動画を表示',
    'community-updates': 'コミュニティの最新投稿を表示'
  }
  return descriptions[type] || ''
}
