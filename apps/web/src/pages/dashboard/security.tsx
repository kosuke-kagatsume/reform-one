import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Lock,
  Key,
  Smartphone,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  UserCheck,
  AlertCircle,
  Laptop,
  MapPin
} from 'lucide-react'

export default function SecuritySettings() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [mfaEnabled, setMfaEnabled] = useState(true)
  const [ipRestriction, setIpRestriction] = useState(false)

  // Mock data
  const securityScore = 85
  const apiKeys = [
    {
      id: 1,
      name: '本番環境API',
      key: 'sk_live_4242424242424242',
      created: '2024-01-15',
      lastUsed: '2時間前',
      status: 'active'
    },
    {
      id: 2,
      name: '開発環境API',
      key: 'sk_test_1234567890123456',
      created: '2024-02-20',
      lastUsed: '1日前',
      status: 'active'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'login',
      description: 'ログイン成功',
      ip: '192.168.1.1',
      location: '東京, 日本',
      device: 'Chrome on Windows',
      time: '10分前',
      status: 'success'
    },
    {
      id: 2,
      type: 'password_change',
      description: 'パスワード変更',
      ip: '192.168.1.1',
      location: '東京, 日本',
      device: 'Chrome on Windows',
      time: '1時間前',
      status: 'success'
    },
    {
      id: 3,
      type: 'login_failed',
      description: 'ログイン失敗',
      ip: '203.0.113.0',
      location: '不明',
      device: 'Unknown',
      time: '3時間前',
      status: 'failed'
    },
    {
      id: 4,
      type: 'mfa_enabled',
      description: '二要素認証を有効化',
      ip: '192.168.1.1',
      location: '東京, 日本',
      device: 'Chrome on Windows',
      time: '1日前',
      status: 'success'
    }
  ]

  const sessions = [
    {
      id: 1,
      device: 'Chrome on Windows',
      location: '東京, 日本',
      ip: '192.168.1.1',
      lastActive: '現在',
      current: true
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: '大阪, 日本',
      ip: '192.168.2.1',
      lastActive: '2時間前',
      current: false
    },
    {
      id: 3,
      device: 'Chrome on MacOS',
      location: '名古屋, 日本',
      ip: '192.168.3.1',
      lastActive: '1日前',
      current: false
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">セキュリティ設定</h2>
            <p className="text-slate-600">アカウントと組織のセキュリティを管理</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            監査ログをダウンロード
          </Button>
        </div>

        {/* Security Score */}
        <Card>
          <CardHeader>
            <CardTitle>セキュリティスコア</CardTitle>
            <CardDescription>組織のセキュリティレベルの評価</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="relative h-32 w-32">
                <svg className="transform -rotate-90 h-32 w-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-slate-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - securityScore / 100)}`}
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{securityScore}</span>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">二要素認証が有効</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">強力なパスワード設定</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">定期的なセキュリティ監査</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm">IP制限未設定</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Settings */}
          <Card>
            <CardHeader>
              <CardTitle>認証設定</CardTitle>
              <CardDescription>ログインとアクセス制御の設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium">二要素認証（MFA）</p>
                    <p className="text-sm text-slate-500">追加のセキュリティレイヤー</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={mfaEnabled ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                    {mfaEnabled ? '有効' : '無効'}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setMfaEnabled(!mfaEnabled)}
                  >
                    {mfaEnabled ? '無効化' : '有効化'}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium">IPアドレス制限</p>
                    <p className="text-sm text-slate-500">特定のIPからのみアクセス許可</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={ipRestriction ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                    {ipRestriction ? '有効' : '無効'}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIpRestriction(!ipRestriction)}
                  >
                    設定
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium">パスワードポリシー</p>
                    <p className="text-sm text-slate-500">最小8文字、大小英数字混在</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  変更
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle>APIキー管理</CardTitle>
              <CardDescription>APIアクセス用のキーを管理</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">{apiKey.name}</span>
                    </div>
                    <Badge 
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      アクティブ
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded flex-1">
                      {showApiKey ? apiKey.key : '••••••••••••••••'}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>作成: {apiKey.created}</span>
                    <span>最終使用: {apiKey.lastUsed}</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                新しいAPIキーを生成
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>アクティブセッション</CardTitle>
            <CardDescription>現在ログイン中のデバイスとセッション</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Laptop className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium">{session.device}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.location}
                        </span>
                        <span>{session.ip}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.current ? (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        現在のセッション
                      </Badge>
                    ) : (
                      <>
                        <span className="text-sm text-slate-500">{session.lastActive}</span>
                        <Button size="sm" variant="outline" className="text-red-600">
                          終了
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Activity Log */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>セキュリティアクティビティ</CardTitle>
                <CardDescription>最近のセキュリティ関連イベント</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                すべて表示
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="mt-0.5">
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : activity.status === 'failed' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span>{activity.ip}</span>
                      <span>{activity.location}</span>
                      <span>{activity.device}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}