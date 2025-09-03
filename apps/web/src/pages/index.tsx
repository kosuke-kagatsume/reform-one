import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Reform One</h1>
        <p className="text-slate-600">リダイレクト中...</p>
      </div>
    </div>
  )
}