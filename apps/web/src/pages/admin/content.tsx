import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  FileText,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowUpDown,
  Image,
  Video,
  FileAudio,
  Upload
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

export default function ContentPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('articles')

  const articles = [
    {
      id: 1,
      title: '2024年リフォーム市場動向レポート',
      category: '市場分析',
      author: '山田太郎',
      department: '編集部',
      status: 'published',
      views: 15234,
      publishedAt: '2024-01-15',
      updatedAt: '2時間前',
      type: 'article'
    },
    {
      id: 2,
      title: '省エネリフォーム補助金制度の完全ガイド',
      category: '制度・法規',
      author: '佐藤花子',
      department: '企画開発部',
      status: 'draft',
      views: 0,
      publishedAt: null,
      updatedAt: '1日前',
      type: 'article'
    },
    {
      id: 3,
      title: '最新キッチンリフォームトレンド',
      category: 'トレンド',
      author: '鈴木一郎',
      department: '編集部',
      status: 'review',
      views: 0,
      publishedAt: null,
      updatedAt: '3時間前',
      type: 'article'
    },
    {
      id: 4,
      title: '職人不足問題への対応策',
      category: '業界課題',
      author: '田中美咲',
      department: '編集部',
      status: 'published',
      views: 8921,
      publishedAt: '2024-01-10',
      updatedAt: '1週間前',
      type: 'article'
    },
    {
      id: 5,
      title: 'デジタルツール活用事例集',
      category: 'DX',
      author: '高橋健',
      department: '企画開発部',
      status: 'scheduled',
      views: 0,
      publishedAt: '2024-02-01',
      updatedAt: '5時間前',
      type: 'article'
    }
  ]

  const videos = [
    {
      id: 1,
      title: 'リフォーム現場の安全管理',
      duration: '15:32',
      author: '山田太郎',
      status: 'published',
      views: 3421,
      publishedAt: '2024-01-12',
      type: 'video'
    },
    {
      id: 2,
      title: '最新工具の使い方講座',
      duration: '22:45',
      author: '鈴木一郎',
      status: 'processing',
      views: 0,
      publishedAt: null,
      type: 'video'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            公開中
          </Badge>
        )
      case 'draft':
        return (
          <Badge className="bg-slate-100 text-slate-700">
            <Edit className="h-3 w-3 mr-1" />
            下書き
          </Badge>
        )
      case 'review':
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" />
            レビュー中
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <Calendar className="h-3 w-3 mr-1" />
            予約投稿
          </Badge>
        )
      case 'processing':
        return (
          <Badge className="bg-purple-100 text-purple-700">
            <Clock className="h-3 w-3 mr-1" />
            処理中
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4 text-slate-400" />
      case 'video':
        return <Video className="h-4 w-4 text-slate-400" />
      case 'audio':
        return <FileAudio className="h-4 w-4 text-slate-400" />
      case 'image':
        return <Image className="h-4 w-4 text-slate-400" />
      default:
        return <FileText className="h-4 w-4 text-slate-400" />
    }
  }

  const stats = [
    {
      title: '総コンテンツ数',
      value: '1,234',
      change: '+45',
      changeLabel: '今月',
      icon: FileText,
      color: 'blue'
    },
    {
      title: '公開中',
      value: '892',
      change: '+12',
      changeLabel: '今週',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'レビュー待ち',
      value: '23',
      change: '5',
      changeLabel: '件',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: '総閲覧数',
      value: '2.3M',
      change: '+15%',
      changeLabel: '前月比',
      icon: Eye,
      color: 'purple'
    }
  ]

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">コンテンツ管理</h1>
          <p className="text-slate-600">記事・動画・資料の作成と管理</p>
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

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-between items-center">
                  <TabsList>
                    <TabsTrigger value="articles">記事</TabsTrigger>
                    <TabsTrigger value="videos">動画</TabsTrigger>
                    <TabsTrigger value="materials">資料</TabsTrigger>
                    <TabsTrigger value="newsletters">メルマガ</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      インポート
                    </Button>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      新規作成
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="タイトル・著者で検索..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="ステータス" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="published">公開中</SelectItem>
                      <SelectItem value="draft">下書き</SelectItem>
                      <SelectItem value="review">レビュー中</SelectItem>
                      <SelectItem value="scheduled">予約投稿</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="カテゴリー" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="market">市場分析</SelectItem>
                      <SelectItem value="trend">トレンド</SelectItem>
                      <SelectItem value="regulation">制度・法規</SelectItem>
                      <SelectItem value="dx">DX</SelectItem>
                      <SelectItem value="issue">業界課題</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <TabsContent value="articles" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>タイトル</TableHead>
                          <TableHead>カテゴリー</TableHead>
                          <TableHead>著者</TableHead>
                          <TableHead>ステータス</TableHead>
                          <TableHead>閲覧数</TableHead>
                          <TableHead>公開日</TableHead>
                          <TableHead className="text-right">アクション</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {articles.map((article) => (
                          <TableRow key={article.id}>
                            <TableCell>{getTypeIcon(article.type)}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{article.title}</p>
                                <p className="text-xs text-slate-500">更新: {article.updatedAt}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{article.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm">{article.author}</p>
                                <p className="text-xs text-slate-500">{article.department}</p>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(article.status)}</TableCell>
                            <TableCell>
                              {article.views > 0 ? (
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3 text-slate-400" />
                                  <span className="text-sm">{article.views.toLocaleString()}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {article.publishedAt || <span className="text-slate-400">-</span>}
                            </TableCell>
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
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    プレビュー
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    編集
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="mr-2 h-4 w-4" />
                                    複製
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    共有
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    削除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="videos" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => (
                      <Card key={video.id}>
                        <div className="aspect-video bg-slate-100 relative">
                          <Video className="absolute inset-0 m-auto h-12 w-12 text-slate-400" />
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                            {video.duration}
                          </div>
                        </div>
                        <CardHeader>
                          <CardTitle className="text-base">{video.title}</CardTitle>
                          <CardDescription>
                            {video.author} • {video.views > 0 ? `${video.views.toLocaleString()} 回視聴` : '未公開'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            {getStatusBadge(video.status)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  プレビュー
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  編集
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  削除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="materials" className="mt-4">
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">資料はまだありません</p>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      資料をアップロード
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="newsletters" className="mt-4">
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">メルマガはまだありません</p>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      メルマガを作成
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardHeader>
        </Card>
      </div>
    </AdminLayout>
  )
}

// Add missing import
import { Mail } from 'lucide-react'