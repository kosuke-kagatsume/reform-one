import { useState, ReactNode } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  Building,
  BarChart3,
  Users,
  Calendar,
  Video,
  MessageSquare,
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Home,
  FolderOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'

interface PremierAdminLayoutProps {
  children: ReactNode
}

export function PremierAdminLayout({ children }: PremierAdminLayoutProps) {
  const router = useRouter()
  const { user, logout, isReformCompany } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navigationItems = [
    {
      title: 'ダッシュボード',
      icon: BarChart3,
      href: '/admin/premier',
    },
    {
      title: '契約組織管理',
      icon: Building,
      href: '/admin/premier/organizations',
    },
    {
      title: 'セミナー管理',
      icon: Calendar,
      href: '/admin/premier/seminars',
    },
    {
      title: 'アーカイブ管理',
      icon: Video,
      href: '/admin/premier/archives',
    },
    {
      title: 'コミュニティ管理',
      icon: MessageSquare,
      href: '/admin/premier/community',
    },
    {
      title: '会員一覧',
      icon: Users,
      href: '/admin/premier/members',
    },
    {
      title: 'カテゴリ管理',
      icon: FolderOpen,
      href: '/admin/premier/categories',
    },
  ]

  const isActive = (href: string) => {
    if (href === '/admin/premier') {
      return router.pathname === href
    }
    return router.pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // リフォーム産業新聞社のスタッフのみアクセス可能
  if (!isReformCompany) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">アクセス権限がありません</h1>
          <p className="text-slate-600 mb-4">この管理画面はリフォーム産業新聞社スタッフ専用です</p>
          <Button onClick={() => router.push('/dashboard')}>
            ダッシュボードに戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/admin/premier" className="flex items-center gap-2">
              <Building className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">プレミア購読 管理画面</span>
              <Badge variant="secondary" className="ml-2">社員用</Badge>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="検索..."
                className="pl-10 w-64"
              />
            </div>

            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium">{user?.name || user?.email}</p>
                      <p className="text-xs text-slate-500">管理者</p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user?.name || '管理者'}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <Home className="mr-2 h-4 w-4" />
                  ユーザーダッシュボードへ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                  <Settings className="mr-2 h-4 w-4" />
                  旧管理画面へ
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-slate-200 min-h-[calc(100vh-57px)] transition-all duration-200`}>
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
