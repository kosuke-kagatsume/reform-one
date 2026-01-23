import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import {
  BookOpen,
  Calendar,
  Video,
  MessageSquare,
  FileText,
  Mail,
  Building2,
  Wrench,
  Award,
  Users,
  CreditCard,
  Settings,
  ChevronRight,
  Play,
  Download,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface GuideSection {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  items: {
    title: string
    description: string
    link?: string
  }[]
  planRequired?: 'EXPERT' | 'STANDARD'
}

export default function GuidePage() {
  const { planType } = useAuth()

  const guideSections: GuideSection[] = [
    {
      title: 'セミナー',
      description: 'オンラインセミナーへの参加方法',
      icon: Calendar,
      items: [
        {
          title: '参加申し込み',
          description: 'セミナー一覧から参加したいセミナーを選択し、「参加申し込み」ボタンをクリックします。',
          link: '/dashboard/seminars'
        },
        {
          title: '参加方法',
          description: 'セミナー開始前にZoomリンクがメールで届きます。開始時間になったらリンクをクリックして参加してください。'
        },
        {
          title: 'キャンセル',
          description: '参加をキャンセルする場合は、セミナー詳細ページから「参加をキャンセル」ボタンをクリックしてください。'
        }
      ]
    },
    {
      title: 'アーカイブ動画',
      description: '過去のセミナー動画の視聴方法',
      icon: Video,
      items: [
        {
          title: '視聴方法',
          description: 'アーカイブ一覧から見たい動画を選択し、視聴ボタンをクリックします。',
          link: '/dashboard/archives'
        },
        {
          title: '視聴期間',
          description: 'ご契約期間中は無制限でアーカイブ動画をご視聴いただけます。'
        },
        {
          title: '資料ダウンロード',
          description: 'セミナー資料がある場合は、動画視聴ページからダウンロードできます。'
        }
      ]
    },
    {
      title: 'コミュニティ',
      description: '会員専用コミュニティの利用方法',
      icon: MessageSquare,
      planRequired: 'EXPERT',
      items: [
        {
          title: 'コミュニティ参加',
          description: 'エキスパートプラン限定のコミュニティに参加できます。',
          link: '/dashboard/community'
        },
        {
          title: '投稿・コメント',
          description: 'テーマごとのコミュニティで投稿やコメントができます。'
        },
        {
          title: '定例会',
          description: '各コミュニティの定例会にオンラインで参加できます。'
        }
      ]
    },
    {
      title: 'データブック',
      description: '業界データ・レポートの活用方法',
      icon: FileText,
      planRequired: 'EXPERT',
      items: [
        {
          title: 'ダウンロード',
          description: 'データブックページから最新のレポートをダウンロードできます。',
          link: '/dashboard/databooks'
        },
        {
          title: '社員への共有',
          description: '管理者の方は、社員にダウンロードリンクを共有できます。'
        },
        {
          title: '解説セミナー',
          description: 'データブックの解説セミナーも定期的に開催しています。'
        }
      ]
    },
    {
      title: 'ニュースレター',
      description: '編集長・報道部長からの最新情報',
      icon: Mail,
      items: [
        {
          title: '配信内容',
          description: 'リフォーム産業新聞の編集長・報道部長が、業界の最新動向をお届けします。',
          link: '/dashboard/newsletters'
        },
        {
          title: '配信設定',
          description: '設定ページからメール配信のオン/オフを切り替えられます。'
        },
        {
          title: 'バックナンバー',
          description: '過去のニュースレターはいつでも閲覧・ダウンロードできます。'
        }
      ]
    },
    {
      title: '視察会',
      description: '他社見学ツアーへの参加方法',
      icon: Building2,
      items: [
        {
          title: '参加申し込み',
          description: '視察会ページから参加したい視察会を選択して申し込みます。',
          link: '/dashboard/site-visits'
        },
        {
          title: '参加費用',
          description: 'エキスパートプランは1社2名まで無料、スタンダードプランは有料となります。'
        },
        {
          title: '当日の流れ',
          description: '申し込み後、詳細な案内メールが届きます。'
        }
      ]
    },
    {
      title: 'ツール',
      description: '業務支援ツールの利用方法',
      icon: Wrench,
      items: [
        {
          title: 'ダウンロード',
          description: '各種テンプレートやチェックリストをダウンロードできます。',
          link: '/dashboard/tools'
        },
        {
          title: '活用方法',
          description: 'Excel・Word形式でそのまま業務にお使いいただけます。'
        }
      ]
    },
    {
      title: 'メンバー管理',
      description: '社内メンバーの管理方法（管理者向け）',
      icon: Users,
      items: [
        {
          title: 'メンバー招待',
          description: 'メンバー管理ページから社員を招待できます。',
          link: '/dashboard/members'
        },
        {
          title: '権限設定',
          description: '管理者・一般メンバーの権限を設定できます。'
        },
        {
          title: 'メンバー削除',
          description: '退職者などのアカウントを無効化できます。'
        }
      ]
    },
    {
      title: '請求・支払い',
      description: '契約・請求に関する操作方法（管理者向け）',
      icon: CreditCard,
      items: [
        {
          title: 'プラン確認',
          description: '現在のプランと契約期間を確認できます。',
          link: '/dashboard/billing'
        },
        {
          title: 'プラン変更',
          description: 'スタンダード→エキスパートは即時、エキスパート→スタンダードは更新時に反映。'
        },
        {
          title: '請求書',
          description: '過去の請求書をPDF形式でダウンロードできます。'
        }
      ]
    }
  ]

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            ご利用ガイド
          </h1>
          <p className="text-slate-600 mt-1">
            プレミア購読サービスの各機能の使い方をご説明します
          </p>
        </div>

        <div className="space-y-6">
          {guideSections.map((section, index) => {
            const isRestricted = section.planRequired === 'EXPERT' && planType !== 'EXPERT'

            return (
              <Card key={index} className={isRestricted ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        section.planRequired === 'EXPERT'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        <section.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                    {section.planRequired === 'EXPERT' && (
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        エキスパート限定
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-slate-600">{itemIndex + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{item.title}</p>
                          <p className="text-sm text-slate-600 mt-0.5">{item.description}</p>
                        </div>
                        {item.link && !isRestricted && (
                          <Link
                            href={item.link}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                          >
                            開く
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* お問い合わせセクション */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                ご不明な点がございましたら
              </h3>
              <p className="text-slate-600 mb-4">
                カスタマーサポートまでお気軽にお問い合わせください
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="tel:03-6826-5735"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-slate-700 hover:bg-slate-50 border"
                >
                  <span>03-6826-5735</span>
                </a>
                <a
                  href="mailto:premium@the-reform.co.jp"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
                >
                  <Mail className="h-4 w-4" />
                  メールで問い合わせ
                </a>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                受付時間: 平日 9:00〜18:00（土日祝除く）
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
