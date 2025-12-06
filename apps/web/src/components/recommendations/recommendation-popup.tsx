import { useState, useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Recommendation {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  linkUrl: string
  linkText: string
  targetType: string
  position: string
  priority: number
}

export function RecommendationPopup() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/recommendations?position=POPUP')
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) {
          setRecommendations(data)
          setVisible(true)
        }
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    }
  }

  const handleDismiss = async (id: string, permanent: boolean = false) => {
    if (permanent) {
      try {
        await fetch(`/api/recommendations/${id}/dismiss`, {
          method: 'POST',
        })
      } catch (error) {
        console.error('Failed to dismiss recommendation:', error)
      }
    }

    setDismissed(prev => new Set([...prev, id]))

    // 次のおすすめを表示
    const nextIndex = currentIndex + 1
    if (nextIndex < recommendations.length) {
      setCurrentIndex(nextIndex)
    } else {
      setVisible(false)
    }
  }

  const activeRecommendations = recommendations.filter(r => !dismissed.has(r.id))
  const currentRecommendation = activeRecommendations[0]

  if (!visible || !currentRecommendation) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={() => handleDismiss(currentRecommendation.id, false)}
          className="absolute right-2 top-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>

        {currentRecommendation.imageUrl && (
          <img
            src={currentRecommendation.imageUrl}
            alt={currentRecommendation.title}
            className="w-full h-40 object-cover rounded-t-lg"
          />
        )}

        <CardHeader className="pb-2">
          <CardTitle className="text-lg pr-8">{currentRecommendation.title}</CardTitle>
        </CardHeader>

        <CardContent>
          {currentRecommendation.description && (
            <p className="text-slate-600 text-sm mb-4">
              {currentRecommendation.description}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={() => {
                window.open(currentRecommendation.linkUrl, '_blank')
                handleDismiss(currentRecommendation.id, false)
              }}
            >
              {currentRecommendation.linkText}
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500"
              onClick={() => handleDismiss(currentRecommendation.id, true)}
            >
              今後表示しない
            </Button>
          </div>

          {activeRecommendations.length > 1 && (
            <div className="flex justify-center gap-1 mt-4">
              {activeRecommendations.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
