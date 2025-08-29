import React from 'react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-xl">Reform One</span>
            </div>
            <p className="text-sm text-slate-600">
              リフォーム産業新聞社の統合プラットフォーム
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">サービス</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-sm text-slate-600 hover:text-slate-900">
                  機能一覧
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-slate-600 hover:text-slate-900">
                  料金プラン
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-sm text-slate-600 hover:text-slate-900">
                  連携サービス
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">サポート</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-sm text-slate-600 hover:text-slate-900">
                  ドキュメント
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-slate-600 hover:text-slate-900">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-sm text-slate-600 hover:text-slate-900">
                  稼働状況
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">会社情報</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-slate-600 hover:text-slate-900">
                  会社概要
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-slate-600 hover:text-slate-900">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-slate-600 hover:text-slate-900">
                  利用規約
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-slate-600">
            © 2024 リフォーム産業新聞社. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}