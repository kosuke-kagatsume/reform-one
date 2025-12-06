import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import { Shield, Smartphone, Key, CheckCircle, Copy, AlertTriangle } from 'lucide-react'

export default function SecurityPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [setupData, setSetupData] = useState<{ secret: string; otpauthUrl: string } | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [password, setPassword] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setMfaEnabled(user.mfaEnabled || false)
    }
  }, [user])

  const handleSetupMfa = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'エラーが発生しました')
      }

      setSetupData(data.data)
      setShowSetupDialog(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleVerifyMfa = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'エラーが発生しました')
      }

      if (data.data?.backupCodes) {
        setBackupCodes(data.data.backupCodes)
        setShowBackupCodes(true)
        setShowSetupDialog(false)
      }

      setMfaEnabled(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [verifyCode])

  const handleDisableMfa = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, code: disableCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'エラーが発生しました')
      }

      setMfaEnabled(false)
      setShowDisableDialog(false)
      setPassword('')
      setDisableCode('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [password, disableCode])

  const copyBackupCodes = useCallback(() => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
  }, [backupCodes])

  if (isLoading) {
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
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">セキュリティ設定</h1>
          <p className="text-slate-600">アカウントのセキュリティを管理します</p>
        </div>

        {/* 2要素認証 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">2要素認証</CardTitle>
                  <CardDescription>
                    認証アプリを使用してアカウントを保護します
                  </CardDescription>
                </div>
              </div>
              <Badge className={mfaEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                {mfaEnabled ? '有効' : '無効'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {mfaEnabled ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>2要素認証が有効です</span>
                </div>
                <Button variant="outline" onClick={() => setShowDisableDialog(true)}>
                  2要素認証を無効にする
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  2要素認証を有効にすると、ログイン時にパスワードに加えて、認証アプリで生成されるコードが必要になります。
                </p>
                <Button onClick={handleSetupMfa} disabled={loading}>
                  <Shield className="h-4 w-4 mr-2" />
                  {loading ? 'セットアップ中...' : '2要素認証を設定'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* パスワード変更 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Key className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">パスワード</CardTitle>
                <CardDescription>
                  定期的にパスワードを変更することをお勧めします
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push('/forgot-password')}>
              パスワードを変更
            </Button>
          </CardContent>
        </Card>

        {/* 2FA セットアップダイアログ */}
        <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>2要素認証のセットアップ</DialogTitle>
              <DialogDescription>
                認証アプリでQRコードをスキャンするか、シークレットキーを入力してください。
              </DialogDescription>
            </DialogHeader>

            {setupData && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <p className="text-sm text-slate-600 mb-2">シークレットキー:</p>
                  <code className="text-sm font-mono break-all">{setupData.secret}</code>
                </div>

                <div className="text-sm text-slate-600">
                  <p>Google Authenticator, Microsoft Authenticator, または Authy などの認証アプリを使用できます。</p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm" role="alert" aria-live="polite">
                    {error}
                  </div>
                )}

                <div>
                  <Label htmlFor="verifyCode">確認コード</Label>
                  <Input
                    id="verifyCode"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="6桁のコード"
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
                キャンセル
              </Button>
              <Button onClick={handleVerifyMfa} disabled={loading || verifyCode.length !== 6}>
                {loading ? '確認中...' : '確認'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* バックアップコードダイアログ */}
        <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                バックアップコード
              </DialogTitle>
              <DialogDescription>
                これらのコードは二度と表示されません。安全な場所に保管してください。
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="p-2 bg-white rounded border">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" onClick={copyBackupCodes} className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                コードをコピー
              </Button>
            </div>

            <DialogFooter>
              <Button onClick={() => setShowBackupCodes(false)}>
                保存しました
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 2FA 無効化ダイアログ */}
        <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>2要素認証を無効にする</DialogTitle>
              <DialogDescription>
                セキュリティのため、パスワードと認証コードを入力してください。
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm" role="alert">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="現在のパスワード"
                />
              </div>

              <div>
                <Label htmlFor="disableCode">認証コード</Label>
                <Input
                  id="disableCode"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  placeholder="6桁のコードまたはバックアップコード"
                  maxLength={8}
                />
                <p className="text-xs text-slate-500 mt-1">
                  認証アプリのコードまたはバックアップコードを入力
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={handleDisableMfa} disabled={loading || !password || !disableCode}>
                {loading ? '処理中...' : '無効にする'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
