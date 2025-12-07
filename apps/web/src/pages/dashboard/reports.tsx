import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  FileText,
  Clock,
  Filter,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  Package,
  DollarSign
} from 'lucide-react'

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedReport, setSelectedReport] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [kpiData, setKpiData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [serviceUsage, setServiceUsage] = useState<any[]>([])
  const [topContent, setTopContent] = useState<any[]>([])

  useEffect(() => {
    fetchReports()
  }, [selectedPeriod])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/dashboard/reports?period=${selectedPeriod}`)
      if (res.ok) {
        const data = await res.json()
        setKpiData(data.kpiData || [])
        setMonthlyData(data.monthlyData || [])
        setServiceUsage(data.serviceUsage || [])
        setTopContent(data.topContent || [])
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const reportTypes = [
    {
      id: 'overview',
      name: '概要レポート',
      description: '全体的なパフォーマンス',
      icon: BarChart3
    },
    {
      id: 'users',
      name: 'ユーザーレポート',
      description: 'ユーザー行動分析',
      icon: Users
    },
    {
      id: 'revenue',
      name: '収益レポート',
      description: '売上と請求分析',
      icon: DollarSign
    },
    {
      id: 'services',
      name: 'サービス利用レポート',
      description: '各サービスの利用状況',
      icon: Package
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">レポート</h2>
            <p className="text-slate-600">データ分析とインサイト</p>
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border border-slate-200 rounded-md text-sm"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="week">過去7日間</option>
              <option value="month">過去30日間</option>
              <option value="quarter">四半期</option>
              <option value="year">年間</option>
            </select>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              レポートをエクスポート
            </Button>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {reportTypes.map((report) => (
            <Card 
              key={report.id}
              className={`cursor-pointer transition-all ${
                selectedReport === report.id ? 'ring-2 ring-blue-600' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedReport === report.id ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <report.icon className={`h-5 w-5 ${
                      selectedReport === report.id ? 'text-blue-600' : 'text-slate-600'
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{report.name}</CardTitle>
                    <CardDescription className="text-xs">{report.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi) => (
            <Card key={kpi.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>{kpi.name}</CardDescription>
                  <kpi.icon className="h-4 w-4 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className={`flex items-center gap-1 text-sm ${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {kpi.change}
                    </div>
                  </div>
                  <div className="h-8">
                    <svg className="w-full h-full">
                      <polyline
                        points={kpi.sparkline.map((val: number, idx: number) =>
                          `${idx * (100 / (kpi.sparkline.length - 1))},${32 - (val / Math.max(...kpi.sparkline)) * 28}`
                        ).join(' ')}
                        fill="none"
                        stroke={kpi.trend === 'up' ? '#10b981' : '#ef4444'}
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>月次トレンド</CardTitle>
              <CardDescription>ユーザー数と収益の推移</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Simple Chart Representation */}
                <div className="h-64 flex items-end justify-between gap-2">
                  {monthlyData.map((data) => (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center gap-1">
                        <div 
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${(data.users / 1234) * 150}px` }}
                        />
                        <div 
                          className="w-full bg-green-500 rounded-t"
                          style={{ height: `${(data.revenue / 1400000) * 100}px` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{data.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span className="text-sm text-slate-600">ユーザー数</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-sm text-slate-600">収益</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Usage */}
          <Card>
            <CardHeader>
              <CardTitle>サービス利用率</CardTitle>
              <CardDescription>各サービスの利用状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceUsage.map((service) => (
                  <div key={service.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{service.name}</span>
                      <span className="text-sm text-slate-500">{service.users}人</span>
                    </div>
                    <div className="relative">
                      <div className="h-2 bg-slate-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${service.percentage}%` }}
                        />
                      </div>
                      <span className="absolute right-0 -top-5 text-xs text-slate-500">
                        {service.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>人気コンテンツ</CardTitle>
                <CardDescription>最も閲覧されているコンテンツ</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                詳細を見る
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">コンテンツ</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">閲覧数</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">エンゲージメント</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">トレンド</th>
                  </tr>
                </thead>
                <tbody>
                  {topContent.map((content, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-sm">{content.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{content.views.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant="outline"
                          className={
                            content.engagement === '高' ? 'bg-green-50 text-green-700 border-green-200' :
                            content.engagement === '中' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-slate-50 text-slate-700 border-slate-200'
                          }
                        >
                          {content.engagement}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}