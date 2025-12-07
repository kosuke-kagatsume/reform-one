import { useState, useEffect } from 'react'
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
  const [loading, setLoading] = useState(true)
  const [materials, setMaterials] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [manufacturers, setManufacturers] = useState<string[]>([])

  useEffect(() => {
    fetchMaterials()
  }, [selectedCategory, searchQuery])

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)

      const res = await fetch(`/api/dashboard/materials-catalog?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setMaterials(data.materials || [])
        if (data.categories) {
          setCategories(data.categories.map((cat: any) => ({
            ...cat,
            icon: cat.id === 'all' ? Grid :
                  cat.id === 'window' ? Home :
                  cat.id === 'floor' ? Package :
                  cat.id === 'wall' ? Building :
                  cat.id === 'kitchen' ? Wrench :
                  cat.id === 'bathroom' ? Droplets :
                  cat.id === 'heating' ? Flame :
                  cat.id === 'insulation' ? Shield : Building
          })))
        }
        if (data.manufacturers) {
          setManufacturers(data.manufacturers)
        }
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const defaultCategories = [
    { id: 'all', name: 'すべて', icon: Grid, count: 0 },
    { id: 'window', name: '窓・サッシ', icon: Home, count: 0 },
    { id: 'floor', name: '床材', icon: Package, count: 0 },
    { id: 'wall', name: '壁材', icon: Building, count: 0 },
    { id: 'kitchen', name: 'キッチン', icon: Wrench, count: 0 },
    { id: 'bathroom', name: 'バスルーム', icon: Droplets, count: 0 },
    { id: 'heating', name: '給湯器', icon: Flame, count: 0 },
    { id: 'insulation', name: '断熱材', icon: Shield, count: 0 },
    { id: 'exterior', name: '外装材', icon: Building, count: 0 }
  ]

  const displayCategories = categories.length > 0 ? categories : defaultCategories

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
                  {displayCategories.map((category) => (
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
                          {material.certification?.map((cert: string) => (
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