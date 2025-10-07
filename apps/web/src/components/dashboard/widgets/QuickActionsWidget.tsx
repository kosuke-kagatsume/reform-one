import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, CreditCard, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export function QuickActionsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>クイックアクション</CardTitle>
        <CardDescription>よく使う機能へのショートカット</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button className="w-full justify-start" variant="outline" asChild>
          <Link href="/dashboard/users/invite">
            <Users className="h-4 w-4 mr-2" />
            ユーザーを招待
          </Link>
        </Button>
        <Button className="w-full justify-start" variant="outline" asChild>
          <Link href="/dashboard/billing">
            <CreditCard className="h-4 w-4 mr-2" />
            請求書を確認
          </Link>
        </Button>
        <Button className="w-full justify-start" variant="outline" asChild>
          <Link href="/dashboard/reports">
            <FileText className="h-4 w-4 mr-2" />
            レポート作成
          </Link>
        </Button>
        <Button className="w-full justify-start" variant="outline" asChild>
          <Link href="/dashboard/security">
            <AlertCircle className="h-4 w-4 mr-2" />
            セキュリティ設定
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
