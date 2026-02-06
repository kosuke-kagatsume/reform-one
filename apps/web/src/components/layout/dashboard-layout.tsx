import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { NotificationCenter } from './notification-center'
import { FAQDropdown } from './faq-dropdown'
import { useAuth } from '@/lib/auth-context'
import { ROLE_MENU_ACCESS, UserRole } from '@/types/premier'
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
  Shield,
  ChevronDown,
  User,
  Calendar,
  Video,
  MessageSquare,
  Building2,
  Wrench,
  Award,
  Mail,
  Crown
} from 'lucide-react'

interface NavItem {
  menuId: string
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  subLabel?: string
}

interface NavGroup {
  label: string
  isAdminSection?: boolean
  items: NavItem[]
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { user, planType, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // ユーザーのロールを取得（後方互換性のためMEMBERをデフォルトに）
  const userRole = (user?.role || 'MEMBER') as UserRole

  // 管理者かどうかを判定
  const isAdmin = userRole === 'ADMIN' || userRole === 'OWNER'

  // プラン名を取得（統一表記）
  const getPlanDisplayName = () => {
    if (user?.organization?.type === 'REFORM_COMPANY') {
      return 'プレミア購読｜管理者'
    }
    const roleLabel = isAdmin ? '（管理者）' : ''

    if (planType === 'EXPERT') {
      return `プレミア購読｜エキスパートプラン${roleLabel}`
    }
    return `プレミア購読｜スタンダードプラン${roleLabel}`
  }

  // ロールに基づいてアクセス可能なメニューをチェック
  const canAccessMenu = (menuId: string) => {
    // リフォーム産業新聞社は全てアクセス可能
    if (user?.organization?.type === 'REFORM_COMPANY') return true
    // ADMINロール（従来の）はOWNER扱い
    const effectiveRole = userRole === 'ADMIN' ? 'OWNER' : userRole
    const accessList = ROLE_MENU_ACCESS[effectiveRole] || ROLE_MENU_ACCESS.MEMBER
    return accessList.includes(menuId)
  }

  // グループ分けされたナビゲーション（menuIdを追加）
  // D-1: 利用/管理者メニュー分離の明確化
  const navigationGroups: NavGroup[] = [
    {
      label: '利用する',
      items: [
        { menuId: 'dashboard', name: 'ダッシュボード', href: '/dashboard', icon: Home },
        { menuId: 'seminars', name: 'セミナー', href: '/dashboard/seminars', icon: Calendar },
        { menuId: 'archives', name: 'アーカイブ', href: '/dashboard/archives', icon: Video },
        { menuId: 'community', name: 'コミュニティ', href: '/dashboard/community', icon: MessageSquare },
        { menuId: 'databooks', name: 'データブック', href: '/dashboard/databooks', icon: FileText },
        { menuId: 'newsletters', name: 'ニュースレター', href: '/dashboard/newsletters', icon: Mail },
        { menuId: 'site-visits', name: '視察会', href: '/dashboard/site-visits', icon: Building2 },
        { menuId: 'tools', name: 'ツール', href: '/dashboard/tools', icon: Wrench },
        { menuId: 'qualifications', name: '資格', href: '/dashboard/qualifications', icon: Award },
      ]
    },
    {
      label: '管理者メニュー',
      isAdminSection: true,
      items: [
        { menuId: 'members', name: 'メンバー管理', href: '/dashboard/members', icon: Users },
        { menuId: 'organization', name: '組織設定', href: '/dashboard/organization', icon: Building },
        { menuId: 'billing', name: '請求・支払い', href: '/dashboard/billing', icon: CreditCard },
        { menuId: 'security', name: 'セキュリティ', href: '/dashboard/security', icon: Shield },
        { menuId: 'settings', name: '設定', href: '/dashboard/settings', icon: Settings },
      ]
    }
  ]

  // 権限に基づいてフィルタリングされたナビゲーション
  const filteredNavigationGroups = navigationGroups.map(group => ({
    ...group,
    items: group.items.filter(item => canAccessMenu(item.menuId))
  })).filter(group => group.items.length > 0)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // D-5: アクティブ状態の色を取得
  const getActiveStyles = () => {
    if (planType === 'EXPERT') {
      return {
        active: 'bg-purple-100 text-purple-700 font-semibold border-l-4 border-purple-600',
        hover: 'hover:bg-purple-50 hover:text-purple-600'
      }
    }
    return {
      active: 'bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-600',
      hover: 'hover:bg-blue-50 hover:text-blue-600'
    }
  }

  const activeStyles = getActiveStyles()

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
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              planType === 'EXPERT'
                ? 'bg-gradient-to-br from-purple-600 to-purple-700'
                : 'bg-gradient-to-br from-blue-600 to-blue-700'
            }`}>
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight">{getPlanDisplayName()}</span>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          {filteredNavigationGroups.map((group, groupIndex) => {
            const isAdminSection = 'isAdminSection' in group && group.isAdminSection
            return (
              <div key={group.label} className={groupIndex > 0 ? 'mt-4' : ''}>
                {/* D-2: 管理者セクションは区切り線と背景で強調 */}
                {isAdminSection && (
                  <div className="border-t-2 border-slate-300 pt-4 mb-2 mt-2" />
                )}
                <h3 className={`px-3 mb-2 text-xs uppercase tracking-wider ${
                  isAdminSection
                    ? 'font-bold text-slate-700 flex items-center gap-1'
                    : 'font-semibold text-slate-400'
                }`}>
                  {isAdminSection && <Shield className="h-3 w-3" />}
                  {group.label}
                </h3>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = router.pathname === item.href || 
                      (item.href !== '/dashboard' && router.pathname.startsWith(item.href))
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-r-lg text-sm transition-colors ${
                            isActive
                              ? activeStyles.active
                              : `text-slate-600 ${activeStyles.hover}`
                          }`}
                        >
                          <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? '' : 'text-slate-400'}`} />
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>
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
            <NotificationCenter userId={user?.id || ''} />

            <FAQDropdown />

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-lg"
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  planType === 'EXPERT'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {user?.name ? (
                    <span className="font-medium text-sm">{user.name.charAt(0)}</span>
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:block">{user?.name || '管理者'}</span>
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
                      <p className="text-sm font-medium">{user?.email || ''}</p>
                      <p className="text-xs text-slate-500">{user?.organization?.name || ''}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        プロフィール
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        設定
                      </Link>
                      <hr className="my-2" />
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