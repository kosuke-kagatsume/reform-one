import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Building,
  Users,
  Settings,
  Shield,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Upload,
  AlertCircle
} from 'lucide-react'

export default function OrganizationSettings() {
  const [isEditing, setIsEditing] = useState(false)
  const [orgData, setOrgData] = useState({
    name: '株式会社テスト組織',
    domain: 'test-org.com',
    email: 'contact@test-org.com',
    phone: '03-1234-5678',
    address: '東京都千代田区丸の内1-1-1',
    website: 'https://test-org.com',
    industry: 'リフォーム・建設',
    size: '50-100名',
    established: '2020-01-01',
    description: 'リフォーム業界のデジタル化を推進する企業です。'
  })

  const [editData, setEditData] = useState(orgData)

  const handleEdit = () => {
    setIsEditing(true)
    setEditData(orgData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData(orgData)
  }

  const handleSave = () => {
    setOrgData(editData)
    setIsEditing(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">組織管理</h2>
            <p className="text-slate-600">組織の基本情報と設定を管理</p>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                キャンセル
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organization Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>組織の基本的な情報を管理します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">組織名</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        name="name"
                        value={editData.name}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-slate-700">{orgData.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="domain">ドメイン</Label>
                    {isEditing ? (
                      <Input
                        id="domain"
                        name="domain"
                        value={editData.domain}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-slate-700">{orgData.domain}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={editData.email}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-slate-700">{orgData.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">電話番号</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        name="phone"
                        value={editData.phone}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-slate-700">{orgData.phone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">ウェブサイト</Label>
                    {isEditing ? (
                      <Input
                        id="website"
                        name="website"
                        value={editData.website}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-slate-700">{orgData.website}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">業界</Label>
                    {isEditing ? (
                      <Input
                        id="industry"
                        name="industry"
                        value={editData.industry}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm text-slate-700">{orgData.industry}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">住所</Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      name="address"
                      value={editData.address}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{orgData.address}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  {isEditing ? (
                    <textarea
                      id="description"
                      name="description"
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                      rows={3}
                      value={editData.description}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{orgData.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Domain Settings */}
            <Card>
              <CardHeader>
                <CardTitle>ドメイン設定</CardTitle>
                <CardDescription>組織のドメインと認証設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Globe className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium">test-org.com</p>
                      <p className="text-sm text-slate-500">認証済みドメイン</p>
                    </div>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    認証済み
                  </Badge>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">自動参加機能が有効です</p>
                      <p>@test-org.com のメールアドレスを持つユーザーは自動的に組織に参加できます。</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  ドメインを追加
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization Stats */}
            <Card>
              <CardHeader>
                <CardTitle>組織の統計</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">メンバー数</span>
                  </div>
                  <span className="font-semibold">48 / 50</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">プラン</span>
                  </div>
                  <Badge>プレミアム</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">登録日</span>
                  </div>
                  <span className="text-sm font-medium">2020年1月</span>
                </div>
              </CardContent>
            </Card>

            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle>組織ロゴ</CardTitle>
                <CardDescription>ロゴをアップロードして組織をカスタマイズ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Building className="h-12 w-12 text-slate-400" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    ロゴをアップロード
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    推奨: 512x512px、PNG または JPG
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">危険ゾーン</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                  組織を削除
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  この操作は取り消せません
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}