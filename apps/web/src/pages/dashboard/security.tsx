import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth-context'
import {
  Shield,
  Key,
  Smartphone,
  Monitor,
  MapPin,
  Clock,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  RefreshCw,
  LogOut,
  Eye,
  EyeOff,
  Mail,
  Laptop,
  Globe
} from 'lucide-react'

interface Session {
  id: string
  createdAt: string
  lastAccessedAt: string
  userAgent: string
  ipAddress: string
  isCurrent: boolean
}

interface LoginHistory {
  id: string
  action: string
  ip: string
  userAgent: string
  createdAt: string
  success: boolean
}

// パスワード強度計算（13-2）
const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0
  if (password.length >= 8) score += 25
  if (password.length >= 12) score += 15
  if (/[A-Z]/.test(password)) score += 20
  if (/[a-z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 15
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10

  if (score < 40) return { score, label: '弱い', color: 'bg-red-500' }
  if (score < 70) return { score, label: '普通', color: 'bg-yellow-500' }
  return { score, label: '強い', color: 'bg-green-500' }
}

export default function SecurityPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth()

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // MFA state
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [mfaLoading, setMfaLoading] = useState(false)
  const [mfaSetupData, setMfaSetupData] = useState<{ qrCode: string; secret: string } | null>(null)
  const [mfaVerifyCode, setMfaVerifyCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  // Login history state
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const passwordStrength = calculatePasswordStrength(newPassword)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setMfaEnabled(user.mfaEnabled || false)
      fetchSessions()
      fetchLoginHistory()
    }
  }, [user])

  const fetchSessions = async () => {
    if (!user) return
    setSessionsLoading(true)
    try {
      const res = await fetch(`/api/user/sessions?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setSessions(data.data?.sessions || [])
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setSessionsLoading(false)
    }
  }

  const fetchLoginHistory = async () => {
    if (!user) return
    setHistoryLoading(true)
    try {
      const res = await fetch(`/api/user/login-history?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setLoginHistory(data.data?.history || [])
      }
    } catch (error) {
      console.error('Failed to fetch login history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user) return

    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('新しいパスワードが一致しません')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('パスワードは8文字以上必要です')
      return
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError('パスワードには大文字、小文字、数字を含めてください')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword
        })
      })

      const data = await res.json()

      if (res.ok) {
        setPasswordSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordError(data.message || 'パスワード変更に失敗しました')
      }
    } catch (error) {
      setPasswordError('エラーが発生しました')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSetupMfa = async () => {
    if (!user) return

    setMfaLoading(true)
    try {
      const res = await fetch('/api/user/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await res.json()

      if (res.ok) {
        setMfaSetupData(data.data)
      }
    } catch (error) {
      console.error('Failed to setup MFA:', error)
    } finally {
      setMfaLoading(false)
    }
  }

  const handleVerifyMfa = async () => {
    if (!user || !mfaVerifyCode) return

    setMfaLoading(true)
    try {
      const res = await fetch('/api/user/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          code: mfaVerifyCode
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMfaEnabled(true)
        setMfaSetupData(null)
        setMfaVerifyCode('')
        setBackupCodes(data.data?.backupCodes || [])
        setShowBackupCodes(true)
      }
    } catch (error) {
      console.error('Failed to verify MFA:', error)
    } finally {
      setMfaLoading(false)
    }
  }

  const handleDisableMfa = async () => {
    if (!user) return

    if (!confirm('二要素認証を無効にしますか？アカウントのセキュリティが低下します。')) {
      return
    }

    setMfaLoading(true)
    try {
      const res = await fetch('/api/user/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (res.ok) {
        setMfaEnabled(false)
        setBackupCodes([])
      }
    } catch (error) {
      console.error('Failed to disable MFA:', error)
    } finally {
      setMfaLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    if (!user) return

    if (!confirm('このセッションを終了しますか？')) {
      return
    }

    try {
      const res = await fetch('/api/user/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          sessionId
        })
      })

      if (res.ok) {
        fetchSessions()
      }
    } catch (error) {
      console.error('Failed to revoke session:', error)
    }
  }

  const handleRevokeAllSessions = async () => {
    if (!user) return

    if (!confirm('現在のセッション以外をすべて終了しますか？')) {
      return
    }

    try {
      const res = await fetch('/api/user/sessions/revoke-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (res.ok) {
        fetchSessions()
      }
    } catch (error) {
      console.error('Failed to revoke all sessions:', error)
    }
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const parseUserAgent = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return { name: 'Chrome', icon: Globe }
    if (userAgent.includes('Firefox')) return { name: 'Firefox', icon: Globe }
    if (userAgent.includes('Safari')) return { name: 'Safari', icon: Globe }
    if (userAgent.includes('Edge')) return { name: 'Edge', icon: Globe }
    if (userAgent.includes('Mobile')) return { name: 'モバイル', icon: Smartphone }
    return { name: 'ブラウザ', icon: Laptop }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* タイトル（13-9: メニュー強調） */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-600" />
            セキュリティ設定
          </h1>
          <p className="text-slate-600">アカウントのセキュリティを管理</p>
        </div>

        {/* 警告文（13-1） */}
        {isAdmin && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">
                  セキュリティ設定は重要な操作です。不明な点がある場合は管理者以外の方は操作を控えてください。
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Password Change（13-2, 13-3） */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5" />
              パスワード変更
            </CardTitle>
            <CardDescription>
              {/* パスワード条件明示（13-2） */}
              8文字以上、英大文字・小文字・数字を含む。記号の使用を推奨します。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">現在のパスワード</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="現在のパスワード"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">新しいパスワード</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="新しいパスワード"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* パスワード強度表示（13-2） */}
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">パスワード強度</span>
                    <span className={`font-medium ${passwordStrength.score >= 70 ? 'text-green-600' : passwordStrength.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <Progress value={passwordStrength.score} className={`h-1 ${passwordStrength.color}`} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="新しいパスワード（確認）"
              />
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {passwordError}
              </div>
            )}

            {/* 成功メッセージ（13-3） */}
            {passwordSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">パスワードを変更しました。セキュリティのため再ログインをお勧めします。</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleChangePassword}
              disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
            >
              {passwordLoading ? '変更中...' : 'パスワードを変更'}
            </Button>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication（13-4, 13-5） */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              {/* 2FA見出し強化（13-4） */}
              二要素認証（2FA）
              <Badge className="ml-2 bg-red-100 text-red-700 border-red-200">
                【強く推奨】
              </Badge>
            </CardTitle>
            {/* 認証アプリ説明（13-5） */}
            <CardDescription>
              スマートフォンの認証アプリ（Google Authenticator, Authy等）を使用して、
              ログイン時に6桁の確認コードを入力する追加のセキュリティ層を設定します。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium">認証アプリ</p>
                  <p className="text-sm text-slate-500">Google Authenticator, Authy など</p>
                </div>
              </div>
              {/* 有効/無効表示（13-4） */}
              <Badge className={mfaEnabled ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}>
                {mfaEnabled ? (
                  <><CheckCircle className="h-3 w-3 mr-1" />有効</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" />無効</>
                )}
              </Badge>
            </div>

            {!mfaEnabled && !mfaSetupData && (
              <Button onClick={handleSetupMfa} disabled={mfaLoading}>
                {mfaLoading ? '設定中...' : '二要素認証を設定'}
              </Button>
            )}

            {mfaSetupData && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-4">
                    認証アプリでQRコードをスキャンするか、シークレットキーを手動で入力してください
                  </p>
                  <div className="bg-white p-4 inline-block rounded-lg shadow-sm mb-4">
                    <img src={mfaSetupData.qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-xs text-slate-500 font-mono break-all">
                    シークレットキー: {mfaSetupData.secret}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mfa-code">認証コード（6桁）</Label>
                  <Input
                    id="mfa-code"
                    value={mfaVerifyCode}
                    onChange={(e) => setMfaVerifyCode(e.target.value)}
                    placeholder="認証アプリに表示された6桁のコードを入力"
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleVerifyMfa} disabled={mfaLoading || mfaVerifyCode.length !== 6}>
                    {mfaLoading ? '確認中...' : '確認して有効化'}
                  </Button>
                  <Button variant="outline" onClick={() => setMfaSetupData(null)}>
                    キャンセル
                  </Button>
                </div>
              </div>
            )}

            {mfaEnabled && (
              <Button variant="outline" onClick={handleDisableMfa} disabled={mfaLoading}>
                二要素認証を無効化
              </Button>
            )}

            {showBackupCodes && backupCodes.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">バックアップコード</p>
                    <p className="text-sm text-amber-700">
                      これらのコードは安全な場所に保存してください。認証アプリにアクセスできない場合に使用できます。
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="bg-white px-3 py-1 rounded text-sm font-mono">
                      {code}
                    </code>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={copyBackupCodes}>
                  <Copy className="h-4 w-4 mr-2" />
                  コピー
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Sessions（13-6） */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  {/* セッション管理改善（13-6） */}
                  ログイン中の端末
                </CardTitle>
                <CardDescription>
                  現在ログインしているデバイス一覧
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchSessions} disabled={sessionsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${sessionsLoading ? 'animate-spin' : ''}`} />
                  更新
                </Button>
                {/* 全ログアウト機能（13-6） */}
                {sessions.length > 1 && (
                  <Button variant="outline" size="sm" onClick={handleRevokeAllSessions} className="text-red-600 hover:text-red-700">
                    <LogOut className="h-4 w-4 mr-2" />
                    他をすべてログアウト
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <p className="text-slate-500 text-center py-4">読み込み中...</p>
            ) : sessions.length === 0 ? (
              <p className="text-slate-500 text-center py-4">セッション情報がありません</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const browser = parseUserAgent(session.userAgent)
                  const BrowserIcon = browser.icon

                  return (
                    <div
                      key={session.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        session.isCurrent ? 'border-blue-200 bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* 端末種別アイコン（13-7） */}
                        <BrowserIcon className="h-5 w-5 text-slate-500" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{browser.name}</p>
                            {session.isCurrent && (
                              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">現在のセッション</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.ipAddress || '不明'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(session.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Login History（13-7） */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  ログイン履歴
                </CardTitle>
                <CardDescription>
                  最近のログインアクティビティ
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchLoginHistory} disabled={historyLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${historyLoading ? 'animate-spin' : ''}`} />
                更新
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <p className="text-slate-500 text-center py-4">読み込み中...</p>
            ) : loginHistory.length === 0 ? (
              <p className="text-slate-500 text-center py-4">ログイン履歴がありません</p>
            ) : (
              <div className="space-y-3">
                {loginHistory.map((entry) => {
                  const browser = parseUserAgent(entry.userAgent || '')

                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        !entry.success ? 'border-red-200 bg-red-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* 成功/失敗アイコン（13-7） */}
                        {entry.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {entry.action === 'user.login' ? 'ログイン' : entry.action}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {entry.ip || '不明'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Monitor className="h-3 w-3" />
                              {browser.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(entry.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={entry.success ? 'default' : 'destructive'}>
                        {entry.success ? '成功' : '失敗'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* サポート導線（13-8） */}
        <Card className="bg-slate-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>不審なログインやセキュリティに関する問題がある場合</span>
              </div>
              <Button variant="link" asChild className="p-0 h-auto">
                <a href="mailto:premium@the-reform.co.jp">
                  <Mail className="h-4 w-4 mr-1" />
                  サポートに連絡
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
