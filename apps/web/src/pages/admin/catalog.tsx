import { useState } from 'react'
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Tag,
  Building2,
  Layers,
  Star,
  TrendingUp,
  ShoppingCart,
  FileText,
  Image,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const materials = [
    {
      id: 1,
      name: 'システムキッチン Lクラス',
      category: 'キッチン',
      brand: 'Panasonic',
      sku: 'PAN-L-KIT-001',
      price: '¥1,200,000〜',
      stock: 'カタログ商品',
      status: '掲載中',
      views: 3456,
      inquiries: 89,
      rating: 4.5,
      image: '/catalog/kitchen-1.jpg',
      tags: ['高級', '人気', 'エコ']
    },
    {
      id: 2,
      name: 'システムバス SYNLA',
      category: 'バスルーム',
      brand: 'TOTO',
      sku: 'TOTO-SYN-BAT-001',
      price: '¥980,000〜',
      stock: 'カタログ商品',
      status: '掲載中',
      views: 2890,
      inquiries: 67,
      rating: 4.3,
      image: '/catalog/bath-1.jpg',
      tags: ['人気', '節水']
    },
    {
      id: 3,
      name: 'トイレ アラウーノL150',
      category: 'トイレ',
      brand: 'Panasonic',
      sku: 'PAN-ARA-TOI-150',
      price: '¥350,000〜',
      stock: 'カタログ商品',
      status: '掲載中',
      views: 4123,
      inquiries: 112,
      rating: 4.7,
      image: '/catalog/toilet-1.jpg',
      tags: ['節水', '自動洗浄', 'ベストセラー']
    },
    {
      id: 4,
      name: '無垢フローリング オーク',
      category: '床材',
      brand: '朝日ウッドテック',
      sku: 'AWT-OAK-FLR-001',
      price: '¥12,000/㎡',
      stock: 'カタログ商品',
      status: '掲載中',
      views: 1567,
      inquiries: 34,
      rating: 4.2,
      image: '/catalog/floor-1.jpg',
      tags: ['天然木', '高級']
    },
    {
      id: 5,
      name: 'エコカラット プラス',
      category: '壁材',
      brand: 'LIXIL',
      sku: 'LIX-ECO-WAL-001',
      price: '¥8,000/㎡',
      stock: 'カタログ商品',
      status: '新規登録',
      views: 890,
      inquiries: 12,
      rating: 4.0,
      image: '/catalog/wall-1.jpg',
      tags: ['調湿', 'エコ', '新商品']
    }
  ]

  const categories = [
    { id: 'kitchen', name: 'キッチン', count: 156 },
    { id: 'bathroom', name: 'バスルーム', count: 98 },
    { id: 'toilet', name: 'トイレ', count: 67 },
    { id: 'floor', name: '床材', count: 234 },
    { id: 'wall', name: '壁材', count: 189 },
    { id: 'exterior', name: '外装材', count: 145 },
    { id: 'window', name: '窓・サッシ', count: 89 },
    { id: 'door', name: 'ドア', count: 112 }
  ]

  const brands = [
    { id: 'panasonic', name: 'Panasonic', count: 234 },
    { id: 'toto', name: 'TOTO', count: 156 },
    { id: 'lixil', name: 'LIXIL', count: 189 },
    { id: 'ykk', name: 'YKK AP', count: 98 },
    { id: 'daiken', name: 'DAIKEN', count: 76 }
  ]

  const promotions = [
    {
      id: 1,
      title: '春のキッチンフェア',
      period: '2024/3/1 - 3/31',
      products: 45,
      status: '実施中',
      type: 'campaign'
    },
    {
      id: 2,
      title: 'エコ商品特集',
      period: '2024/2/15 - 4/15',
      products: 89,
      status: '実施中',
      type: 'feature'
    },
    {
      id: 3,
      title: '新商品紹介キャンペーン',
      period: '2024/4/1 - 4/30',
      products: 23,
      status: '準備中',
      type: 'new'
    }
  ]

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">資材カタログ管理</h1>
            <p className="text-slate-600">建材・設備の商品カタログを管理</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              一括インポート
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              エクスポート
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              商品追加
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">総商品数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1,234</p>
              <p className="text-xs text-slate-500 mt-1">先月比 +56 商品</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">今月の閲覧数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">45.6K</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">+12.5%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">問い合わせ数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">892</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">+8.3%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">平均評価</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">4.3</p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">3,456 レビュー</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">商品一覧</TabsTrigger>
            <TabsTrigger value="categories">カテゴリー管理</TabsTrigger>
            <TabsTrigger value="brands">ブランド管理</TabsTrigger>
            <TabsTrigger value="promotions">特集・キャンペーン</TabsTrigger>
            <TabsTrigger value="analytics">分析</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">商品検索・フィルター</CardTitle>
                  <Button variant="ghost" size="sm">
                    フィルターをリセット
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="商品名・SKUで検索"
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
                      <SelectItem value="kitchen">キッチン</SelectItem>
                      <SelectItem value="bathroom">バスルーム</SelectItem>
                      <SelectItem value="toilet">トイレ</SelectItem>
                      <SelectItem value="floor">床材</SelectItem>
                      <SelectItem value="wall">壁材</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={brandFilter} onValueChange={setBrandFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="ブランド" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべてのブランド</SelectItem>
                      <SelectItem value="panasonic">Panasonic</SelectItem>
                      <SelectItem value="toto">TOTO</SelectItem>
                      <SelectItem value="lixil">LIXIL</SelectItem>
                      <SelectItem value="ykk">YKK AP</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="ステータス" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="active">掲載中</SelectItem>
                      <SelectItem value="new">新規登録</SelectItem>
                      <SelectItem value="draft">下書き</SelectItem>
                      <SelectItem value="archived">アーカイブ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>商品リスト</CardTitle>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    並び替え
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品情報</TableHead>
                      <TableHead>カテゴリー/ブランド</TableHead>
                      <TableHead>価格</TableHead>
                      <TableHead>パフォーマンス</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead className="text-right">アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Image className="h-8 w-8 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-medium">{material.name}</p>
                              <p className="text-xs text-slate-500">SKU: {material.sku}</p>
                              <div className="flex gap-1 mt-1">
                                {material.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{material.category}</p>
                            <p className="text-sm text-slate-500">{material.brand}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{material.price}</p>
                          <p className="text-xs text-slate-500">{material.stock}</p>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Eye className="h-3 w-3 text-slate-400" />
                              <span className="text-sm">{material.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-3 w-3 text-slate-400" />
                              <span className="text-sm">{material.inquiries}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm">{material.rating}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {material.status === '掲載中' && (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              掲載中
                            </Badge>
                          )}
                          {material.status === '新規登録' && (
                            <Badge className="bg-blue-100 text-blue-700">
                              <Clock className="mr-1 h-3 w-3" />
                              新規登録
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
                              <Trash2 className="h-4 w-4" />
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

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>カテゴリー一覧</CardTitle>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    カテゴリー追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-slate-500 mt-1">{category.count} 商品</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="brands" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>ブランド一覧</CardTitle>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    ブランド追加
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ブランド名</TableHead>
                      <TableHead>商品数</TableHead>
                      <TableHead>人気度</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead className="text-right">アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brands.map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-slate-400" />
                            </div>
                            <p className="font-medium">{brand.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>{brand.count}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700">アクティブ</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
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

          <TabsContent value="promotions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>実施中・予定のキャンペーン</CardTitle>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    キャンペーン作成
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {promotions.map((promo) => (
                    <Card key={promo.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              promo.type === 'campaign' ? 'bg-orange-100' :
                              promo.type === 'feature' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              {promo.type === 'campaign' && <Tag className="h-6 w-6 text-orange-600" />}
                              {promo.type === 'feature' && <Star className="h-6 w-6 text-blue-600" />}
                              {promo.type === 'new' && <TrendingUp className="h-6 w-6 text-green-600" />}
                            </div>
                            <div>
                              <p className="font-medium">{promo.title}</p>
                              <p className="text-sm text-slate-500 mt-1">期間: {promo.period}</p>
                              <p className="text-sm text-slate-500">対象商品: {promo.products}点</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {promo.status === '実施中' && (
                              <Badge className="bg-green-100 text-green-700">実施中</Badge>
                            )}
                            {promo.status === '準備中' && (
                              <Badge className="bg-yellow-100 text-yellow-700">準備中</Badge>
                            )}
                            <Button variant="outline" size="sm">編集</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>カテゴリー別人気度</CardTitle>
                  <CardDescription>過去30日間の閲覧数ベース</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['キッチン', 'バスルーム', 'トイレ', '床材', '壁材'].map((cat, index) => (
                      <div key={cat}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{cat}</span>
                          <span className="text-sm text-slate-500">{(95 - index * 10)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${95 - index * 10}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>問い合わせトレンド</CardTitle>
                  <CardDescription>週次の問い合わせ数推移</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-end justify-between gap-2">
                    {[65, 80, 45, 90, 70, 85, 75].map((height, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-blue-500 rounded-t" 
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-slate-500">
                          {['月', '火', '水', '木', '金', '土', '日'][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>商品パフォーマンスサマリー</CardTitle>
                <CardDescription>主要指標の概要</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">平均閲覧数</span>
                    </div>
                    <p className="text-xl font-bold">2,345</p>
                    <p className="text-xs text-green-600 mt-1">+12.3%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">問い合わせ率</span>
                    </div>
                    <p className="text-xl font-bold">3.2%</p>
                    <p className="text-xs text-green-600 mt-1">+0.5%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">平均評価</span>
                    </div>
                    <p className="text-xl font-bold">4.3</p>
                    <p className="text-xs text-slate-500 mt-1">変化なし</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">新規登録</span>
                    </div>
                    <p className="text-xl font-bold">56</p>
                    <p className="text-xs text-blue-600 mt-1">今月</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}