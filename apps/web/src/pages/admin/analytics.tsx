import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  FileText,
  DollarSign,
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
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
import { useAuth } from '@/lib/auth-context'

interface KpiData {
  title: string
  value: string
  change: number
  previousValue: string
  color: string
}

interface CustomerSegment {
  name: string
  value: number
  count: number
  revenue: string
}

interface TopContent {
  rank: number
  title: string
  views: number
  engagement: number
  trend: string
}

interface GrowthMetric {
  month: string
  revenue: number
  users: number
  content: number
}

const iconMap: Record<string, any> = {
  green: DollarSign,
  blue: Users,
  purple: Eye,
  orange: FileText
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { isLoading: authLoading, isAuthenticated } = useAuth()
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [kpiData, setKpiData] = useState<KpiData[]>([])
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([])
  const [topContent, setTopContent] = useState<TopContent[]>([])
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([])
  const [totalRevenue, setTotalRevenue] = useState('¥0M')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics()
    }
  }, [isAuthenticated, period])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setKpiData(data.kpiData || [])
        setCustomerSegments(data.customerSegments || [])
        setTopContent(data.topContent || [])
        setGrowthMetrics(data.growthMetrics || [])
        setTotalRevenue(data.totalRevenue || '¥0M')
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </AdminLayout>
    )
  }

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
          {kpiData.length > 0 ? kpiData.map((kpi) => {
            const Icon = iconMap[kpi.color] || DollarSign
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
                          {Math.abs(kpi.change).toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">前期: {kpi.previousValue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }) : (
            [1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">-</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">-</p>
                </CardContent>
              </Card>
            ))
          )}
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
                  {growthMetrics.length > 0 ? growthMetrics.map((metric) => (
                    <div key={metric.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-t relative" style={{ height: `${(metric.revenue / 50) * 100}%` }}>
                        <div className="absolute inset-x-0 bottom-0 bg-blue-500 rounded-t" style={{ height: '80%' }} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium">{metric.month}</p>
                        <p className="text-xs text-slate-500">¥{metric.revenue.toFixed(1)}M</p>
                      </div>
                    </div>
                  )) : (
                    <p className="w-full text-center text-slate-500 py-8">データがありません</p>
                  )}
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
                {customerSegments.length > 0 ? customerSegments.map((segment) => (
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
                )) : (
                  <p className="text-center text-slate-500 py-4">データがありません</p>
                )}
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">合計収益</span>
                  <span className="text-lg font-bold">{totalRevenue}</span>
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
                    {topContent.length > 0 ? topContent.map((content) => (
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
                    )) : (
                      <p className="text-center text-slate-500 py-4">データがありません</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">新規ユーザー</p>
                    <p className="text-xl font-bold">-</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">アクティブ率</p>
                    <p className="text-xl font-bold">-</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">平均滞在時間</p>
                    <p className="text-xl font-bold">-</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">離脱率</p>
                    <p className="text-xl font-bold">-</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="conversion" className="mt-4">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-blue-900">無料トライアル → 有料契約</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">-</p>
                      </div>
                      <Target className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">スタンダード → エキスパート</p>
                      <p className="text-xl font-bold mt-1">-</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">アップグレード率</p>
                      <p className="text-xl font-bold mt-1">-</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="retention" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">1ヶ月継続率</p>
                      <p className="text-2xl font-bold mt-1">-</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">3ヶ月継続率</p>
                      <p className="text-2xl font-bold mt-1">-</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">年間継続率</p>
                      <p className="text-2xl font-bold mt-1">-</p>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">解約リスクのある顧客</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">-</p>
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
