import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Yen,
  ArrowLeft,
  Building2,
  CheckCircle
} from 'lucide-react'

interface OpenSeminar {
  id: string
  title: string
  description: string | null
  instructor: string | null
  imageUrl: string | null
  scheduledAt: string
  duration: number | null
  location: string | null
  price: number
  capacity: number | null
  isPublished: boolean
  _count?: { registrations: number }
}

export default function OpenSeminarDetailPage() {
  const router = useRouter()
  const { id, success } = router.query
  const [seminar, setSeminar] = useState<OpenSeminar | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
  })

  useEffect(() => {
    if (id) {
      fetchSeminar()
    }
  }, [id])

  useEffect(() => {
    if (success === 'true') {
      setShowSuccess(true)
    }
  }, [success])

  const fetchSeminar = async () => {
    try {
      const res = await fetch('/api/open-seminars')
      if (res.ok) {
        const data = await res.json()
        const found = data.find((s: OpenSeminar) => s.id === id)
        setSeminar(found || null)
      }
    } catch (error) {
      console.error('Failed to fetch seminar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!seminar) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/open-seminars/${seminar.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.checkoutUrl) {
          // Stripe決済へリダイレクト
          window.location.href = data.checkoutUrl
        } else {
          // 無料の場合は成功表示
          setShowSuccess(true)
        }
      } else {
        const error = await res.json()
        alert(error.error || '申込に失敗しました')
      }
    } catch (error) {
      console.error('Failed to register:', error)
      alert('申込に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP').format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">読み込み中...</p>
      </div>
    )
  }

  if (!seminar) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">セミナーが見つかりません</p>
          <Link href="/open-seminars">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              一覧に戻る
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const participantCount = seminar._count?.registrations || 0
  const isFull = seminar.capacity ? participantCount >= seminar.capacity : false

  return (
    <>
      <Head>
        <title>{seminar.title} | オープンセミナー</title>
        <meta name="description" content={seminar.description || ''} />
      </Head>

      <div className="min-h-screen bg-slate-50">
        {/* ヘッダー */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="font-bold text-xl">リフォーム産業新聞社</span>
              </Link>
              <Link href="/login">
                <Button variant="outline">会員ログイン</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/open-seminars"
              className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              セミナー一覧に戻る
            </Link>

            {showSuccess ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold mb-2">お申込みありがとうございます</h1>
                  <p className="text-slate-600 mb-6">
                    ご登録いただいたメールアドレスに確認メールをお送りしました。<br />
                    当日のご参加をお待ちしております。
                  </p>
                  <Link href="/open-seminars">
                    <Button variant="outline">
                      他のセミナーを見る
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* セミナー詳細 */}
                <div className="lg:col-span-2">
                  <Card className="overflow-hidden">
                    {seminar.imageUrl && (
                      <img
                        src={seminar.imageUrl}
                        alt={seminar.title}
                        className="w-full h-64 object-cover"
                      />
                    )}
                    <CardHeader>
                      <Badge variant="outline" className="w-fit mb-2">
                        オープンセミナー
                      </Badge>
                      <CardTitle className="text-2xl">{seminar.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {seminar.description && (
                        <div className="prose prose-slate max-w-none mb-6">
                          <p className="whitespace-pre-wrap">{seminar.description}</p>
                        </div>
                      )}

                      <div className="space-y-3 text-slate-600">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 flex-shrink-0" />
                          <span className="font-medium">{formatDate(seminar.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 flex-shrink-0" />
                          <span>
                            {formatTime(seminar.scheduledAt)}
                            {seminar.duration && ` (${seminar.duration}分)`}
                          </span>
                        </div>
                        {seminar.location && (
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 flex-shrink-0" />
                            <span>{seminar.location}</span>
                          </div>
                        )}
                        {seminar.instructor && (
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 flex-shrink-0" />
                            <span>講師: {seminar.instructor}</span>
                          </div>
                        )}
                        {seminar.capacity && (
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 flex-shrink-0" />
                            <span>
                              定員: {seminar.capacity}名
                              （残り{Math.max(0, seminar.capacity - participantCount)}席）
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 申込フォーム */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-8">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Yen className="h-6 w-6" />
                        <span className="text-3xl font-bold">
                          {seminar.price === 0 ? '無料' : `¥${formatPrice(seminar.price)}`}
                        </span>
                      </div>
                      {seminar.price > 0 && (
                        <p className="text-sm text-slate-500">(税込)</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      {isFull ? (
                        <div className="text-center py-4">
                          <Badge className="bg-red-100 text-red-700 mb-2">満席</Badge>
                          <p className="text-sm text-slate-600">
                            申し訳ございません。定員に達しました。
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="name">お名前 *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                              placeholder="山田 太郎"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">メールアドレス *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              required
                              placeholder="example@company.jp"
                            />
                          </div>
                          <div>
                            <Label htmlFor="company">会社名</Label>
                            <Input
                              id="company"
                              value={formData.company}
                              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                              placeholder="株式会社〇〇"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">電話番号</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="03-1234-5678"
                            />
                          </div>
                          <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={submitting}
                          >
                            {submitting ? '処理中...' : seminar.price > 0 ? '申込・決済へ進む' : '申し込む'}
                          </Button>
                          <p className="text-xs text-slate-500 text-center">
                            申込後、確認メールをお送りします
                          </p>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* フッター */}
        <footer className="bg-slate-900 text-white mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-slate-400 text-sm">
                © 2025 リフォーム産業新聞社. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
