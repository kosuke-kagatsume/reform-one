import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-xl">Reform One</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                機能
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                料金プラン
              </Link>
              <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                会社概要
              </Link>
              <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                お問い合わせ
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">ログイン</Link>
            </Button>
            <Button asChild>
              <Link href="/contact">お問い合わせ</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}