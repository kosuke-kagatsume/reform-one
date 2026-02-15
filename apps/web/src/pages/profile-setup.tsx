// A-4: 初回プロフィール設定ページ
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Layout } from '@/components/layout/layout'
import { ProfileQuestionsForm } from '@/components/profile/profile-questions-form'
import { useAuth } from '@/lib/auth-context'

export default function ProfileSetupPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated } = useAuth()
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else {
        // 少し遅延してフォームを表示（ログイン直後の場合）
        setTimeout(() => setShowForm(true), 100)
      }
    }
  }, [isLoading, isAuthenticated, router])

  const handleComplete = () => {
    // ダッシュボードにリダイレクト
    router.push('/dashboard')
  }

  const handleSkip = () => {
    // スキップしてダッシュボードへ
    router.push('/dashboard')
  }

  if (isLoading || !showForm) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <ProfileQuestionsForm
          onComplete={handleComplete}
          onSkip={handleSkip}
          showSkipButton={true}
        />
      </div>
    </Layout>
  )
}
