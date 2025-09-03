import { useState, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Building,
  BookOpen,
  ShoppingBag,
  TrendingUp,
  Bell,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Shield,
  Newspaper
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

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const currentUser = {
    name: '管理者',
    email: 'admin@reform-s.co.jp',
    role: 'ADMIN',
    department: '管理部'
  }

  const navigationItems = [
    {
      title: 'ダッシュボード',
      icon: BarChart3,
      href: '/admin/dashboard',
      active: router.pathname === '/admin/dashboard'
    },
    {
      title: '顧客管理',
      icon: Users,
      href: '/admin/customers',
      active: router.pathname === '/admin/customers',
      badge: '12'
    },
    {
      title: 'コンテンツ管理',
      icon: FileText,
      href: '/admin/content',
      active: router.pathname === '/admin/content'
    },
    {
      title: '電子新聞',
      icon: Newspaper,
      href: '/admin/newspaper',
      active: router.pathname === '/admin/newspaper',
      badge: '新'
    },
    {
      title: '研修管理',
      icon: BookOpen,
      href: '/admin/training',
      active: router.pathname === '/admin/training'
    },
    {
      title: '建材カタログ',
      icon: ShoppingBag,
      href: '/admin/catalog',
      active: router.pathname === '/admin/catalog'
    },
    {
      title: '売上分析',
      icon: TrendingUp,
      href: '/admin/analytics',
      active: router.pathname === '/admin/analytics'
    },
    {
      title: '設定',
      icon: Settings,
      href: '/admin/settings',
      active: router.pathname === '/admin/settings'
    }
  ]

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
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">Reform One 管理画面</span>
              <Badge variant="secondary" className="ml-2">社員用</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="顧客・コンテンツを検索..."
                className="pl-10 w-64"
              />
            </div>
            
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium">{currentUser.name}</p>
                      <p className="text-xs text-slate-500">{currentUser.department}</p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  プロフィール
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  権限設定
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  設定
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => router.push('/login')}
                >
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
              return (
                <button
                  key={item.title}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    item.active 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="text-sm font-medium">{item.title}</span>
                    )}
                  </div>
                  {sidebarOpen && item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}