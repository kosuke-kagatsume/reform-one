import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  Search,
  Filter,
  Heart,
  Download,
  Info,
  ShoppingCart,
  Star,
  TrendingUp,
  Award,
  Zap,
  Droplets,
  Flame,
  Wind,
  Home,
  Grid,
  List,
  ChevronRight,
  Building,
  Wrench,
  Palette,
  Shield
} from 'lucide-react'

export default function MaterialsCatalog() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [priceRange, setPriceRange] = useState('all')

  // 建材カタログデータ
  const materials = [
    {
      id: 1,
      name: '高断熱複層ガラス「エコシールド」',
      manufacturer: 'YKK AP',
      category: '窓・サッシ',
      description: '業界最高クラスの断熱性能を実現。Low-E複層ガラスで冷暖房効率を大幅改善',
      price: '¥45,000〜/㎡',
      features: ['断熱性能 U値1.0', '遮音性能 T-3等級', '結露防止'],
      rating: 4.8,
      reviews: 234,
      isNew: true,
      isFavorite: false,
      certification: ['省エネ基準適合', 'JIS認証'],
      image: '/api/placeholder/300/300'
    },
    {
      id: 2,
      name: '無垢フローリング「ナチュラルオーク」',
      manufacturer: '朝日ウッドテック',
      category: '床材',
      description: '天然オーク材100%使用。自然な木目と温かみのある質感が特徴',
      price: '¥12,000〜/㎡',
      features: ['厚さ15mm', 'UV塗装仕上げ', 'F☆☆☆☆'],
      rating: 4.6,
      reviews: 189,
      isNew: false,
      isFavorite: true,
      certification: ['F☆☆☆☆', 'エコマーク'],
      image: '/api/placeholder/300/300'
    },
    {
      id: 3,
      name: '調湿建材「エコカラット プラス」',
      manufacturer: 'LIXIL',
      category: '壁材',
      description: '湿度を自動調整し、カビ・結露を防ぐ。消臭効果も併せ持つ機能性壁材',
      price: '¥6,800〜/㎡',
      features: ['調湿機能', '消臭効果', 'VOC低減'],
      rating: 4.7,
      reviews: 312,
      isNew: false,
      isFavorite: false,
      certification: ['調湿建材認定', 'グリーン購入法適合'],
      image: '/api/placeholder/300/300'
    },
    {
      id: 4,
      name: 'システムキッチン「ラクエラ」',
      manufacturer: 'クリナップ',
      category: 'キッチン',
      description: 'ステンレスエコキャビネット採用。清潔で長持ち、お手入れ簡単',
      price: '¥380,000〜',
      features: ['ステンレス製', '静音設計', '省エネ'],
      rating: 4.5,
      reviews: 156,
      isNew: true,
      isFavorite: true,
      certification: ['グッドデザイン賞', 'エコマーク'],
      image: '/api/placeholder/300/300'
    },
    {
      id: 5,
      name: 'エコジョーズ給湯器「プレミアム」',
      manufacturer: 'リンナイ',
      category: '給湯器',
      description: '熱効率95%の高効率給湯器。ガス代を年間約13,000円節約',
      price: '¥180,000〜',
      features: ['熱効率95%', 'CO2削減', '10年保証'],
      rating: 4.9,
      reviews: 423,
      isNew: false,
      isFavorite: false,
      certification: ['省エネ大賞', 'エコジョーズ認定'],
      image: '/api/placeholder/300/300'
    },
    {
      id: 6,
      name: '高性能断熱材「アクリアネクスト」',
      manufacturer: '旭ファイバーグラス',
      category: '断熱材',
      description: '次世代省エネ基準をクリア。高い断熱性能と施工性を両立',
      price: '¥2,500〜/㎡',
      features: ['熱伝導率0.038W', '不燃材料', 'ノンホルム'],
      rating: 4.4,
      reviews: 98,
      isNew: true,
      isFavorite: false,
      certification: ['JIS A 9521', 'F☆☆☆☆'],
      image: '/api/placeholder/300/300'
    }
  ]

  const categories = [
    { id: 'all', name: 'すべて', icon: Grid, count: 1250 },
    { id: 'window', name: '窓・サッシ', icon: Home, count: 156 },
    { id: 'floor', name: '床材', icon: Package, count: 234 },
    { id: 'wall', name: '壁材', icon: Building, count: 189 },
    { id: 'kitchen', name: 'キッチン', icon: Wrench, count: 98 },
    { id: 'bathroom', name: 'バスルーム', icon: Droplets, count: 112 },
    { id: 'heating', name: '給湯器', icon: Flame, count: 67 },
    { id: 'insulation', name: '断熱材', icon: Shield, count: 145 },
    { id: 'exterior', name: '外装材', icon: Building, count: 249 }
  ]

  const manufacturers = [
    'LIXIL',
    'YKK AP',
    'TOTO',
    'パナソニック',
    'クリナップ',
    '旭ファイバーグラス',
    '朝日ウッドテック'
  ]

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          material.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
                           material.category.toLowerCase().includes(selectedCategory)
    return matchesSearch && matchesCategory
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">建材カタログ</h2>
            <p className="text-slate-600">最新の建材・設備機器を検索</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Heart className="h-4 w-4 mr-2" />
              お気に入り
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              カタログ請求
            </Button>
          </div>
        </div>

        {/* Featured Banner */}
        <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-2">注目</Badge>
                <h3 className="text-2xl font-bold mb-2">省エネ建材特集 2025</h3>
                <p className="text-green-100 mb-4">
                  ZEH基準対応の高性能建材を厳選。補助金対象製品も多数掲載
                </p>
                <Button variant="secondary">
                  特集を見る
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <Zap className="h-32 w-32 text-white/20" />
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
                          ? 'bg-green-50 text-green-600'
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

            {/* Manufacturers */}
            <Card>
              <CardHeader>
                <CardTitle>メーカー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {manufacturers.map((manufacturer) => (
                    <label key={manufacturer} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{manufacturer}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price Range */}
            <Card>
              <CardHeader>
                <CardTitle>価格帯</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="all">すべて</option>
                  <option value="0-10000">〜¥10,000</option>
                  <option value="10000-50000">¥10,000〜¥50,000</option>
                  <option value="50000-100000">¥50,000〜¥100,000</option>
                  <option value="100000+">¥100,000〜</option>
                </select>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and View Toggle */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="建材名、メーカー名で検索..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    詳細検索
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Materials Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-lg transition-shadow">
                  {viewMode === 'grid' ? (
                    <>
                      <div className="aspect-square bg-slate-100 relative">
                        {material.isNew && (
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                            NEW
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          <Heart className={`h-4 w-4 ${material.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-16 w-16 text-slate-300" />
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <Badge variant="outline" className="w-fit mb-2">
                          {material.category}
                        </Badge>
                        <CardTitle className="text-base line-clamp-2">{material.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {material.manufacturer}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {material.description}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(material.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">
                            {material.rating} ({material.reviews})
                          </span>
                        </div>
                        <p className="font-semibold text-lg mb-3">{material.price}</p>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            詳細を見る
                          </Button>
                          <Button size="sm" variant="outline">
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </>
                  ) : (
                    <div className="flex gap-4 p-4">
                      <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-12 w-12 text-slate-300" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge variant="outline" className="mb-2">
                              {material.category}
                            </Badge>
                            <h3 className="font-semibold text-lg">{material.name}</h3>
                            <p className="text-sm text-slate-500">{material.manufacturer}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {material.isNew && (
                              <Badge className="bg-red-500 text-white">NEW</Badge>
                            )}
                            <Button variant="ghost" size="sm">
                              <Heart className={`h-4 w-4 ${material.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{material.description}</p>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(material.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-slate-500 ml-1">
                              {material.rating} ({material.reviews})
                            </span>
                          </div>
                          <span className="font-semibold text-lg">{material.price}</span>
                        </div>
                        <div className="flex gap-2">
                          {material.certification.map((cert) => (
                            <Badge key={cert} variant="outline" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm">詳細を見る</Button>
                        <Button size="sm" variant="outline">
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline">
                もっと見る
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}