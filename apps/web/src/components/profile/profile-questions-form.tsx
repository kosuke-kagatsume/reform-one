// A-4: ユーザープロフィール質問フォーム
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

// 選択肢の定義
export const INDUSTRY_CATEGORIES = [
  'リフォーム全般',
  '外壁塗装・屋根',
  '水回り（キッチン・浴室・トイレ）',
  '内装・インテリア',
  '外構・エクステリア',
  '増改築・リノベーション',
  '太陽光・省エネ',
  '不動産・仲介',
  '建材・設備メーカー',
  'その他'
]

export const COMPANY_SIZES = [
  '1〜10名',
  '11〜30名',
  '31〜50名',
  '51〜100名',
  '101〜300名',
  '301名以上'
]

export const INTEREST_TOPICS = [
  '経営戦略・事業計画',
  '営業・マーケティング',
  '人材採用・育成',
  '施工管理・品質向上',
  'IT・DX推進',
  '財務・資金調達',
  '業界動向・トレンド',
  'M&A・事業承継',
  '法規制・コンプライアンス',
  '働き方改革'
]

interface ProfileQuestionsFormProps {
  onComplete?: () => void
  onSkip?: () => void
  showSkipButton?: boolean
  initialData?: {
    department?: string
    jobTitle?: string
    industryCategory?: string
    companySize?: string
    interests?: string[]
    subscriptionGoal?: string
  }
}

export function ProfileQuestionsForm({
  onComplete,
  onSkip,
  showSkipButton = true,
  initialData
}: ProfileQuestionsFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // フォームデータ
  const [department, setDepartment] = useState(initialData?.department || '')
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '')
  const [industryCategory, setIndustryCategory] = useState(initialData?.industryCategory || '')
  const [companySize, setCompanySize] = useState(initialData?.companySize || '')
  const [interests, setInterests] = useState<string[]>(initialData?.interests || [])
  const [subscriptionGoal, setSubscriptionGoal] = useState(initialData?.subscriptionGoal || '')

  const totalSteps = 3

  const handleInterestToggle = (topic: string) => {
    if (interests.includes(topic)) {
      setInterests(interests.filter(i => i !== topic))
    } else {
      setInterests([...interests, topic])
    }
  }

  const handleSubmit = async () => {
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department,
          jobTitle,
          industryCategory,
          companySize,
          interests,
          subscriptionGoal
        })
      })

      if (response.ok) {
        onComplete?.()
      } else {
        const data = await response.json()
        setError(data.message || 'エラーが発生しました')
      }
    } catch {
      setError('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>プロフィール設定</CardTitle>
        <CardDescription>
          あなたに最適な情報をお届けするため、いくつかの質問にお答えください（ステップ {currentStep}/{totalSteps}）
        </CardDescription>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 flex items-start gap-2 mb-4">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Step 1: 基本情報 */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department">Q1. 部署</Label>
              <Input
                id="department"
                placeholder="例: 営業部、経営企画部"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Q2. 役職</Label>
              <Input
                id="jobTitle"
                placeholder="例: 部長、マネージャー、担当"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: 会社情報 */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Q3. 主な業種カテゴリ</Label>
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRY_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setIndustryCategory(category)}
                    className={`p-2 text-sm rounded-md border transition-colors ${
                      industryCategory === category
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Q4. 従業員数</Label>
              <div className="grid grid-cols-3 gap-2">
                {COMPANY_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setCompanySize(size)}
                    className={`p-2 text-sm rounded-md border transition-colors ${
                      companySize === size
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 関心・目的 */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Q5. 関心のあるテーマ（複数選択可）</Label>
              <div className="grid grid-cols-2 gap-2">
                {INTEREST_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleInterestToggle(topic)}
                    className={`p-2 text-sm rounded-md border transition-colors text-left ${
                      interests.includes(topic)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {interests.includes(topic) && <CheckCircle2 className="h-4 w-4 inline mr-1" />}
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscriptionGoal">Q6. 購読の目的・期待すること</Label>
              <textarea
                id="subscriptionGoal"
                placeholder="例: 業界の最新トレンドを把握したい、セミナーで学びたい"
                value={subscriptionGoal}
                onChange={(e) => setSubscriptionGoal(e.target.value)}
                className="w-full h-24 p-3 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrev}>
                戻る
              </Button>
            )}
            {currentStep === 1 && showSkipButton && (
              <Button variant="ghost" onClick={onSkip}>
                スキップ
              </Button>
            )}
          </div>
          <Button onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : currentStep === totalSteps ? '完了' : '次へ'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
