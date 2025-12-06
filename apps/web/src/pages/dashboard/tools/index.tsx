import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import {
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Calculator,
  Wrench,
  Lock,
  Star
} from 'lucide-react'

interface Tool {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  fileUrl: string | null
  externalUrl: string | null
  iconName: string | null
  requiredPlan: string
  sortOrder: number
  isPublished: boolean
  _count?: { usageLogs: number }
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileSpreadsheet,
  FileText,
  Calculator,
  Wrench,
  Download,
  ExternalLink,
}

const categoryLabels: Record<string, string> = {
  SPREADSHEET: 'スプレッドシート',
  DOCUMENT: 'ドキュメント',
  CALCULATOR: '計算ツール',
  OTHER: 'その他',
}

export default function ToolsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchTools()
    }
  }, [isAuthenticated])

  const fetchTools = async () => {
    try {
      const res = await fetch('/api/tools')
      if (res.ok) {
        const data = await res.json()
        setTools(data)
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUseTool = async (tool: Tool) => {
    setDownloading(tool.id)
    try {
      // 利用ログを記録
      await fetch(`/api/tools/${tool.slug}/use`, {
        method: 'POST',
      })

      if (tool.fileUrl) {
        // ファイルダウンロード
        window.open(tool.fileUrl, '_blank')
      } else if (tool.externalUrl) {
        // 外部リンク
        window.open(tool.externalUrl, '_blank')
      }
    } catch (error) {
      console.error('Failed to use tool:', error)
    } finally {
      setDownloading(null)
    }
  }

  const getIcon = (iconName: string | null, category: string) => {
    if (iconName && iconMap[iconName]) {
      const Icon = iconMap[iconName]
      return <Icon className="h-8 w-8" />
    }

    // カテゴリに基づくデフォルトアイコン
    switch (category) {
      case 'SPREADSHEET':
        return <FileSpreadsheet className="h-8 w-8" />
      case 'DOCUMENT':
        return <FileText className="h-8 w-8" />
      case 'CALCULATOR':
        return <Calculator className="h-8 w-8" />
      default:
        return <Wrench className="h-8 w-8" />
    }
  }

  const userPlan = user?.organization?.planType || 'STANDARD'
  const canUseTool = (tool: Tool) => {
    if (tool.requiredPlan === 'STANDARD') return true
    if (tool.requiredPlan === 'EXPERT' && userPlan === 'EXPERT') return true
    return false
  }

  const categories = ['all', ...new Set(tools.map(t => t.category))]

  const filteredTools = selectedCategory === 'all'
    ? tools
    : tools.filter(t => t.category === selectedCategory)

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">業務ツール</h1>
          <p className="text-slate-600">リフォーム業務に役立つツール・テンプレート集</p>
        </div>

        <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            {categories.filter(c => c !== 'all').map((category) => (
              <TabsTrigger key={category} value={category}>
                {categoryLabels[category] || category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {filteredTools.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">ツールがありません</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map((tool) => {
                  const canUse = canUseTool(tool)

                  return (
                    <Card
                      key={tool.id}
                      className={`hover:shadow-md transition-shadow ${!canUse ? 'opacity-75' : ''}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-lg ${canUse ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                            {getIcon(tool.iconName, tool.category)}
                          </div>
                          <div className="flex gap-1">
                            {tool.requiredPlan === 'EXPERT' && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                <Star className="h-3 w-3 mr-1" />
                                EXPERT
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-base mt-3">
                          {tool.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {tool.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[tool.category] || tool.category}
                          </Badge>
                          {tool._count && (
                            <span>{tool._count.usageLogs}回利用</span>
                          )}
                        </div>

                        {canUse ? (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleUseTool(tool)}
                            disabled={downloading === tool.id}
                          >
                            {downloading === tool.id ? (
                              '処理中...'
                            ) : tool.fileUrl ? (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                ダウンロード
                              </>
                            ) : (
                              <>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                開く
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            disabled
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            EXPERTプラン限定
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {userPlan === 'STANDARD' && (
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-purple-900">
                    EXPERTプランにアップグレード
                  </h3>
                  <p className="text-sm text-purple-700">
                    すべてのツールにアクセスできるようになります
                  </p>
                </div>
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => router.push('/dashboard/billing')}
                >
                  プランを見る
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
