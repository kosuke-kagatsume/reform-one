import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
  Download,
  Bookmark,
  Share2,
  TrendingUp,
  Award,
  Home,
  Building,
  Users,
  Package,
  ArrowRight,
  Star,
  BookOpen,
  ChevronRight
} from 'lucide-react'

export default function DigitalEdition() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  // リフォーム産業新聞社の実際の記事データ
  const articles = [
    {
      id: 1,
      title: '築60年の納屋が自然素材の家に大変身',
      subtitle: 'リノベーション・オブ・ザ・イヤー2024',
      category: 'リノベーション',
      date: '2025年08月30日',
      author: '編集部',
      readTime: '5分',
      thumbnail: '/api/placeholder/400/300',
      isNew: true,
      isPremium: true,
      views: 3456,
      bookmarked: false,
      tags: ['リノベーション', '事例', '受賞']
    },
    {
      id: 2,
      title: '買取再販年間販売戸数ランキング2025',
      subtitle: 'カチタス、レジデンシャル、リプライスがベスト3',
      category: 'リフォーム会社',
      date: '2025年08月29日',
      author: '市場調査部',
      readTime: '8分',
      thumbnail: '/api/placeholder/400/300',
      isNew: true,
      isPremium: false,
      views: 2890,
      bookmarked: true,
      tags: ['ランキング', '買取再販', '市場動向']
    },
    {
      id: 3,
      title: '2025年法改正後の確認申請と完了検査の注意点',
      subtitle: '城東テクノ特別セミナーレポート',
      category: 'セミナー',
      date: '2025年08月28日',
      author: '技術部',
      readTime: '10分',
      thumbnail: '/api/placeholder/400/300',
      isNew: false,
      isPremium: true,
      views: 1987,
      bookmarked: false,
      tags: ['法改正', 'セミナー', '建築基準']
    },
    {
      id: 4,
      title: 'ZEH定義見直しで変わる住宅市場',
      subtitle: '省エネ基準の最新動向を解説',
      category: '市場動向',
      date: '2025年08月27日',
      author: '環境政策部',
      readTime: '7分',
      thumbnail: '/api/placeholder/400/300',
      isNew: false,
      isPremium: false,
      views: 2345,
      bookmarked: true,
      tags: ['ZEH', '省エネ', '政策']
    },
    {
      id: 5,
      title: 'リフォーム大賞2025 受賞作品発表',
      subtitle: '革新的なデザインと機能性を評価',
      category: 'イベント',
      date: '2025年08月26日',
      author: '編集部',
      readTime: '6分',
      thumbnail: '/api/placeholder/400/300',
      isNew: false,
      isPremium: true,
      views: 4123,
      bookmarked: false,
      tags: ['受賞', 'デザイン', 'イベント']
    },
    {
      id: 6,
      title: '補助金制度完全ガイド2025年版',
      subtitle: '活用できる支援制度を一挙紹介',
      category: '補助金・制度',
      date: '2025年08月25日',
      author: '政策調査部',
      readTime: '15分',
      thumbnail: '/api/placeholder/400/300',
      isNew: false,
      isPremium: false,
      views: 5678,
      bookmarked: true,
      tags: ['補助金', '支援制度', 'ガイド']
    }
  ]

  const categories = [
    { id: 'all', name: 'すべて', icon: FileText, count: 156 },
    { id: 'renovation', name: 'リノベーション', icon: Home, count: 42 },
    { id: 'company', name: 'リフォーム会社', icon: Building, count: 38 },
    { id: 'market', name: '市場動向', icon: TrendingUp, count: 28 },
    { id: 'seminar', name: 'セミナー', icon: Users, count: 24 },
    { id: 'event', name: 'イベント', icon: Award, count: 15 },
    { id: 'subsidy', name: '補助金・制度', icon: Package, count: 9 }
  ]

  const featuredTopics = [
    'リフォーム大賞2025',
    '買取再販ランキング',
    'ZEH基準見直し',
    '省エネ補助金',
    '法改正対応'
  ]

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
                           article.category.toLowerCase().includes(selectedCategory)
    return matchesSearch && matchesCategory
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">電子版</h2>
            <p className="text-slate-600">リフォーム産業新聞の最新記事を閲覧</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              バックナンバー
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              PDF版ダウンロード
            </Button>
          </div>
        </div>

        {/* Featured Banner */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-2">特集</Badge>
                <h3 className="text-2xl font-bold mb-2">リフォーム大賞2025 受賞作品特集</h3>
                <p className="text-blue-100 mb-4">
                  今年最も革新的なリフォーム事例を一挙公開。デザイン性と機能性を兼ね備えた作品をご紹介
                </p>
                <Button variant="secondary">
                  特集を読む
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <Award className="h-32 w-32 text-white/20" />
            </div>
          </CardContent>
        </Card>

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
                          ? 'bg-blue-50 text-blue-600'
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

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle>注目キーワード</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {featuredTopics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="記事を検索..."
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

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-video bg-slate-100 relative">
                    {article.isNew && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                        NEW
                      </Badge>
                    )}
                    {article.isPremium && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        プレミアム
                      </Badge>
                    )}
                    <div className="flex items-center justify-center h-full">
                      <FileText className="h-12 w-12 text-slate-300" />
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{article.category}</Badge>
                      <span className="text-xs text-slate-500">{article.date}</span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {article.subtitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.views.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Bookmark className={`h-4 w-4 ${article.bookmarked ? 'fill-current' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {article.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-slate-100 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardContent className="pt-0">
                    <Button className="w-full" variant="outline">
                      記事を読む
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                もっと記事を読む
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}