import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import {
  MessageSquare,
  Video,
  Users,
  Plus,
  ExternalLink,
  Edit,
  MoreVertical,
  Link as LinkIcon
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CommunityCategory {
  id: string
  name: string
  slug: string
  description: string | null
  meetingUrl: string | null
  sortOrder: number
  _count: {
    posts: number
    meetingArchives: number
  }
}

export default function CommunityAdminPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()
  const [categories, setCategories] = useState<CommunityCategory[]>([])
  const [loading, setLoading] = useState(true)

  // Edit URL dialog
  const [editingCategory, setEditingCategory] = useState<CommunityCategory | null>(null)
  const [newMeetingUrl, setNewMeetingUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) {
      fetchCategories()
    }
  }, [isAuthenticated, isReformCompany])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/community/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMeetingUrl = async () => {
    if (!editingCategory) return

    setSaving(true)
    try {
      const res = await fetch('/api/community/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategory.id,
          meetingUrl: newMeetingUrl || null
        })
      })

      if (res.ok) {
        fetchCategories()
        setEditingCategory(null)
        setNewMeetingUrl('')
      }
    } catch (error) {
      console.error('Failed to update meeting URL:', error)
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (category: CommunityCategory) => {
    setEditingCategory(category)
    setNewMeetingUrl(category.meetingUrl || '')
  }

  const totalPosts = categories.reduce((sum, c) => sum + c._count.posts, 0)
  const totalArchives = categories.reduce((sum, c) => sum + c._count.meetingArchives, 0)

  if (isLoading || loading) {
    return (
      <PremierAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </PremierAdminLayout>
    )
  }

  return (
    <PremierAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">コミュニティ管理</h1>
            <p className="text-slate-600">職種別コミュニティの管理</p>
          </div>
          <Button asChild>
            <Link href="/admin/premier/community/new">
              <Plus className="h-4 w-4 mr-2" />
              新規カテゴリを作成
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{categories.length}</p>
                  <p className="text-sm text-slate-600">コミュニティ数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalPosts}</p>
                  <p className="text-sm text-slate-600">総投稿数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Video className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalArchives}</p>
                  <p className="text-sm text-slate-600">定例会アーカイブ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">コミュニティカテゴリ一覧</CardTitle>
            <CardDescription>
              各コミュニティの定例会Zoom登録URLを管理できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">コミュニティがありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{category.name}</span>
                          <Badge variant="outline">/{category.slug}</Badge>
                        </div>
                        {category.description && (
                          <p className="text-sm text-slate-500 mb-2">{category.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{category._count.posts}件の投稿</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            <span>{category._count.meetingArchives}件のアーカイブ</span>
                          </div>
                          {category.meetingUrl ? (
                            <a
                              href={category.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <LinkIcon className="h-3 w-3" />
                              <span>定例会URL設定済み</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-amber-600">定例会URL未設定</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                      >
                        <LinkIcon className="h-4 w-4 mr-1" />
                        URL設定
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/admin/premier/community/${category.slug}/meetings`)}>
                            <Video className="h-4 w-4 mr-2" />
                            アーカイブ管理
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/premier/community/${category.slug}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            編集
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-base">コミュニティ運用について</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>・ 各コミュニティでは月1回の定例Zoomミーティングを開催します</li>
              <li>・ 「URL設定」ボタンから各コミュニティのZoom登録ページURLを設定できます</li>
              <li>・ 定例会の録画はYouTube限定公開URLで保存し、アーカイブとして登録します</li>
              <li>・ エキスパートプラン会員のみがコミュニティにアクセスできます</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>定例会Zoom登録URLの設定</DialogTitle>
            <DialogDescription>
              {editingCategory?.name}コミュニティの定例会参加登録URLを設定します。
              会員はこのURLからZoom定例会の参加登録を行います。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="meetingUrl">Zoom登録ページURL</Label>
              <Input
                id="meetingUrl"
                type="url"
                placeholder="https://zoom.us/meeting/register/..."
                value={newMeetingUrl}
                onChange={(e) => setNewMeetingUrl(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Zoomの登録機能付きミーティングのURLを入力してください。
                空欄にすると会員に表示されません。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              キャンセル
            </Button>
            <Button onClick={handleUpdateMeetingUrl} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PremierAdminLayout>
  )
}
