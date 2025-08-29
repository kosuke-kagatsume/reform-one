import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  GraduationCap,
  Calendar,
  Clock,
  Users,
  Award,
  PlayCircle,
  BookOpen,
  Target,
  TrendingUp,
  CheckCircle,
  Lock,
  Star,
  Video,
  FileText,
  Download,
  ChevronRight,
  User,
  Building,
  Wrench,
  Shield,
  Search,
  Filter
} from 'lucide-react'

export default function TrainingProgram() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 研修プログラムデータ（リフォーム産業新聞社のセミナー情報を参考）
  const courses = [
    {
      id: 1,
      title: '2025年法改正後の確認申請と完了検査の注意点',
      instructor: '城東テクノ技術部',
      category: '法規・制度',
      level: '中級',
      duration: '3時間',
      date: '2025年9月11日',
      format: 'オンライン',
      participants: 234,
      maxParticipants: 300,
      price: '¥15,000',
      progress: 0,
      status: 'upcoming',
      description: '2025年4月施行の建築基準法改正に対応。確認申請と完了検査の変更点を詳しく解説',
      topics: ['建築基準法改正', '確認申請手続き', '完了検査の要点', '実務での注意事項'],
      certificate: true
    },
    {
      id: 2,
      title: 'ZEH定義見直しセミナー',
      instructor: 'Make House×リブ・コンサルティング',
      category: '省エネ・環境',
      level: '初級',
      duration: '2時間',
      date: '2025年9月9日',
      format: 'ハイブリッド',
      participants: 156,
      maxParticipants: 200,
      price: '¥10,000',
      progress: 100,
      status: 'completed',
      description: 'ZEH基準の最新動向と実務への影響を解説。補助金活用のポイントも紹介',
      topics: ['ZEH基準見直し', '省エネ計算', '補助金制度', '顧客提案方法'],
      certificate: true
    },
    {
      id: 3,
      title: 'リフォーム営業スキルアップ研修',
      instructor: 'リフォーム産業新聞社',
      category: '営業・マーケティング',
      level: '初級',
      duration: '全5回（各2時間）',
      date: '2025年9月15日〜',
      format: 'オンライン',
      participants: 89,
      maxParticipants: 100,
      price: '¥50,000',
      progress: 40,
      status: 'in_progress',
      description: '成約率を上げる提案力と顧客対応スキルを体系的に学ぶ実践型研修',
      topics: ['顧客心理理解', 'ヒアリング技術', 'プレゼンテーション', 'クロージング'],
      certificate: true
    },
    {
      id: 4,
      title: '最新建材・設備機器活用セミナー',
      instructor: 'LIXIL×YKK AP',
      category: '技術・施工',
      level: '全レベル',
      duration: '4時間',
      date: '2025年9月20日',
      format: '対面',
      participants: 178,
      maxParticipants: 250,
      price: '無料',
      progress: 0,
      status: 'upcoming',
      description: '最新の高性能建材と設備機器の特徴、施工方法、顧客への提案ポイントを学ぶ',
      topics: ['高断熱建材', 'スマート設備', '施工技術', '補助金活用'],
      certificate: false
    },
    {
      id: 5,
      title: 'リフォーム業界DX推進セミナー',
      instructor: 'デジタル推進協会',
      category: 'DX・IT',
      level: '初級',
      duration: '3時間',
      date: '2025年9月25日',
      format: 'オンライン',
      participants: 67,
      maxParticipants: 150,
      price: '¥8,000',
      progress: 0,
      status: 'upcoming',
      description: 'デジタルツールを活用した業務効率化と顧客満足度向上の方法',
      topics: ['クラウド活用', '3D CAD', 'VR/AR', '顧客管理システム'],
      certificate: true
    }
  ]

  const categories = [
    { id: 'all', name: 'すべて', icon: BookOpen, count: 45 },
    { id: 'legal', name: '法規・制度', icon: Shield, count: 8 },
    { id: 'energy', name: '省エネ・環境', icon: TrendingUp, count: 12 },
    { id: 'sales', name: '営業・マーケティング', icon: Users, count: 10 },
    { id: 'tech', name: '技術・施工', icon: Wrench, count: 9 },
    { id: 'dx', name: 'DX・IT', icon: Building, count: 6 }
  ]

  const myProgress = {
    completed: 12,
    inProgress: 3,
    totalHours: 48,
    certificates: 8
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
                           course.category.toLowerCase().includes(selectedCategory)
    return matchesSearch && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-50 text-green-700 border-green-200">修了</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">受講中</Badge>
      case 'upcoming':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">開催予定</Badge>
      default:
        return null
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case '初級':
        return <Badge variant="outline" className="text-green-600 border-green-300">初級</Badge>
      case '中級':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">中級</Badge>
      case '上級':
        return <Badge variant="outline" className="text-red-600 border-red-300">上級</Badge>
      default:
        return <Badge variant="outline">全レベル</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">研修プログラム</h2>
            <p className="text-slate-600">スキルアップのための各種研修・セミナー</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              スケジュール
            </Button>
            <Button variant="outline">
              <Award className="h-4 w-4 mr-2" />
              修了証明書
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>修了コース</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{myProgress.completed}</p>
              <p className="text-xs text-slate-500">コース完了</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>受講中</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{myProgress.inProgress}</p>
              <p className="text-xs text-slate-500">進行中のコース</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総学習時間</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{myProgress.totalHours}時間</p>
              <p className="text-xs text-slate-500">累計</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>取得証明書</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">{myProgress.certificates}</p>
              <p className="text-xs text-slate-500">修了証明書</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>カテゴリー</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1 p-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-purple-50 text-purple-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>直近の開催予定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">9月9日</p>
                      <p className="text-xs text-slate-500">ZEH定義見直しセミナー</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">9月11日</p>
                      <p className="text-xs text-slate-500">法改正セミナー</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">9月15日</p>
                      <p className="text-xs text-slate-500">営業スキルアップ研修</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="研修を検索..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    絞り込み
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Courses List */}
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(course.status)}
                          {getLevelBadge(course.level)}
                          <Badge variant="outline">{course.category}</Badge>
                          {course.certificate && (
                            <Badge variant="outline" className="text-purple-600 border-purple-300">
                              <Award className="h-3 w-3 mr-1" />
                              修了証あり
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                        <p className="text-sm text-slate-600 mb-3">{course.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {course.instructor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {course.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.participants}/{course.maxParticipants}名
                          </span>
                        </div>

                        {course.progress > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-slate-600">進捗状況</span>
                              <span className="font-medium">{course.progress}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full">
                              <div 
                                className="h-2 bg-purple-600 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {course.topics.map((topic) => (
                            <span key={topic} className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="ml-6 text-right">
                        <p className="text-2xl font-bold mb-2">{course.price}</p>
                        <Badge variant="outline" className="mb-3">
                          {course.format === 'オンライン' && <Video className="h-3 w-3 mr-1" />}
                          {course.format === '対面' && <Users className="h-3 w-3 mr-1" />}
                          {course.format === 'ハイブリッド' && <Building className="h-3 w-3 mr-1" />}
                          {course.format}
                        </Badge>
                        <div className="space-y-2">
                          {course.status === 'completed' ? (
                            <Button className="w-full" variant="outline">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              修了証を見る
                            </Button>
                          ) : course.status === 'in_progress' ? (
                            <Button className="w-full">
                              <PlayCircle className="h-4 w-4 mr-2" />
                              続きを受講
                            </Button>
                          ) : (
                            <Button className="w-full">
                              申し込む
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="w-full">
                            <FileText className="h-4 w-4 mr-2" />
                            詳細
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}