import { useState } from 'react'
import {
  Newspaper,
  Plus,
  Search,
  Filter,
  Calendar,
  Upload,
  Edit,
  Trash2,
  Eye,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Image,
  Video,
  Link,
  Tag,
  Users,
  TrendingUp,
  Download,
  Archive,
  Star,
  MessageSquare,
  Share2,
  BarChart3,
  Globe,
  Lock,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import AdminLayout from '@/components/layout/admin-layout'

export default function NewspaperPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editionFilter, setEditionFilter] = useState('all')

  const articles = [
    {
      id: 1,
      title: '2024年リフォーム市場、過去最高の6.8兆円規模に',
      category: 'トップニュース',
      author: '田中 健太',
      edition: '2024年3月号',
      publishDate: '2024/03/01',
      status: '公開中',
      views: 12567,
      shares: 234,
      comments: 45,
      featured: true,
      premium: false,
      tags: ['市場動向', '統計', '速報']
    },
    {
      id: 2,
      title: '省エネリフォーム補助金、申請期限延長へ',
      category: '政策・制度',
      author: '佐藤 美咲',
      edition: '2024年3月号',
      publishDate: '2024/03/02',
      status: '公開中',
      views: 8934,
      shares: 189,
      comments: 23,
      featured: false,
      premium: false,
      tags: ['補助金', '省エネ', '政策']
    },
    {
      id: 3,
      title: '【独占インタビュー】大手リフォーム会社社長が語る今後の戦略',
      category: 'インタビュー',
      author: '山田 太郎',
      edition: '2024年3月号',
      publishDate: '2024/03/05',
      status: '公開中',
      views: 6789,
      shares: 145,
      comments: 34,
      featured: true,
      premium: true,
      tags: ['インタビュー', '経営戦略', 'プレミアム']
    },
    {
      id: 4,
      title: 'AI活用で変わるリフォーム営業の最前線',
      category: 'テクノロジー',
      author: '鈴木 花子',
      edition: '2024年3月号',
      publishDate: '2024/03/08',
      status: '編集中',
      views: 0,
      shares: 0,
      comments: 0,
      featured: false,
      premium: false,
      tags: ['AI', 'DX', '営業']
    },
    {
      id: 5,
      title: '職人不足問題、外国人材活用の現状と課題',
      category: '業界動向',
      author: '高橋 次郎',
      edition: '2024年3月号',
      publishDate: '2024/03/10',
      status: '査読中',
      views: 0,
      shares: 0,
      comments: 0,
      featured: false,
      premium: false,
      tags: ['人材', '外国人労働者', '課題']
    }
  ]

  const editions = [
    {
      id: 1,
      name: '2024年3月号',
      publishDate: '2024/03/01',
      articles: 45,
      status: '公開中',
      views: 89234,
      subscribers: 8234
    },
    {
      id: 2,
      name: '2024年2月号',
      publishDate: '2024/02/01',
      articles: 42,
      status: '公開中',
      views: 76543,
      subscribers: 8156
    },
    {
      id: 3,
      name: '2024年4月号',
      publishDate: '2024/04/01',
      articles: 12,
      status: '準備中',
      views: 0,
      subscribers: 8234
    }
  ]

  const categories = [
    { name: 'トップニュース', count: 156, color: 'red' },
    { name: '政策・制度', count: 89, color: 'blue' },
    { name: '業界動向', count: 234, color: 'green' },
    { name: 'テクノロジー', count: 67, color: 'purple' },
    { name: 'インタビュー', count: 45, color: 'orange' },
    { name: '地域情報', count: 178, color: 'yellow' },
    { name: '商品・サービス', count: 123, color: 'pink' },
    { name: '統計・データ', count: 56, color: 'indigo' }
  ]

  const articleStats = {
    totalViews: '234.5K',
    avgReadTime: '4:32',
    shareRate: '12.3%',
    commentRate: '3.2%'
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">電子新聞管理</h1>
            <p className="text-slate-600">リフォーム産業新聞の記事作成・配信管理</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              発行スケジュール
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              レポート出力
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規記事作成
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">今月の総閲覧数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{articleStats.totalViews}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">+15.2% 前月比</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">平均読了時間</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{articleStats.avgReadTime}</p>
              <p className="text-xs text-slate-500 mt-1">目標: 5:00</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">シェア率</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{articleStats.shareRate}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">+2.1%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">コメント率</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{articleStats.commentRate}</p>
              <p className="text-xs text-slate-500 mt-1">エンゲージメント指標</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="articles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="articles">記事管理</TabsTrigger>
            <TabsTrigger value="editions">号管理</TabsTrigger>
            <TabsTrigger value="editor">記事エディター</TabsTrigger>
            <TabsTrigger value="categories">カテゴリー</TabsTrigger>
            <TabsTrigger value="subscribers">購読者</TabsTrigger>
            <TabsTrigger value="analytics">分析</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">記事検索・フィルター</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="記事タイトル・著者で検索"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリー" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべてのカテゴリー</SelectItem>
                      <SelectItem value="top">トップニュース</SelectItem>
                      <SelectItem value="policy">政策・制度</SelectItem>
                      <SelectItem value="industry">業界動向</SelectItem>
                      <SelectItem value="tech">テクノロジー</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="ステータス" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="published">公開中</SelectItem>
                      <SelectItem value="draft">下書き</SelectItem>
                      <SelectItem value="editing">編集中</SelectItem>
                      <SelectItem value="review">査読中</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={editionFilter} onValueChange={setEditionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="発行号" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべての号</SelectItem>
                      <SelectItem value="202403">2024年3月号</SelectItem>
                      <SelectItem value="202402">2024年2月号</SelectItem>
                      <SelectItem value="202404">2024年4月号</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Articles Table */}
            <Card>
              <CardHeader>
                <CardTitle>記事一覧</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>記事情報</TableHead>
                      <TableHead>著者/発行号</TableHead>
                      <TableHead>エンゲージメント</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead className="text-right">アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{article.title}</p>
                              {article.featured && (
                                <Badge className="bg-yellow-100 text-yellow-700">
                                  <Star className="mr-1 h-3 w-3" />
                                  注目
                                </Badge>
                              )}
                              {article.premium && (
                                <Badge className="bg-purple-100 text-purple-700">
                                  <Zap className="mr-1 h-3 w-3" />
                                  プレミアム
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {article.category}
                              </Badge>
                              {article.tags.map((tag) => (
                                <span key={tag} className="text-xs text-slate-500">#{tag}</span>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{article.author}</p>
                            <p className="text-xs text-slate-500">{article.edition}</p>
                            <p className="text-xs text-slate-500">{article.publishDate}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Eye className="h-3 w-3 text-slate-400" />
                              <span className="text-sm">{article.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Share2 className="h-3 w-3 text-slate-400" />
                              <span className="text-sm">{article.shares}</span>
                              <MessageSquare className="h-3 w-3 text-slate-400 ml-2" />
                              <span className="text-sm">{article.comments}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {article.status === '公開中' && (
                            <Badge className="bg-green-100 text-green-700">
                              <Globe className="mr-1 h-3 w-3" />
                              公開中
                            </Badge>
                          )}
                          {article.status === '編集中' && (
                            <Badge className="bg-yellow-100 text-yellow-700">
                              <Edit className="mr-1 h-3 w-3" />
                              編集中
                            </Badge>
                          )}
                          {article.status === '査読中' && (
                            <Badge className="bg-blue-100 text-blue-700">
                              <Clock className="mr-1 h-3 w-3" />
                              査読中
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>発行号管理</CardTitle>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    新規号作成
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {editions.map((edition) => (
                    <Card key={edition.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold">{edition.name}</p>
                            <p className="text-sm text-slate-500">発行日: {edition.publishDate}</p>
                          </div>
                          {edition.status === '公開中' && (
                            <Badge className="bg-green-100 text-green-700">公開中</Badge>
                          )}
                          {edition.status === '準備中' && (
                            <Badge className="bg-yellow-100 text-yellow-700">準備中</Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">記事数</span>
                            <span className="font-medium">{edition.articles}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">総閲覧数</span>
                            <span className="font-medium">{edition.views.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">購読者数</span>
                            <span className="font-medium">{edition.subscribers.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            編集
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            プレビュー
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>記事エディター</CardTitle>
                <CardDescription>新規記事の作成・編集</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">記事タイトル</label>
                    <Input placeholder="記事のタイトルを入力" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">カテゴリー</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリーを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">トップニュース</SelectItem>
                        <SelectItem value="policy">政策・制度</SelectItem>
                        <SelectItem value="industry">業界動向</SelectItem>
                        <SelectItem value="tech">テクノロジー</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">サブタイトル</label>
                  <Input placeholder="サブタイトル（オプション）" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">本文</label>
                  <Textarea 
                    placeholder="記事の本文を入力..." 
                    className="min-h-[300px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">発行号</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="発行号を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="202403">2024年3月号</SelectItem>
                        <SelectItem value="202404">2024年4月号</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">公開日時</label>
                    <Input type="datetime-local" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">記事タイプ</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="タイプを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">標準</SelectItem>
                        <SelectItem value="featured">注目記事</SelectItem>
                        <SelectItem value="premium">プレミアム</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">タグ</label>
                  <Input placeholder="タグをカンマ区切りで入力（例: AI, DX, 省エネ）" />
                </div>

                <div className="border-t pt-4">
                  <label className="text-sm font-medium mb-2 block">添付ファイル</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-4">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <p className="mt-2 text-sm text-slate-600">画像・動画・PDFをドロップまたは選択</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        ファイルを選択
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline">下書き保存</Button>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    プレビュー
                  </Button>
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    査読に送信
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>カテゴリー管理</CardTitle>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    カテゴリー追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <Card key={category.name}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Tag className={`h-5 w-5 text-${category.color}-500`} />
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{category.count} 記事</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">総購読者数</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">8,234</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">+156 今月</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">有料購読者</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">5,678</p>
                  <p className="text-xs text-slate-500 mt-1">全体の69%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">解約率</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">2.3%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">+0.3%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>購読者セグメント</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">大手リフォーム会社</span>
                      <span className="text-sm text-slate-500">2,345社</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '28%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">中堅リフォーム会社</span>
                      <span className="text-sm text-slate-500">3,456社</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '42%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">工務店・個人事業主</span>
                      <span className="text-sm text-slate-500">2,433社</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>人気記事ランキング</CardTitle>
                  <CardDescription>過去30日間</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { title: '2024年リフォーム市場予測', views: 12567, trend: 'up' },
                      { title: '省エネ補助金完全ガイド', views: 9834, trend: 'up' },
                      { title: 'AI活用事例特集', views: 7623, trend: 'stable' },
                      { title: '職人不足対策レポート', views: 6234, trend: 'down' },
                      { title: '新商品トレンド2024', views: 5123, trend: 'up' }
                    ].map((article, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-500">#{index + 1}</span>
                          <span className="text-sm">{article.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">{article.views.toLocaleString()}</span>
                          {article.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                          {article.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>カテゴリー別エンゲージメント</CardTitle>
                  <CardDescription>シェア率・コメント率</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { category: 'トップニュース', share: 85, comment: 65 },
                      { category: 'インタビュー', share: 78, comment: 82 },
                      { category: 'テクノロジー', share: 72, comment: 58 },
                      { category: '政策・制度', share: 68, comment: 45 },
                      { category: '業界動向', share: 65, comment: 52 }
                    ].map((cat) => (
                      <div key={cat.category}>
                        <p className="text-sm font-medium mb-2">{cat.category}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Share2 className="h-3 w-3 text-slate-400" />
                            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${cat.share}%` }} />
                            </div>
                            <span className="text-xs text-slate-500">{cat.share}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-3 w-3 text-slate-400" />
                            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${cat.comment}%` }} />
                            </div>
                            <span className="text-xs text-slate-500">{cat.comment}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>読者行動分析</CardTitle>
                <CardDescription>時間帯別アクセス傾向</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-1">
                  {[30, 25, 20, 18, 22, 35, 48, 65, 72, 68, 58, 62, 75, 70, 65, 68, 72, 78, 65, 52, 45, 38, 32, 28].map((height, index) => (
                    <div key={index} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${height}%` }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-slate-500">0時</span>
                  <span className="text-xs text-slate-500">6時</span>
                  <span className="text-xs text-slate-500">12時</span>
                  <span className="text-xs text-slate-500">18時</span>
                  <span className="text-xs text-slate-500">24時</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}