import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Yen,
  ArrowRight,
  Building2
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

export default function OpenSeminarsPage() {
  const [seminars, setSeminars] = useState<OpenSeminar[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSeminars()
  }, [])

  const fetchSeminars = async () => {
    try {
      const res = await fetch('/api/open-seminars')
      if (res.ok) {
        const data = await res.json()
        setSeminars(data)
      }
    } catch (error) {
      console.error('Failed to fetch seminars:', error)
    } finally {
      setLoading(false)
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

  return (
    <>
      <Head>
        <title>オープンセミナー | リフォーム産業新聞社</title>
        <meta name="description" content="リフォーム業界向けオープンセミナー。どなたでも参加可能です。" />
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
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">オープンセミナー</h1>
              <p className="text-slate-600">
                リフォーム業界の最新情報・ノウハウを学べるセミナー
              </p>
              <p className="text-sm text-slate-500 mt-1">
                会員でなくてもどなたでも参加可能です
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-slate-600">読み込み中...</p>
              </div>
            ) : seminars.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">現在予定されているセミナーはありません</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {seminars.map((seminar, index) => {
                  const participantCount = seminar._count?.registrations || 0
                  const isFull = seminar.capacity ? participantCount >= seminar.capacity : false

                  return (
                    <Card
                      key={seminar.id}
                      className={`overflow-hidden ${index === 0 ? 'border-2 border-blue-200' : ''}`}
                    >
                      {index === 0 && (
                        <div className="bg-blue-50 px-4 py-2">
                          <Badge className="bg-blue-600">次回開催</Badge>
                        </div>
                      )}
                      <div className="md:flex">
                        {seminar.imageUrl && (
                          <div className="md:w-1/3">
                            <img
                              src={seminar.imageUrl}
                              alt={seminar.title}
                              className="w-full h-48 md:h-full object-cover"
                            />
                          </div>
                        )}
                        <div className={`p-6 ${seminar.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
                          <h2 className="text-xl font-bold mb-2">{seminar.title}</h2>
                          {seminar.description && (
                            <p className="text-slate-600 mb-4">{seminar.description}</p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>{formatDate(seminar.scheduledAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span>
                                {formatTime(seminar.scheduledAt)}
                                {seminar.duration && ` (${seminar.duration}分)`}
                              </span>
                            </div>
                            {seminar.location && (
                              <div className="flex items-center gap-2 text-slate-600">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span>{seminar.location}</span>
                              </div>
                            )}
                            {seminar.instructor && (
                              <div className="flex items-center gap-2 text-slate-600">
                                <Users className="h-4 w-4 flex-shrink-0" />
                                <span>講師: {seminar.instructor}</span>
                              </div>
                            )}
                            {seminar.capacity && (
                              <div className="flex items-center gap-2 text-slate-600">
                                <Users className="h-4 w-4 flex-shrink-0" />
                                <span>
                                  {participantCount} / {seminar.capacity}名
                                  {isFull && <span className="text-red-600 ml-1">(満席)</span>}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Yen className="h-5 w-5 text-slate-600" />
                              <span className="text-2xl font-bold">
                                {seminar.price === 0 ? '無料' : `¥${formatPrice(seminar.price)}`}
                              </span>
                              {seminar.price > 0 && (
                                <span className="text-sm text-slate-500">(税込)</span>
                              )}
                            </div>
                            <Link href={`/open-seminars/${seminar.id}`}>
                              <Button disabled={isFull}>
                                {isFull ? '満席' : '詳細・申込'}
                                {!isFull && <ArrowRight className="h-4 w-4 ml-2" />}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* プレミア購読の案内 */}
            <Card className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="py-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    プレミア購読会員になりませんか？
                  </h2>
                  <p className="text-blue-100 mb-6">
                    会員限定セミナー・アーカイブ動画・データブックなど、<br />
                    リフォーム経営に役立つコンテンツが見放題
                  </p>
                  <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link href="/pricing">
                      <Button variant="secondary" size="lg">
                        プランを見る
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        variant="outline"
                        size="lg"
                        className="text-white border-white hover:bg-white/10"
                      >
                        会員の方はログイン
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
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
