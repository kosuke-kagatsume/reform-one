import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  FileText,
  DollarSign,
  Calendar,
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  BarChart3,
  PieChart,
  Activity,
  ArrowRight,
  Clock,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import AdminLayout from '@/components/layout/admin-layout'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month')
  const [compareMode, setCompareMode] = useState(false)

  const kpiData = [
    {
      title: '月間収益',
      value: '¥45.2M',
      change: 12.5,
      previousValue: '¥40.2M',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'アクティブユーザー',
      value: '8,234',
      change: 8.3,
      previousValue: '7,604',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'コンテンツ閲覧数',
      value: '2.3M',
      change: 15.2,
      previousValue: '2.0M',
      icon: Eye,
      color: 'purple'
    },
    {
      title: '新規契約',
      value: '142',
      change: -5.2,
      previousValue: '150',
      icon: FileText,
      color: 'orange'
    }
  ]

  const topContent = [
    {
      rank: 1,
      title: '2024年リフォーム市場動向レポート',
      views: 45234,
      engagement: 92,
      trend: 'up'
    },
    {
      rank: 2,
      title: '省エネリフォーム補助金制度ガイド',
      views: 38921,
      engagement: 88,
      trend: 'up'
    },
    {
      rank: 3,
      title: '最新キッチンリフォームトレンド',
      views: 31456,
      engagement: 85,
      trend: 'stable'
    },
    {
      rank: 4,
      title: '職人不足問題への対応策',
      views: 28734,
      engagement: 79,
      trend: 'down'
    },
    {
      rank: 5,
      title: 'デジタルツール活用事例集',
      views: 24567,
      engagement: 82,
      trend: 'up'
    }
  ]

  const customerSegments = [
    { name: 'エンタープライズ', value: 35, count: 89, revenue: '¥15.8M' },
    { name: 'プレミアム', value: 45, count: 1150, revenue: '¥23.0M' },
    { name: 'スターター', value: 20, count: 1308, revenue: '¥6.4M' }
  ]

  const growthMetrics = [
    { month: '10月', revenue: 38.5, users: 7200, content: 1850 },
    { month: '11月', revenue: 40.2, users: 7604, content: 1920 },
    { month: '12月', revenue: 42.8, users: 7890, content: 2010 },
    { month: '1月', revenue: 45.2, users: 8234, content: 2130 }
  ]

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">売上分析</h1>
            <p className="text-slate-600">ビジネスパフォーマンスの詳細分析</p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">週間</SelectItem>
                <SelectItem value="month">月間</SelectItem>
                <SelectItem value="quarter">四半期</SelectItem>
                <SelectItem value="year">年間</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              フィルター
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              レポート出力
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpiData.map((kpi) => {
            const Icon = kpi.icon
            const isPositive = kpi.change > 0
            return (
              <Card key={kpi.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
                    {kpi.title}
                    <Icon className={`h-4 w-4 text-${kpi.color}-500`} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(kpi.change)}%
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">前期: {kpi.previousValue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>収益推移</CardTitle>
                    <CardDescription>月次収益と成長率</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Activity className="mr-2 h-4 w-4" />
                    詳細分析
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {growthMetrics.map((metric, index) => (
                    <div key={metric.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-t relative" style={{ height: `${(metric.revenue / 50) * 100}%` }}>
                        <div className="absolute inset-x-0 bottom-0 bg-blue-500 rounded-t" style={{ height: '80%' }} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium">{metric.month}</p>
                        <p className="text-xs text-slate-500">¥{metric.revenue}M</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Segments */}
          <Card>
            <CardHeader>
              <CardTitle>顧客セグメント</CardTitle>
              <CardDescription>プラン別収益構成</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerSegments.map((segment) => (
                  <div key={segment.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{segment.name}</span>
                      <span className="text-sm text-slate-500">{segment.revenue}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${segment.value}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{segment.count} 顧客 ({segment.value}%)</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">合計収益</span>
                  <span className="text-lg font-bold">¥45.2M</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different analytics views */}
        <Card className="mt-6">
          <CardHeader>
            <Tabs defaultValue="content" className="w-full">
              <TabsList>
                <TabsTrigger value="content">コンテンツ分析</TabsTrigger>
                <TabsTrigger value="users">ユーザー分析</TabsTrigger>
                <TabsTrigger value="conversion">コンバージョン</TabsTrigger>
                <TabsTrigger value="retention">リテンション</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">人気コンテンツ TOP5</h3>
                    <Button variant="ghost" size="sm">
                      すべて見る
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {topContent.map((content) => (
                      <div key={content.rank} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                            {content.rank}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{content.title}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {content.views.toLocaleString()}
                              </span>
                              <span className="text-xs text-slate-500">
                                エンゲージメント率: {content.engagement}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {content.trend === 'up' && (
                            <Badge className="bg-green-100 text-green-700">
                              <ChevronUp className="h-3 w-3" />
                              上昇
                            </Badge>
                          )}
                          {content.trend === 'down' && (
                            <Badge className="bg-red-100 text-red-700">
                              <ChevronDown className="h-3 w-3" />
                              下降
                            </Badge>
                          )}
                          {content.trend === 'stable' && (
                            <Badge className="bg-slate-100 text-slate-700">
                              維持
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">新規ユーザー</p>
                    <p className="text-xl font-bold">1,234</p>
                    <p className="text-xs text-green-600 mt-1">+15.2%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">アクティブ率</p>
                    <p className="text-xl font-bold">78.5%</p>
                    <p className="text-xs text-green-600 mt-1">+3.2%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">平均滞在時間</p>
                    <p className="text-xl font-bold">12:34</p>
                    <p className="text-xs text-green-600 mt-1">+2:15</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">離脱率</p>
                    <p className="text-xl font-bold">2.3%</p>
                    <p className="text-xs text-red-600 mt-1">+0.5%</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="conversion" className="mt-4">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-blue-900">無料トライアル → 有料契約</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">32.5%</p>
                      </div>
                      <Target className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">前月比 +5.2%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">スターター → プレミアム</p>
                      <p className="text-xl font-bold mt-1">18.7%</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">プレミアム → エンタープライズ</p>
                      <p className="text-xl font-bold mt-1">8.3%</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="retention" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">1ヶ月継続率</p>
                      <p className="text-2xl font-bold mt-1">92%</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">3ヶ月継続率</p>
                      <p className="text-2xl font-bold mt-1">85%</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">年間継続率</p>
                      <p className="text-2xl font-bold mt-1">78%</p>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">解約リスクのある顧客</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">23社</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Clock className="mr-2 h-4 w-4" />
                      対応リストを見る
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </AdminLayout>
  )
}