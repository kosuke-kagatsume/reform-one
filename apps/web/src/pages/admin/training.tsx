import { useState } from 'react'
import {
  BookOpen,
  Calendar,
  Users,
  Clock,
  Award,
  PlayCircle,
  FileText,
  Download,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Star,
  CheckCircle,
  AlertCircle,
  Video,
  MapPin,
  Laptop,
  Building,
  UserCheck,
  TrendingUp,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

export default function TrainingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  const trainingSessions = [
    {
      id: 1,
      title: 'リフォーム営業力強化研修',
      instructor: '山田太郎（外部講師）',
      type: 'online',
      date: '2024-02-15',
      time: '14:00-17:00',
      participants: 45,
      maxParticipants: 50,
      status: 'upcoming',
      level: 'intermediate',
      category: '営業',
      price: 15000
    },
    {
      id: 2,
      title: '最新建築法規セミナー',
      instructor: '建設法務研究所',
      type: 'offline',
      location: '東京本社 会議室A',
      date: '2024-02-10',
      time: '10:00-12:00',
      participants: 30,
      maxParticipants: 30,
      status: 'full',
      level: 'advanced',
      category: '法規',
      price: 0
    },
    {
      id: 3,
      title: 'CAD実践講座',
      instructor: '鈴木一郎（社内講師）',
      type: 'hybrid',
      location: '大阪支社',
      date: '2024-02-20',
      time: '13:00-18:00',
      participants: 12,
      maxParticipants: 20,
      status: 'upcoming',
      level: 'beginner',
      category: '技術',
      price: 25000
    },
    {
      id: 4,
      title: '顧客満足度向上ワークショップ',
      instructor: 'CS研究会',
      type: 'online',
      date: '2024-01-25',
      time: '15:00-17:00',
      participants: 78,
      maxParticipants: 100,
      status: 'completed',
      level: 'all',
      category: 'CS',
      price: 8000
    }
  ]

  const courses = [
    {
      id: 1,
      title: 'リフォーム基礎講座',
      description: 'リフォーム業界の基礎知識を体系的に学ぶ',
      modules: 12,
      duration: '約20時間',
      enrollments: 234,
      rating: 4.8,
      completionRate: 85
    },
    {
      id: 2,
      title: '営業スキルアップコース',
      description: '成約率を高める営業テクニック',
      modules: 8,
      duration: '約15時間',
      enrollments: 189,
      rating: 4.6,
      completionRate: 78
    },
    {
      id: 3,
      title: '施工管理マスター',
      description: '現場管理のプロフェッショナルを目指す',
      modules: 15,
      duration: '約30時間',
      enrollments: 156,
      rating: 4.9,
      completionRate: 72
    }
  ]

  const learningPaths = [
    {
      id: 1,
      title: '新入社員研修パス',
      target: '入社1年目',
      courses: 5,
      estimatedTime: '3ヶ月',
      participants: 45,
      progress: 68
    },
    {
      id: 2,
      title: '営業マネージャー育成',
      target: '営業3年以上',
      courses: 7,
      estimatedTime: '6ヶ月',
      participants: 23,
      progress: 45
    },
    {
      id: 3,
      title: '技術者スキルアップ',
      target: '施工管理者',
      courses: 6,
      estimatedTime: '4ヶ月',
      participants: 34,
      progress: 82
    }
  ]

  const stats = [
    {
      title: '総受講者数',
      value: '3,456',
      change: '+234',
      changeLabel: '今月',
      icon: Users,
      color: 'blue'
    },
    {
      title: '実施研修数',
      value: '42',
      change: '+8',
      changeLabel: '今月',
      icon: BookOpen,
      color: 'green'
    },
    {
      title: '平均満足度',
      value: '4.7',
      change: '+0.2',
      changeLabel: '前月比',
      icon: Star,
      color: 'yellow'
    },
    {
      title: '修了率',
      value: '78%',
      change: '+5%',
      changeLabel: '前月比',
      icon: Award,
      color: 'purple'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-700">開催予定</Badge>
      case 'full':
        return <Badge className="bg-orange-100 text-orange-700">満席</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">終了</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">中止</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'online':
        return (
          <Badge variant="outline" className="text-blue-600">
            <Laptop className="h-3 w-3 mr-1" />
            オンライン
          </Badge>
        )
      case 'offline':
        return (
          <Badge variant="outline" className="text-green-600">
            <Building className="h-3 w-3 mr-1" />
            対面
          </Badge>
        )
      case 'hybrid':
        return (
          <Badge variant="outline" className="text-purple-600">
            <Video className="h-3 w-3 mr-1" />
            ハイブリッド
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">研修管理</h1>
          <p className="text-slate-600">研修プログラムの作成と受講管理</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
                    {stat.title}
                    <Icon className={`h-4 w-4 text-${stat.color}-500`} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className={`text-${stat.color}-600 font-medium`}>{stat.change}</span> {stat.changeLabel}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Tabs defaultValue="sessions" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="sessions">研修セッション</TabsTrigger>
              <TabsTrigger value="courses">eラーニング</TabsTrigger>
              <TabsTrigger value="paths">学習パス</TabsTrigger>
              <TabsTrigger value="results">成績・テスト</TabsTrigger>
            </TabsList>
            
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規研修作成
            </Button>
          </div>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="研修名・講師名で検索..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="形式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="online">オンライン</SelectItem>
                      <SelectItem value="offline">対面</SelectItem>
                      <SelectItem value="hybrid">ハイブリッド</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    カレンダー表示
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>研修名</TableHead>
                        <TableHead>形式</TableHead>
                        <TableHead>日時</TableHead>
                        <TableHead>講師</TableHead>
                        <TableHead>参加者</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead className="text-right">アクション</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainingSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{session.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {session.category}
                                </Badge>
                                {session.price > 0 && (
                                  <span className="text-xs text-slate-500">
                                    ¥{session.price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(session.type)}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{session.date}</p>
                              <p className="text-xs text-slate-500">{session.time}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{session.instructor}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-slate-400" />
                              <span className="text-sm">
                                {session.participants}/{session.maxParticipants}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  session.status === 'full' ? 'bg-orange-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${(session.participants / session.maxParticipants) * 100}%` }}
                              />
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(session.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>アクション</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>詳細表示</DropdownMenuItem>
                                <DropdownMenuItem>編集</DropdownMenuItem>
                                <DropdownMenuItem>参加者リスト</DropdownMenuItem>
                                <DropdownMenuItem>資料ダウンロード</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">キャンセル</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription className="mt-1">{course.description}</CardDescription>
                      </div>
                      <PlayCircle className="h-5 w-5 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">モジュール数</span>
                        <span className="font-medium">{course.modules}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">所要時間</span>
                        <span className="font-medium">{course.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">受講者数</span>
                        <span className="font-medium">{course.enrollments}名</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">評価</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{course.rating}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">修了率</span>
                          <span className="font-medium">{course.completionRate}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${course.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      コース管理
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="paths" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {learningPaths.map((path) => (
                <Card key={path.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{path.title}</CardTitle>
                        <CardDescription>
                          対象: {path.target} • {path.courses}コース • 推定{path.estimatedTime}
                        </CardDescription>
                      </div>
                      <Target className="h-5 w-5 text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{path.participants}名が受講中</span>
                      </div>
                      <span className="text-sm font-medium">進捗 {path.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>テスト結果・成績管理</CardTitle>
                <CardDescription>受講者の理解度測定とフィードバック</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">テスト機能は現在準備中です</p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    テストを作成
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}