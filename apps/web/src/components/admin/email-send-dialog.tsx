import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Mail, AlertCircle, CheckCircle, Users, User, Calendar } from 'lucide-react'

type EmailType = 'CONTACT' | 'RENEWAL_NOTICE'
type RecipientType = 'USER' | 'ORGANIZATION'

interface Recipient {
  id: string
  name: string
  email?: string
  organizationName?: string
  planType?: string
  expiresAt?: string | null
  daysRemaining?: number
  userCount?: number
}

interface EmailSendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  emailType: EmailType
  recipientType: RecipientType
  recipient: Recipient | null
  onSuccess?: () => void
}

export function EmailSendDialog({
  open,
  onOpenChange,
  emailType,
  recipientType,
  recipient,
  onSuccess
}: EmailSendDialogProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [result, setResult] = useState<{ emailsSent: number; emailsFailed: number } | null>(null)

  // Reset form when dialog opens with new recipient
  useEffect(() => {
    if (open && recipient) {
      setError(null)
      setSuccess(false)
      setResult(null)

      if (emailType === 'CONTACT') {
        setSubject('')
        setMessage('')
        setContactInfo('')
      } else if (emailType === 'RENEWAL_NOTICE') {
        const orgName = recipientType === 'ORGANIZATION'
          ? recipient.name
          : recipient.organizationName || ''
        setSubject(`【プレミア購読】${orgName}様 契約更新のご案内`)
        setMessage('')
        setContactInfo('更新手続きについては、このメールに返信してお問い合わせください。')
      }
    }
  }, [open, recipient?.id, emailType, recipientType])

  const handleSubmit = async () => {
    if (!recipient) return

    if (!subject.trim()) {
      setError('件名を入力してください')
      return
    }

    if (emailType === 'CONTACT' && !message.trim()) {
      setError('メッセージを入力してください')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/premier/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          recipientId: recipient.id,
          recipientType,
          subject,
          message: emailType === 'CONTACT' ? message : undefined,
          contactInfo: emailType === 'RENEWAL_NOTICE' ? contactInfo : undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'メール送信に失敗しました')
      }

      setSuccess(true)
      setResult({ emailsSent: data.emailsSent, emailsFailed: data.emailsFailed })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メール送信に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setSubject('')
    setMessage('')
    setContactInfo('')
    setError(null)
    setSuccess(false)
    setResult(null)
    onOpenChange(false)
  }

  const getTitle = () => {
    if (emailType === 'CONTACT') {
      return '連絡メールを送信'
    }
    return '契約更新のお知らせを送信'
  }

  const getDescription = () => {
    if (!recipient) return ''

    if (recipientType === 'ORGANIZATION') {
      return `${recipient.name} の全メンバーにメールを送信します`
    }
    return `${recipient.name} にメールを送信します`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!recipient) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6">
            <div className="text-center space-y-4">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-lg">メールを送信しました</p>
                {result && (
                  <p className="text-sm text-slate-600 mt-1">
                    {result.emailsSent}件送信完了
                    {result.emailsFailed > 0 && (
                      <span className="text-red-600">、{result.emailsFailed}件失敗</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Recipient Info */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {recipientType === 'ORGANIZATION' ? (
                    <Users className="h-4 w-4 text-slate-500" />
                  ) : (
                    <User className="h-4 w-4 text-slate-500" />
                  )}
                  <span className="font-medium">{recipient.name}</span>
                </div>
                {recipient.planType && (
                  <Badge variant="outline">{recipient.planType}</Badge>
                )}
              </div>

              {recipientType === 'ORGANIZATION' && recipient.userCount !== undefined && (
                <p className="text-sm text-slate-600">
                  {recipient.userCount}名のメンバーに送信されます
                </p>
              )}

              {emailType === 'RENEWAL_NOTICE' && recipient.expiresAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>契約終了日: {formatDate(recipient.expiresAt)}</span>
                  {recipient.daysRemaining !== undefined && (
                    <Badge
                      variant={recipient.daysRemaining <= 0 ? 'destructive' : recipient.daysRemaining <= 7 ? 'destructive' : recipient.daysRemaining <= 30 ? 'secondary' : 'outline'}
                    >
                      {recipient.daysRemaining <= 0 ? '期限切れ' : `残り${recipient.daysRemaining}日`}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">件名 *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="メールの件名を入力"
              />
            </div>

            {/* Message (for CONTACT type) */}
            {emailType === 'CONTACT' && (
              <div className="space-y-2">
                <Label htmlFor="message">メッセージ *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="送信するメッセージを入力してください"
                  rows={6}
                />
              </div>
            )}

            {/* Contact Info (for RENEWAL_NOTICE type) */}
            {emailType === 'RENEWAL_NOTICE' && (
              <div className="space-y-2">
                <Label htmlFor="contactInfo">連絡先情報</Label>
                <Textarea
                  id="contactInfo"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="更新手続きの連絡先や方法を記載"
                  rows={3}
                />
                <p className="text-xs text-slate-500">
                  更新手続きに関する連絡先や方法をメールに記載します
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {success ? (
            <Button onClick={handleClose}>閉じる</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={submitting}>
                キャンセル
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? '送信中...' : '送信する'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
