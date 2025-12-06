import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Home,
  Users,
  Building,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  BarChart3,
  Shield,
  Bell,
  HelpCircle,
  ChevronDown,
  User,
  BookOpen,
  Package,
  GraduationCap,
  Calendar,
  Video,
  MessageSquare,
  Building2,
  Wrench,
  Award,
  Mail
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const navigation = [
    { name: 'ダッシュボード', href: '/dashboard', icon: Home },
    { name: 'セミナー', href: '/dashboard/seminars', icon: Calendar },
    { name: 'アーカイブ', href: '/dashboard/archives', icon: Video },
    { name: 'コミュニティ', href: '/dashboard/community', icon: MessageSquare },
    { name: 'データブック', href: '/dashboard/databooks', icon: FileText },
    { name: 'ニュースレター', href: '/dashboard/newsletters', icon: Mail },
    { name: '視察会', href: '/dashboard/site-visits', icon: Building2 },
    { name: 'ツール', href: '/dashboard/tools', icon: Wrench },
    { name: '資格・研修', href: '/dashboard/qualifications', icon: Award },
    { name: 'メンバー管理', href: '/dashboard/members', icon: Users },
    { name: '組織設定', href: '/dashboard/organization', icon: Building },
    { name: '請求・支払い', href: '/dashboard/billing', icon: CreditCard },
    { name: 'セキュリティ', href: '/dashboard/security', icon: Shield },
    { name: '設定', href: '/dashboard/settings', icon: Settings },
  ]

  const handleLogout = () => {
    // TODO: Implement logout logic
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r transform transition-transform lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-xl">Reform One</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 w-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white border-b px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 px-4">
            <h1 className="text-lg font-semibold">ダッシュボード</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-50 rounded-lg">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            <button className="p-2 hover:bg-slate-50 rounded-lg">
              <HelpCircle className="h-5 w-5 text-slate-600" />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-lg"
              >
                <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <span className="text-sm font-medium">管理者</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20">
                    <div className="p-3 border-b">
                      <p className="text-sm font-medium">admin@test-org.com</p>
                      <p className="text-xs text-slate-500">株式会社テスト組織</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md"
                      >
                        <User className="h-4 w-4" />
                        プロフィール
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md"
                      >
                        <Settings className="h-4 w-4" />
                        設定
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        ログアウト
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}