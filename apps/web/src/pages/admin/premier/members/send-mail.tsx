import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { PremierAdminLayout } from '@/components/layout/premier-admin-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import {
  Mail,
  Send,
  Users,
  Building,
  Calendar,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  X,
  UserCheck
} from 'lucide-react'

interface Member {
  id: string
  name: string | null
  email: string
  organizationId: string
  organizationName: string
  planType: string | null
}

interface Organization {
  id: string
  name: string
  memberCount: number
  planType: string | null
}

interface Event {
  id: string
  title: string
  type: 'seminar' | 'site_visit' | 'offline_meeting'
  scheduledAt: string
  participantCount: number
}

export default function SendMailPage() {
  const router = useRouter()
  const { isLoading, isAuthenticated, isReformCompany } = useAuth()

  // Data state
  const [members, setMembers] = useState<Member[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  // Selection state
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set())
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())
  const [selectionTab, setSelectionTab] = useState('members')

  // Search state
  const [memberSearch, setMemberSearch] = useState('')
  const [orgSearch, setOrgSearch] = useState('')

  // Mail state
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && isReformCompany) {
      fetchData()
    }
  }, [isAuthenticated, isReformCompany])

  const fetchData = async () => {
    try {
      const [membersRes, orgsRes, eventsRes] = await Promise.all([
        fetch('/api/admin/premier/members/selectable'),
        fetch('/api/admin/premier/organizations/selectable'),
        fetch('/api/admin/premier/events/selectable')
      ])

      if (membersRes.ok) {
        const data = await membersRes.json()
        setMembers(data.members)
      }

      if (orgsRes.ok) {
        const data = await orgsRes.json()
        setOrganizations(data.organizations)
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json()
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleMember = (id: string) => {
    const newSelected = new Set(selectedMembers)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedMembers(newSelected)
  }

  const toggleOrg = (id: string) => {
    const newSelected = new Set(selectedOrgs)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedOrgs(newSelected)
  }

  const toggleEvent = (id: string) => {
    const newSelected = new Set(selectedEvents)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedEvents(newSelected)
  }

  const selectAllMembers = () => {
    const filteredIds = filteredMembers.map(m => m.id)
    setSelectedMembers(new Set(filteredIds))
  }

  const clearMemberSelection = () => {
    setSelectedMembers(new Set())
  }

  const selectAllOrgs = () => {
    const filteredIds = filteredOrgs.map(o => o.id)
    setSelectedOrgs(new Set(filteredIds))
  }

  const clearOrgSelection = () => {
    setSelectedOrgs(new Set())
  }

  const getTotalRecipientCount = () => {
    let count = selectedMembers.size

    // Add members from selected orgs (excluding already selected individual members)
    selectedOrgs.forEach(orgId => {
      const org = organizations.find(o => o.id === orgId)
      if (org) count += org.memberCount
    })

    // Add participants from selected events
    selectedEvents.forEach(eventId => {
      const event = events.find(e => e.id === eventId)
      if (event) count += event.participantCount
    })

    return count
  }

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('件名と本文を入力してください')
      return
    }

    const totalRecipients = getTotalRecipientCount()
    if (totalRecipients === 0) {
      setError('送信先を選択してください')
      return
    }

    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/premier/members/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberIds: Array.from(selectedMembers),
          organizationIds: Array.from(selectedOrgs),
          eventIds: Array.from(selectedEvents),
          subject,
          body
        })
      })

      if (res.ok) {
        const data = await res.json()
        setSent(true)
      } else {
        const data = await res.json()
        setError(data.error || '送信に失敗しました')
      }
    } catch (error) {
      setError('送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'seminar': return 'セミナー'
      case 'site_visit': return '視察会'
      case 'offline_meeting': return 'オフライン会'
      default: return type
    }
  }

  const filteredMembers = members.filter(m => {
    const searchLower = memberSearch.toLowerCase()
    return (
      (m.name?.toLowerCase() || '').includes(searchLower) ||
      m.email.toLowerCase().includes(searchLower) ||
      m.organizationName.toLowerCase().includes(searchLower)
    )
  })

  const filteredOrgs = organizations.filter(o => {
    return o.name.toLowerCase().includes(orgSearch.toLowerCase())
  })

  if (isLoading || loading) {
    return (
      <PremierAdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </PremierAdminLayout>
    )
  }

  if (sent) {
    return (
      <PremierAdminLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800 mb-2">送信完了</h2>
                <p className="text-green-700 mb-6">
                  メールを送信しました
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => router.push('/admin/premier/members')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    会員一覧に戻る
                  </Button>
                  <Button onClick={() => {
                    setSent(false)
                    setSelectedMembers(new Set())
                    setSelectedOrgs(new Set())
                    setSelectedEvents(new Set())
                    setSubject('')
                    setBody('')
                  }}>
                    <Mail className="h-4 w-4 mr-2" />
                    新しいメールを作成
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PremierAdminLayout>
    )
  }

  return (
    <PremierAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/premier/members">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">会員選択メール送信</h1>
            <p className="text-slate-600">
              個人・組織・イベント参加者を選択してメールを送信
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 送信先選択 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                送信先を選択
              </CardTitle>
              <CardDescription>
                選択中: {getTotalRecipientCount()}名
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectionTab} onValueChange={setSelectionTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="members" className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    個人
                    {selectedMembers.size > 0 && (
                      <Badge variant="secondary" className="ml-1">{selectedMembers.size}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="orgs" className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    組織
                    {selectedOrgs.size > 0 && (
                      <Badge variant="secondary" className="ml-1">{selectedOrgs.size}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="events" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    イベント
                    {selectedEvents.size > 0 && (
                      <Badge variant="secondary" className="ml-1">{selectedEvents.size}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="名前・メール・組織名で検索..."
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={selectAllMembers}>
                        全選択
                      </Button>
                      <Button variant="ghost" size="sm" onClick={clearMemberSelection}>
                        解除
                      </Button>
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-1 border rounded-lg p-2">
                      {filteredMembers.length === 0 ? (
                        <p className="text-center text-slate-500 py-4">会員が見つかりません</p>
                      ) : (
                        filteredMembers.map((member) => (
                          <div
                            key={member.id}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-slate-50 ${
                              selectedMembers.has(member.id) ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => toggleMember(member.id)}
                          >
                            <Checkbox
                              checked={selectedMembers.has(member.id)}
                              onCheckedChange={() => toggleMember(member.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {member.name || member.email}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {member.organizationName}
                              </p>
                            </div>
                            {member.planType && (
                              <Badge variant="outline" className="text-xs">
                                {member.planType === 'EXPERT' ? 'Expert' : 'Standard'}
                              </Badge>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="orgs" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="組織名で検索..."
                          value={orgSearch}
                          onChange={(e) => setOrgSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={selectAllOrgs}>
                        全選択
                      </Button>
                      <Button variant="ghost" size="sm" onClick={clearOrgSelection}>
                        解除
                      </Button>
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-1 border rounded-lg p-2">
                      {filteredOrgs.length === 0 ? (
                        <p className="text-center text-slate-500 py-4">組織が見つかりません</p>
                      ) : (
                        filteredOrgs.map((org) => (
                          <div
                            key={org.id}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-slate-50 ${
                              selectedOrgs.has(org.id) ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => toggleOrg(org.id)}
                          >
                            <Checkbox
                              checked={selectedOrgs.has(org.id)}
                              onCheckedChange={() => toggleOrg(org.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{org.name}</p>
                              <p className="text-xs text-slate-500">
                                {org.memberCount}名
                              </p>
                            </div>
                            {org.planType && (
                              <Badge variant="outline" className="text-xs">
                                {org.planType === 'EXPERT' ? 'Expert' : 'Standard'}
                              </Badge>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="events" className="mt-4">
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      イベント参加者に一斉メールを送信できます
                    </p>
                    <div className="max-h-80 overflow-y-auto space-y-1 border rounded-lg p-2">
                      {events.length === 0 ? (
                        <p className="text-center text-slate-500 py-4">イベントがありません</p>
                      ) : (
                        events.map((event) => (
                          <div
                            key={event.id}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-slate-50 ${
                              selectedEvents.has(event.id) ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => toggleEvent(event.id)}
                          >
                            <Checkbox
                              checked={selectedEvents.has(event.id)}
                              onCheckedChange={() => toggleEvent(event.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {getEventTypeLabel(event.type)}
                                </Badge>
                                <p className="font-medium text-sm truncate">{event.title}</p>
                              </div>
                              <p className="text-xs text-slate-500">
                                {formatDate(event.scheduledAt)} / {event.participantCount}名参加
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* メール作成 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                メール内容
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">件名 *</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="メールの件名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">本文 *</label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="メールの本文を入力..."
                  rows={12}
                />
                <p className="text-xs text-slate-500 mt-1">
                  ※ {'{{name}}'} で受信者名、{'{{organization}}'} で組織名に置換されます
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => router.back()}>
                  キャンセル
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={sending || getTotalRecipientCount() === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {getTotalRecipientCount()}名に送信
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PremierAdminLayout>
  )
}
