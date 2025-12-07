import React, { useState } from 'react'
import Link from 'next/link'
import {
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Book,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: 'セミナーの参加方法を教えてください',
    answer: 'ダッシュボードの「セミナー」メニューから参加したいセミナーを選択し、「参加申し込み」ボタンをクリックしてください。Zoomリンクはセミナー開始前にメールでお送りします。'
  },
  {
    question: 'アーカイブ動画はいつまで視聴できますか？',
    answer: 'ご契約期間中は無制限でアーカイブ動画をご視聴いただけます。過去のセミナー動画も順次追加されていきます。'
  },
  {
    question: 'プランの変更はできますか？',
    answer: 'はい、いつでもプランの変更が可能です。「請求・支払い」メニューからプラン変更をお申し込みください。アップグレードは即時反映、ダウングレードは次回更新時に反映されます。'
  },
  {
    question: 'メンバーの追加方法は？',
    answer: '「メンバー管理」メニューから「メンバーを招待」ボタンをクリックし、招待したい方のメールアドレスを入力してください。招待メールが送信されます。'
  },
  {
    question: 'パスワードを忘れた場合は？',
    answer: 'ログイン画面の「パスワードをお忘れの方」リンクをクリックし、登録メールアドレスを入力してください。パスワードリセット用のメールが送信されます。'
  },
  {
    question: '請求書の発行はできますか？',
    answer: 'はい、「請求・支払い」メニューから過去の請求書をダウンロードできます。PDF形式で発行されます。'
  }
]

export function FAQDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-50 rounded-lg"
        title="ヘルプ"
      >
        <HelpCircle className="h-5 w-5 text-slate-600" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-20 max-h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                ヘルプ・FAQ
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* Quick Links */}
              <div className="p-4 border-b bg-slate-50">
                <p className="text-xs text-slate-500 mb-2 font-medium">クイックリンク</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/dashboard/guide"
                    className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-blue-50 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Book className="h-4 w-4" />
                    ご利用ガイド
                  </Link>
                  <a
                    href="mailto:support@the-reform.co.jp"
                    className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-blue-50 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    お問い合わせ
                  </a>
                </div>
              </div>

              {/* FAQ List */}
              <div className="p-4">
                <p className="text-xs text-slate-500 mb-3 font-medium">よくあるご質問</p>
                <div className="space-y-2">
                  {faqItems.map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(index)}
                        className="flex items-center justify-between w-full p-3 text-left hover:bg-slate-50"
                      >
                        <span className="text-sm font-medium text-slate-700 pr-2">
                          {item.question}
                        </span>
                        {expandedIndex === index ? (
                          <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                      {expandedIndex === index && (
                        <div className="px-3 pb-3">
                          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Section */}
              <div className="p-4 border-t bg-gradient-to-r from-blue-50 to-blue-100">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  お困りのことがありましたら
                </p>
                <p className="text-xs text-slate-500 mb-3">
                  カスタマーサポートまでお気軽にお問い合わせください
                </p>
                <div className="flex gap-2">
                  <a
                    href="tel:03-1234-5678"
                    className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    電話
                  </a>
                  <a
                    href="mailto:support@the-reform.co.jp"
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 rounded-lg text-sm text-white hover:bg-blue-700 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    お問い合わせ
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
