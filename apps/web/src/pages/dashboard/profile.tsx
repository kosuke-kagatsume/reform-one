import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Camera,
  Shield,
  Bell,
  Globe,
  Save,
  Edit,
  AlertCircle,
  CheckCircle,
  Upload,
  Smartphone,
  Lock,
  Settings
} from 'lucide-react'

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  
  const [profileData, setProfileData] = useState({
    name: '山田 太郎',
    email: 'yamada@test-org.com',
    phone: '090-1234-5678',
    department: '経営企画部',
    position: '部長',
    location: '東京オフィス',
    bio: 'リフォーム業界のデジタル化を推進しています。10年以上の経験を持ち、チームと共に革新的なソリューションを提供することに情熱を注いでいます。',
    language: 'ja',
    timezone: 'Asia/Tokyo',
    joinedDate: '2020-01-15'
  })

  const [notifications, setNotifications] = useState({
    email: {
      marketing: true,
      updates: true,
      security: true,
      reports: false
    },
    push: {
      mentions: true,
      tasks: true,
      reminders: true
    }
  })

  const tabs = [
    { id: 'general', name: '基本情報', icon: User },
    { id: 'notifications', name: '通知設定', icon: Bell },
    { id: 'security', name: 'セキュリティ', icon: Shield },
    { id: 'preferences', name: '環境設定', icon: Settings }
  ]

  const handleSave = () => {
    setIsEditing(false)
    // TODO: Save to backend
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">プロフィール設定</h2>
            <p className="text-slate-600">アカウント情報と個人設定を管理</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="h-24 w-24 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="h-12 w-12 text-slate-400" />
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border hover:bg-slate-50">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold">{profileData.name}</h3>
                    <p className="text-sm text-slate-500">{profileData.position}</p>
                  </div>
                  <Badge variant="outline">管理者</Badge>
                </div>

                <div className="mt-6 space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'general' && (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>基本情報</CardTitle>
                        <CardDescription>プロフィール情報を更新</CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          編集
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            キャンセル
                          </Button>
                          <Button onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            保存
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">氏名</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          disabled={!isEditing}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">メールアドレス</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled={!isEditing}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">電話番号</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          disabled={!isEditing}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="department">部署</Label>
                        <Input
                          id="department"
                          value={profileData.department}
                          disabled={!isEditing}
                          onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="position">役職</Label>
                        <Input
                          id="position"
                          value={profileData.position}
                          disabled={!isEditing}
                          onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">勤務地</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          disabled={!isEditing}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">自己紹介</Label>
                      <textarea
                        id="bio"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm disabled:bg-slate-50"
                        rows={4}
                        value={profileData.bio}
                        disabled={!isEditing}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>アカウント情報</CardTitle>
                    <CardDescription>アカウントの詳細情報</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center gap-3">
                          <Building className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-sm font-medium">所属組織</p>
                            <p className="text-sm text-slate-500">株式会社テスト組織</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-sm font-medium">参加日</p>
                            <p className="text-sm text-slate-500">2020年1月15日</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Shield className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="text-sm font-medium">アカウントID</p>
                            <p className="text-sm text-slate-500">USR-2020-0001</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>通知設定</CardTitle>
                  <CardDescription>通知の受信方法をカスタマイズ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">メール通知</h3>
                    <div className="space-y-3">
                      {Object.entries(notifications.email).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-sm">
                              {key === 'marketing' && 'マーケティング情報'}
                              {key === 'updates' && 'アップデート情報'}
                              {key === 'security' && 'セキュリティアラート'}
                              {key === 'reports' && 'レポート配信'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {key === 'marketing' && '新機能やキャンペーン情報'}
                              {key === 'updates' && 'システムアップデートのお知らせ'}
                              {key === 'security' && '重要なセキュリティ通知'}
                              {key === 'reports' && '週次・月次レポートの配信'}
                            </p>
                          </div>
                          <button
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-blue-600' : 'bg-slate-200'
                            }`}
                            onClick={() => setNotifications({
                              ...notifications,
                              email: { ...notifications.email, [key]: !value }
                            })}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">プッシュ通知</h3>
                    <div className="space-y-3">
                      {Object.entries(notifications.push).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-sm">
                              {key === 'mentions' && 'メンション'}
                              {key === 'tasks' && 'タスク通知'}
                              {key === 'reminders' && 'リマインダー'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {key === 'mentions' && '自分がメンションされた時'}
                              {key === 'tasks' && 'タスクの割り当てや期限'}
                              {key === 'reminders' && '予定のリマインダー'}
                            </p>
                          </div>
                          <button
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-blue-600' : 'bg-slate-200'
                            }`}
                            onClick={() => setNotifications({
                              ...notifications,
                              push: { ...notifications.push, [key]: !value }
                            })}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>パスワード変更</CardTitle>
                    <CardDescription>アカウントのパスワードを更新</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">現在のパスワード</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">新しいパスワード</Label>
                      <Input id="new-password" type="password" />
                      <p className="text-xs text-slate-500">最低8文字、大文字・小文字・数字を含む</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button>パスワードを更新</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>二要素認証</CardTitle>
                    <CardDescription>アカウントのセキュリティを強化</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-slate-500" />
                        <div>
                          <p className="font-medium">認証アプリ</p>
                          <p className="text-sm text-slate-500">Google Authenticatorなど</p>
                        </div>
                      </div>
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        有効
                      </Badge>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">バックアップコード</p>
                          <p>緊急時用のバックアップコードを生成・保存してください</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'preferences' && (
              <Card>
                <CardHeader>
                  <CardTitle>環境設定</CardTitle>
                  <CardDescription>表示言語やタイムゾーンを設定</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">言語</Label>
                      <select
                        id="language"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                        value={profileData.language}
                        onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                      >
                        <option value="ja">日本語</option>
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timezone">タイムゾーン</Label>
                      <select
                        id="timezone"
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
                        value={profileData.timezone}
                        onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                      >
                        <option value="Asia/Tokyo">東京 (GMT+9)</option>
                        <option value="Asia/Shanghai">上海 (GMT+8)</option>
                        <option value="America/New_York">ニューヨーク (GMT-5)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="font-medium mb-4">表示設定</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">コンパクト表示モード</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">ダークモード（開発中）</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">アニメーション効果</span>
                      </label>
                    </div>
                  </div>

                  <Button>設定を保存</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}