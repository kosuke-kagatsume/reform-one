import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Check, X, ArrowRight, Zap, Shield, Users, Building } from 'lucide-react'

export default function Pricing() {
  const plans = [
    {
      name: 'スターター',
      description: '小規模チームに最適',
      price: '無料',
      priceNote: '最大5ユーザーまで',
      popular: false,
      features: [
        { name: '基本的な電子版アクセス', included: true },
        { name: '建材トレンドデータベース（限定）', included: true },
        { name: 'メールサポート', included: true },
        { name: '5ユーザーまで', included: true },
        { name: 'API アクセス', included: false },
        { name: 'カスタムドメイン', included: false },
        { name: '優先サポート', included: false },
        { name: '監査ログ', included: false },
      ],
      cta: 'スタートする',
      ctaLink: '/signup'
    },
    {
      name: 'プレミアム',
      description: '成長中の企業に最適',
      price: '¥100,000',
      priceNote: '年額（税別）',
      popular: true,
      features: [
        { name: 'すべての電子版コンテンツ', included: true },
        { name: '建材トレンドデータベース（フルアクセス）', included: true },
        { name: '研修プログラム受講', included: true },
        { name: '50ユーザーまで', included: true },
        { name: 'API アクセス（制限付き）', included: true },
        { name: 'カスタムドメイン', included: true },
        { name: '優先サポート', included: false },
        { name: '監査ログ', included: false },
      ],
      cta: '無料トライアル開始',
      ctaLink: '/signup?plan=premium'
    },
    {
      name: 'エンタープライズ',
      description: '大規模組織向け',
      price: '¥200,000',
      priceNote: '年額（税別）〜',
      popular: false,
      features: [
        { name: 'すべてのプレミアム機能', included: true },
        { name: '無制限ユーザー', included: true },
        { name: 'API アクセス（無制限）', included: true },
        { name: 'カスタムドメイン', included: true },
        { name: 'SSO（シングルサインオン）', included: true },
        { name: '専任サポート', included: true },
        { name: '監査ログ（フルアクセス）', included: true },
        { name: 'SLA保証', included: true },
      ],
      cta: 'お問い合わせ',
      ctaLink: '/contact?plan=enterprise'
    }
  ]

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4" variant="secondary">
              料金プラン
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              あなたのビジネスに最適なプランを選択
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              30日間の無料トライアルですべての機能をお試しいただけます。
              クレジットカード不要。
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-blue-600 shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      おすすめ
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-4xl font-bold">{plan.price}</p>
                    <p className="text-sm text-slate-500">{plan.priceNote}</p>
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-slate-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${
                          feature.included ? 'text-slate-700' : 'text-slate-400'
                        }`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href={plan.ctaLink}>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">エンタープライズ機能</h2>
            <p className="text-lg text-slate-600">
              大規模組織向けの高度な機能とサポート
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">エンタープライズセキュリティ</h3>
              <p className="text-sm text-slate-600">
                SSO、MFA、IP制限など高度なセキュリティ機能
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">無制限ユーザー</h3>
              <p className="text-sm text-slate-600">
                組織の成長に合わせて無制限にユーザーを追加
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">優先サポート</h3>
              <p className="text-sm text-slate-600">
                専任のカスタマーサクセスマネージャー
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">カスタマイズ</h3>
              <p className="text-sm text-slate-600">
                組織のニーズに合わせたカスタム機能開発
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">よくある質問</h2>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">無料トライアルに含まれる機能は？</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    30日間の無料トライアル期間中は、プレミアムプランのすべての機能を無制限でご利用いただけます。
                    クレジットカードの登録は不要で、期間終了後に自動的に課金されることはありません。
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">プランの変更やキャンセルは可能ですか？</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    はい、いつでもプランの変更やキャンセルが可能です。
                    アップグレードの場合は即座に反映され、ダウングレードの場合は次回請求サイクルから適用されます。
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">請求方法について教えてください</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    年次請求を基本としており、銀行振込またはクレジットカードでのお支払いが可能です。
                    エンタープライズプランでは、四半期ごとの請求にも対応しています。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            今すぐ始めましょう
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            30日間の無料トライアルで、Reform Oneの全機能をお試しください
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">
                無料トライアルを開始
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" asChild>
              <Link href="/contact">営業担当に相談</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  )
}