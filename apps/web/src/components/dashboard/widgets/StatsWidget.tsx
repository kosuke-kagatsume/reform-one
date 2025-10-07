import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import {
  Users,
  Building,
  CreditCard,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export function StatsWidget() {
  const stats = [
    {
      name: 'アクティブユーザー',
      value: '1,234',
      change: '+12.5%',
      trend: 'up' as const,
      icon: Users,
      color: 'blue'
    },
    {
      name: '登録組織',
      value: '48',
      change: '+4.2%',
      trend: 'up' as const,
      icon: Building,
      color: 'green'
    },
    {
      name: '月次収益',
      value: '¥4.2M',
      change: '+8.1%',
      trend: 'up' as const,
      icon: CreditCard,
      color: 'purple'
    },
    {
      name: 'API使用率',
      value: '72%',
      change: '-2.3%',
      trend: 'down' as const,
      icon: Activity,
      color: 'orange'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>{stat.name}</CardDescription>
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm ${
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-slate-500">前月比</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
