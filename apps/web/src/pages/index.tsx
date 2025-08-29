import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Users, 
  Shield, 
  CreditCard, 
  BookOpen,
  Building2,
  CheckCircle2,
  ArrowRight,
  Zap,
  Lock,
  BarChart3
} from 'lucide-react'

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              リフォーム産業新聞社 公式プラットフォーム
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              リフォーム業界の
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                デジタル化を加速
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              電子版・建材トレンド・公式ストア・研修プログラムを統合。
              <br />
              一つのIDで、すべてのサービスにアクセス可能。
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  無料で始める
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">デモを見る</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">主要機能</h2>
            <p className="text-lg text-slate-600">
              Reform Oneが提供する包括的なソリューション
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>統合ID管理</CardTitle>
                <CardDescription>
                  すべてのサービスを一つのIDで管理
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">電子版アクセス</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">建材トレンドデータベース</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">研修プログラム受講</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>法人課金管理</CardTitle>
                <CardDescription>
                  柔軟な料金プランと管理機能
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">プレミアムプラン（10万円/年）</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">エンタープライズ（20万円/年）</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">請求書一括管理</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>セキュリティ</CardTitle>
                <CardDescription>
                  エンタープライズグレードの保護
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">二要素認証（MFA）</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">ドメイン制限</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">監査ログ</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-slate-600">登録企業</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-slate-600">アクティブユーザー</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-slate-600">稼働率</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-slate-600">サポート体制</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">導入メリット</h2>
              <p className="text-lg text-slate-600">
                Reform Oneがもたらす価値
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">業務効率化</h3>
                  <p className="text-slate-600">
                    複数のサービスを一元管理し、業務プロセスを大幅に改善
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">コスト削減</h3>
                  <p className="text-slate-600">
                    統合プラットフォームによる運用コストの最適化
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">セキュリティ強化</h3>
                  <p className="text-slate-600">
                    エンタープライズレベルのセキュリティで情報を保護
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">スケーラビリティ</h3>
                  <p className="text-slate-600">
                    企業の成長に合わせて柔軟に拡張可能
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            今すぐReform Oneを始めましょう
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            30日間の無料トライアルで全機能をお試しいただけます
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">
                無料トライアルを開始
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" asChild>
              <Link href="/contact">お問い合わせ</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  )
}