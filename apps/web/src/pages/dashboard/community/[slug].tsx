import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import {
  ArrowLeft,
  Users,
  Video,
  MessageSquare,
  ExternalLink,
  Calendar,
  Clock,
  User,
  Send,
  Play,
  ThumbsUp,
  Lightbulb,
  Heart,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface CommunityCategory {
  id: string
  name: string
  slug: string
  description: string | null
  meetingUrl: string | null
}

interface Comment {
  id: string
  postId: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
}

interface Post {
  id: string
  title: string
  content: string
  authorName: string
  createdAt: string
  attachments: string[]
}

interface PostReactions {
  reactionCounts: Record<string, number>
  userReactions: string[]
}

const REACTION_TYPES = [
  { type: 'LIKE', label: 'いいね', icon: ThumbsUp, color: 'text-blue-600' },
  { type: 'HELPFUL', label: '参考になった', icon: Lightbulb, color: 'text-yellow-600' },
  { type: 'INSIGHTFUL', label: '共感', icon: Heart, color: 'text-red-500' }
]

interface MeetingArchive {
  id: string
  title: string
  description: string | null
  youtubeUrl: string
  heldAt: string
}

export default function CommunityDetailPage() {
  const router = useRouter()
  const { slug } = router.query
  const { user, isLoading, isAuthenticated, hasFeature } = useAuth()
  const [category, setCategory] = useState<CommunityCategory | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [meetings, setMeetings] = useState<MeetingArchive[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')

  // New post form
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Comments and reactions
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({})
  const [postReactions, setPostReactions] = useState<Record<string, PostReactions>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState(false)

  const canAccessCommunity = hasFeature('community')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    if (!isLoading && isAuthenticated && !canAccessCommunity) {
      router.push('/dashboard/community')
    }
  }, [isLoading, isAuthenticated, canAccessCommunity, router])

  useEffect(() => {
    if (isAuthenticated && canAccessCommunity && slug) {
      fetchData()
    }
  }, [isAuthenticated, canAccessCommunity, slug])

  const fetchData = async () => {
    try {
      // Fetch categories to find the current one
      const categoriesRes = await fetch('/api/community/categories')
      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        const currentCategory = data.categories.find((c: CommunityCategory) => c.slug === slug)
        if (currentCategory) {
          setCategory(currentCategory)

          // Fetch posts and meetings for this category
          const [postsRes, meetingsRes] = await Promise.all([
            fetch(`/api/community/posts?categoryId=${currentCategory.id}`),
            fetch(`/api/community/meetings?categoryId=${currentCategory.id}`)
          ])

          if (postsRes.ok) {
            const postsData = await postsRes.json()
            setPosts(postsData.posts)
          }

          if (meetingsRes.ok) {
            const meetingsData = await meetingsRes.json()
            setMeetings(meetingsData.meetings)
          }
        } else {
          router.push('/dashboard/community')
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !category || !user) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: category.id,
          authorId: user.id,
          orgId: user.organization.id,
          title: newPostTitle,
          content: newPostContent,
          attachments: []
        })
      })

      if (res.ok) {
        const data = await res.json()
        setPosts([{ ...data.post, authorName: user.name || user.email }, ...posts])
        setNewPostTitle('')
        setNewPostContent('')
        setShowNewPost(false)
      }
    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`)
      if (res.ok) {
        const data = await res.json()
        setPostComments(prev => ({ ...prev, [postId]: data.comments }))
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  // Fetch reactions for a post
  const fetchReactions = async (postId: string) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/reactions?userId=${user?.id}`)
      if (res.ok) {
        const data = await res.json()
        setPostReactions(prev => ({ ...prev, [postId]: data }))
      }
    } catch (error) {
      console.error('Failed to fetch reactions:', error)
    }
  }

  // Toggle expanded post and fetch comments/reactions
  const toggleExpandPost = async (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null)
    } else {
      setExpandedPostId(postId)
      // Fetch comments and reactions if not already loaded
      if (!postComments[postId]) {
        await fetchComments(postId)
      }
      if (!postReactions[postId]) {
        await fetchReactions(postId)
      }
    }
  }

  // Submit a comment
  const handleSubmitComment = async (postId: string) => {
    if (!newComment[postId]?.trim() || !user) return

    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: user.id,
          content: newComment[postId]
        })
      })

      if (res.ok) {
        const data = await res.json()
        setPostComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment]
        }))
        setNewComment(prev => ({ ...prev, [postId]: '' }))
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  // Toggle reaction
  const handleToggleReaction = async (postId: string, type: string) => {
    if (!user) return

    try {
      const res = await fetch(`/api/community/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type
        })
      })

      if (res.ok) {
        const data = await res.json()
        setPostReactions(prev => {
          const current = prev[postId] || { reactionCounts: {}, userReactions: [] }
          const newCounts = { ...current.reactionCounts }
          let newUserReactions = [...current.userReactions]

          if (data.action === 'added') {
            newCounts[type] = (newCounts[type] || 0) + 1
            newUserReactions.push(type)
          } else {
            newCounts[type] = Math.max((newCounts[type] || 0) - 1, 0)
            newUserReactions = newUserReactions.filter(r => r !== type)
          }

          return {
            ...prev,
            [postId]: { reactionCounts: newCounts, userReactions: newUserReactions }
          }
        })
      }
    } catch (error) {
      console.error('Failed to toggle reaction:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!category) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">コミュニティが見つかりません</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/community">
              <ArrowLeft className="h-4 w-4 mr-2" />
              コミュニティ一覧
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="text-slate-600">{category.description}</p>
              )}
            </div>
          </div>
          {category.meetingUrl && (
            <Button asChild>
              <a href={category.meetingUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                定例会に参加登録
              </a>
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="posts">
              <MessageSquare className="h-4 w-4 mr-2" />
              投稿
              <Badge variant="secondary" className="ml-2 text-xs">
                {posts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="meetings">
              <Video className="h-4 w-4 mr-2" />
              定例会アーカイブ
              <Badge variant="secondary" className="ml-2 text-xs">
                {meetings.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6 space-y-4">
            {!showNewPost ? (
              <Button onClick={() => setShowNewPost(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                新しい投稿を作成
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">新しい投稿</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="タイトル"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="投稿内容を入力..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitPost}
                      disabled={submitting || !newPostTitle.trim() || !newPostContent.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {submitting ? '投稿中...' : '投稿する'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewPost(false)}>
                      キャンセル
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">まだ投稿がありません</p>
                  <p className="text-sm text-slate-400 mt-1">
                    最初の投稿を作成してみましょう
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const reactions = postReactions[post.id] || { reactionCounts: {}, userReactions: [] }
                  const comments = postComments[post.id] || []
                  const isExpanded = expandedPostId === post.id

                  return (
                    <Card key={post.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{post.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{post.authorName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDateTime(post.createdAt)}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-slate-600 whitespace-pre-wrap">{post.content}</p>

                        {/* Reaction buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t">
                          {REACTION_TYPES.map(({ type, label, icon: Icon, color }) => {
                            const count = reactions.reactionCounts[type] || 0
                            const isActive = reactions.userReactions.includes(type)
                            return (
                              <button
                                key={type}
                                onClick={() => handleToggleReaction(post.id, type)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                                  isActive
                                    ? `bg-slate-100 ${color}`
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                <span>{label}</span>
                                {count > 0 && (
                                  <Badge variant="secondary" className="text-xs ml-1">
                                    {count}
                                  </Badge>
                                )}
                              </button>
                            )
                          })}
                        </div>

                        {/* Comments toggle */}
                        <button
                          onClick={() => toggleExpandPost(post.id)}
                          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <MessageSquare className="h-4 w-4" />
                          <span>コメント {comments.length > 0 && `(${comments.length})`}</span>
                        </button>

                        {/* Comments section */}
                        {isExpanded && (
                          <div className="space-y-3 pt-3 border-t">
                            {comments.length > 0 ? (
                              <div className="space-y-3">
                                {comments.map((comment) => (
                                  <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                      <User className="h-3 w-3" />
                                      <span className="font-medium">{comment.authorName}</span>
                                      <span>・</span>
                                      <span>{formatDateTime(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-slate-700">{comment.content}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400">まだコメントはありません</p>
                            )}

                            {/* New comment form */}
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="コメントを入力..."
                                value={newComment[post.id] || ''}
                                onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                                rows={2}
                                className="flex-1"
                              />
                              <Button
                                onClick={() => handleSubmitComment(post.id)}
                                disabled={submittingComment || !newComment[post.id]?.trim()}
                                size="sm"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="meetings" className="mt-6">
            {meetings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">まだ定例会のアーカイブがありません</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meetings.map((meeting) => (
                  <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                    <div className="relative">
                      <div className="w-full h-40 bg-gradient-to-br from-green-500 to-green-700 rounded-t-lg flex items-center justify-center">
                        <Video className="h-12 w-12 text-white/80" />
                      </div>
                      <a
                        href={meeting.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/20 rounded-t-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <div className="bg-white/90 rounded-full p-3">
                          <Play className="h-6 w-6 text-green-600" />
                        </div>
                      </a>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base line-clamp-2">
                        {meeting.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {meeting.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {meeting.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>開催日: {formatDate(meeting.heldAt)}</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                        <a href={meeting.youtubeUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          視聴する
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
