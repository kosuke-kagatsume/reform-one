import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Clock, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export function RecentActivityWidget() {
  const recentActivities = [
    {
      id: 1,
      type: 'user_joined',
      title: '新規ユーザー登録',
      description: 'tanaka@reform.co.jp が組織に参加しました',
      time: '5分前',
      status: 'success' as const
    },
    {
      id: 2,
      type: 'payment',
      title: '支払い完了',
      description: 'プレミアムプランの請求が完了しました',
      time: '1時間前',
      status: 'success' as const
    },
    {
      id: 3,
      type: 'security',
      title: 'セキュリティアラート',
      description: '異常なログイン試行を検出しました',
      time: '3時間前',
      status: 'warning' as const
    },
    {
      id: 4,
      type: 'system',
      title: 'システム更新',
      description: 'v2.1.0へのアップデートが利用可能です',
      time: '5時間前',
      status: 'info' as const
    }
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>最近のアクティビティ</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/activity">
              すべて表示
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <div className="mt-0.5">
                {activity.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {activity.status === 'warning' && (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                {activity.status === 'info' && (
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-sm text-slate-500">{activity.description}</p>
              </div>
              <div className="flex items-center text-sm text-slate-400">
                <Clock className="h-3 w-3 mr-1" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
