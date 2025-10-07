import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Package, BookOpen } from 'lucide-react'

export function ServicesWidget() {
  const services = [
    {
      name: '電子版',
      icon: FileText,
      status: 'active',
      users: 892,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      name: '建材トレンド',
      icon: Package,
      status: 'active',
      users: 456,
      color: 'bg-green-100 text-green-600'
    },
    {
      name: '研修プログラム',
      icon: BookOpen,
      status: 'active',
      users: 234,
      color: 'bg-purple-100 text-purple-600'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>サービス利用状況</CardTitle>
        <CardDescription>各サービスの利用者数とステータス</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${service.color}`}>
                  <service.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-slate-500">{service.users} アクティブユーザー</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                稼働中
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
