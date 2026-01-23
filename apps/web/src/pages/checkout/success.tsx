import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const { session_id } = router.query
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session_id) {
      // Verify the session and activate subscription
      verifySession(session_id as string)
    }
  }, [session_id])

  const verifySession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/billing/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'セッションの確認に失敗しました')
      }
    } catch {
      setError('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading && session_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">お支払いを確認中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>お支払い完了 | プレミア購読</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          {error ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-red-600 text-2xl">!</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">エラーが発生しました</h1>
              <p className="text-gray-600 mb-8">{error}</p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ダッシュボードに戻る
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                お支払いが完了しました
              </h1>
              <p className="text-gray-600 mb-8">
                プレミア購読へのご登録ありがとうございます。
                これより全てのコンテンツをご利用いただけます。
              </p>

              <div className="space-y-4">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ダッシュボードへ
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>

                <Link
                  href="/dashboard/seminars"
                  className="flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  セミナー一覧を見る
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  ご不明な点がございましたら、
                  <a href="mailto:premium@the-reform.co.jp" className="text-blue-600 hover:underline">
                    premium@the-reform.co.jp
                  </a>
                  までお問い合わせください。
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
