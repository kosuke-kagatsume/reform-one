# Reform One 機能一覧完全版

最終更新: 2025-12-06

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 14.2.5 (Pages Router) |
| 言語 | TypeScript |
| データベース | Supabase PostgreSQL |
| ORM | Prisma |
| UI | shadcn/ui + Tailwind CSS |
| 認証 | bcryptjs (パスワードハッシュ) |
| メール | Resend |
| モノレポ | Turborepo |

---

## ユーザー種別

| 種別 | 説明 |
|------|------|
| リフォーム産業新聞社 管理者 | 全機能の管理、コンテンツ登録、会員管理 |
| 法人管理者 | 社員招待・削除、利用状況確認、プラン変更 |
| 法人一般社員 | コンテンツ閲覧・利用 |

## プラン

| 機能 | スタンダード (11万円/年) | エキスパート (22万円/年) |
|------|:---:|:---:|
| セミナー参加 | ✅ | ✅ |
| アーカイブ閲覧 | ✅ | ✅ |
| オンラインコミュニティ | ❌ | ✅ |
| データブックDL | ❌ | ✅ |
| ニュースレター | ❌ | ✅ |

---

## 実装済み機能一覧

### 認証・ユーザー管理

| 機能 | ページ/API | 状態 |
|------|------------|:----:|
| ログイン | `/login` | ✅ |
| ログインAPI | `/api/auth/login` | ✅ |
| 招待受諾 | `/invite/[token]` | ✅ |
| 招待API | `/api/members/invite` | ✅ |
| 招待受諾API | `/api/members/accept-invite` | ✅ |
| プロフィール | `/dashboard/profile` | ✅ |
| プロフィールAPI | `/api/user/profile` | ✅ |

### ユーザー向けダッシュボード

| 機能 | ページ | 状態 |
|------|--------|:----:|
| ダッシュボード（トップ） | `/dashboard` | ✅ |
| セミナー一覧 | `/dashboard/seminars` | ✅ |
| アーカイブ一覧 | `/dashboard/archives` | ✅ |
| アーカイブ詳細・視聴 | `/dashboard/archives/[id]` | ✅ |
| コミュニティ一覧 (EXPERT) | `/dashboard/community` | ✅ |
| コミュニティ詳細 (EXPERT) | `/dashboard/community/[slug]` | ✅ |
| メンバー管理 | `/dashboard/members` | ✅ |
| メンバー利用状況 | `/dashboard/members/[id]/usage` | ✅ |
| データブック (EXPERT) | `/dashboard/databooks` | ✅ |
| ニュースレター一覧 (EXPERT) | `/dashboard/newsletters` | ✅ |
| ニュースレター詳細 (EXPERT) | `/dashboard/newsletters/[id]` | ✅ |
| 設定 | `/dashboard/settings` | ✅ |
| 請求・支払い | `/dashboard/billing` | ✅ |
| 組織設定 | `/dashboard/organization` | ✅ |
| セキュリティ設定 | `/dashboard/security` | ✅ |

### 管理画面（リフォーム産業新聞社用）

| 機能 | ページ | 状態 |
|------|--------|:----:|
| 管理ダッシュボード | `/admin/premier` | ✅ |
| **組織管理** | | |
| 契約組織一覧 | `/admin/premier/organizations` | ✅ |
| 組織新規登録 | `/admin/premier/organizations/new` | ✅ |
| 組織詳細・編集 | `/admin/premier/organizations/[id]` | ✅ |
| **セミナー管理** | | |
| セミナー一覧 | `/admin/premier/seminars` | ✅ |
| セミナー新規作成 | `/admin/premier/seminars/new` | ✅ |
| セミナー編集 | `/admin/premier/seminars/[id]/edit` | ✅ |
| **アーカイブ管理** | | |
| アーカイブ一覧 | `/admin/premier/archives` | ✅ |
| アーカイブ新規追加 | `/admin/premier/archives/new` | ✅ |
| アーカイブ編集 | `/admin/premier/archives/[id]/edit` | ✅ |
| **コミュニティ管理** | | |
| コミュニティ一覧 | `/admin/premier/community` | ✅ |
| コミュニティ作成 | `/admin/premier/community/new` | ✅ |
| 定例会アーカイブ管理 | `/admin/premier/community/[slug]/meetings` | ✅ |
| **その他管理** | | |
| 会員一覧 | `/admin/premier/members` | ✅ |
| カテゴリ管理 | `/admin/premier/categories` | ✅ |
| データブック管理 | `/admin/premier/databooks` | ✅ |
| ニュースレター管理 | `/admin/premier/newsletters` | ✅ |

### API一覧

#### セミナー関連
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/seminars` | GET/POST | セミナー一覧取得・作成 |
| `/api/seminars/[id]` | GET/PUT/DELETE | セミナー詳細・更新・削除 |
| `/api/seminars/[id]/register` | POST | セミナー参加登録 |
| `/api/seminars/categories` | GET/POST | カテゴリ一覧・作成 |
| `/api/seminars/categories/[id]` | GET/PUT/DELETE | カテゴリ詳細・更新・削除 |

#### アーカイブ関連
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/archives` | GET/POST | アーカイブ一覧取得・作成 |
| `/api/archives/[id]` | GET | アーカイブ詳細 |
| `/api/archives/[id]/edit` | PUT/DELETE | アーカイブ編集・削除 |
| `/api/archives/[id]/view` | POST | 視聴履歴記録 |
| `/api/archives/categories` | GET | カテゴリ一覧 |

#### コミュニティ関連
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/community/categories` | GET/POST | カテゴリ一覧・作成 |
| `/api/community/categories/[slug]` | GET/PUT/DELETE | カテゴリ詳細・更新・削除 |
| `/api/community/posts` | GET/POST | 投稿一覧・作成 |
| `/api/community/meetings` | GET/POST | 定例会一覧・作成 |
| `/api/community/meetings/[id]` | GET/PUT/DELETE | 定例会詳細・更新・削除 |

#### メンバー関連
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/members` | GET | メンバー一覧 |
| `/api/members/[id]` | GET/PUT/DELETE | メンバー詳細・更新・削除 |
| `/api/members/[id]/usage` | GET | 利用状況取得 |
| `/api/members/invite` | POST | 招待送信（メール付き） |
| `/api/members/accept-invite` | POST | 招待受諾 |
| `/api/members/invitation` | GET | 招待状況確認 |

#### 通知関連
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/notifications/seminar` | POST | セミナー告知メール送信 |
| `/api/notifications/community-post` | POST | コミュニティ投稿通知 |

#### データブック関連
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/databooks` | GET | データブック一覧 |
| `/api/databooks/[id]/download` | GET | ダウンロード |

#### ニュースレター関連
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/newsletters` | GET | ニュースレター一覧 |
| `/api/newsletters/[id]` | GET | ニュースレター詳細 |

#### 課金関連
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/billing/subscription` | GET | 購読情報取得 |
| `/api/billing/create-checkout` | POST | 決済セッション作成 |
| `/api/billing/confirm-payment` | POST | 支払い確認 |
| `/api/billing/cancel` | POST | 解約 |

#### 管理者API
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/admin/premier/stats` | GET | 統計情報 |
| `/api/admin/premier/organizations` | GET/POST | 組織一覧・作成 |
| `/api/admin/premier/organizations/[id]` | GET/PUT/DELETE | 組織詳細・更新・削除 |
| `/api/admin/premier/members` | GET | 全会員一覧 |
| `/api/admin/premier/databooks` | GET/POST | データブック管理 |
| `/api/admin/premier/databooks/[id]` | PUT/DELETE | データブック更新・削除 |
| `/api/admin/premier/newsletters` | GET/POST | ニュースレター管理 |
| `/api/admin/premier/newsletters/[id]` | GET/PUT/DELETE | ニュースレター詳細・更新・削除 |
| `/api/admin/premier/newsletters/[id]/send` | POST | ニュースレター配信 |
| `/api/admin/premier/subscriptions/[id]/activate` | POST | 購読有効化 |

---

## データベースモデル

| モデル | 説明 |
|--------|------|
| User | ユーザー情報 |
| Organization | 法人組織 |
| UserOrganization | ユーザーと組織の関連 |
| Subscription | 購読情報 |
| Invitation | 招待 |
| SeminarCategory | セミナーカテゴリ |
| Seminar | セミナー |
| SeminarParticipant | セミナー参加者 |
| ArchiveCategory | アーカイブカテゴリ |
| Archive | アーカイブ動画 |
| ArchiveView | アーカイブ視聴履歴 |
| CommunityCategory | コミュニティカテゴリ |
| CommunityPost | コミュニティ投稿 |
| CommunityMeeting | 定例会 |
| Databook | データブック |
| Newsletter | ニュースレター |
| SiteVisit | 視察会 |
| SiteVisitParticipant | 視察会参加者 |
| Qualification | 資格 |
| UserQualification | ユーザー資格受講権 |
| Tool | ツール |
| ToolUsageLog | ツール利用ログ |
| Recommendation | おすすめ表示 |
| RecommendationDismissal | おすすめ非表示記録 |
| OpenSeminarRegistration | 外部セミナー申込 |

---

## Phase 2 完了機能

### Stripe決済連携
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/billing/create-checkout` | POST | Stripeチェックアウトセッション作成 |
| `/api/billing/verify-session` | POST | 支払い確認・サブスクリプション有効化 |
| `/api/billing/webhook` | POST | Stripe Webhook処理 |
| `/api/billing/subscription` | GET | 購読情報取得 |
| `/api/billing/confirm-payment` | POST | 支払い確認 |
| `/api/billing/cancel` | POST | 解約 |

### 更新通知システム
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/cron/renewal-reminder` | GET/POST | 契約更新リマインダー送信（30/14/7/3/1日前） |

### ニュースレター配信
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/admin/premier/newsletters/[id]/send` | POST | EXPERTユーザーへ一斉配信 |

---

## Phase 3 完了機能

### 視察会申込・決済
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/site-visits` | GET/POST | 視察会一覧取得・作成 |
| `/api/site-visits/[id]` | GET/PUT/DELETE | 視察会詳細・更新・削除 |
| `/api/site-visits/[id]/register` | POST | 視察会参加申込（Stripe決済対応） |
| `/api/admin/premier/site-visits` | GET/POST | 管理者用視察会管理 |

### 資格受講権管理
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/qualifications` | GET/POST | 資格一覧取得・作成 |
| `/api/qualifications/[id]/enroll` | POST | 資格受講登録 |
| `/api/admin/premier/qualifications` | GET/POST | 管理者用資格管理 |

### ツール追加機能
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/tools` | GET/POST | ツール一覧取得・作成 |
| `/api/tools/[slug]/use` | POST | ツール利用ログ記録 |
| `/api/admin/premier/tools` | GET/POST | 管理者用ツール管理 |

### おすすめ表示（ポップアップ）
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/recommendations` | GET/POST | おすすめ一覧取得・作成 |
| `/api/recommendations/[id]/dismiss` | POST | おすすめ非表示設定 |
| `/api/admin/premier/recommendations` | GET/POST | 管理者用おすすめ管理 |

### オープンセミナー（外部向け）
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/open-seminars` | GET | 公開セミナー一覧（認証不要） |
| `/api/open-seminars/[id]/register` | POST | 外部向け参加申込（Stripe決済対応） |

### 既存会員データ移行
| API | メソッド | 説明 |
|-----|----------|------|
| `/api/admin/premier/import/organizations` | POST | 組織一括インポート（JSON形式、dryRunサポート） |

---

## 環境変数

```env
# データベース
DATABASE_URL="postgresql://..."

# 認証
NEXTAUTH_SECRET=xxx
JWT_SECRET=xxx

# 決済（Stripe）
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_STANDARD_PRICE_ID=price_xxx
STRIPE_EXPERT_PRICE_ID=price_xxx

# Cron認証
CRON_SECRET=xxx

# メール（Resend）
RESEND_API_KEY=re_xxx
EMAIL_FROM="プレミア購読運営事務局 <premium@the-reform.co.jp>"
EMAIL_REPLY_TO=support@reform-one.jp

# 決済（Stripe）- 未実装
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## テストアカウント

| メールアドレス | パスワード | 種別 |
|---------------|-----------|------|
| admin@the-reform.co.jp | Admin123! | 管理者（全機能） |
| admin@expert-reform.co.jp | password123 | EXPERT プラン |
| admin@standard-koumuten.jp | password123 | STANDARD プラン |

---

## 開発コマンド

```bash
# 開発サーバー起動
cd apps/web && npm run dev

# Prismaスキーマ反映
cd packages/database && npx prisma db push

# Prisma Client生成
npx prisma generate

# シードデータ投入
npx prisma db seed

# TypeScriptチェック
npx tsc --noEmit

# ビルド
npm run build
```

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-06 | Phase 3完了：視察会申込・決済、資格受講権管理、ツール追加、おすすめ表示、オープンセミナー、データ移行API |
| 2025-12-06 | Phase 2完了：Stripe決済連携、更新通知システム、ニュースレター配信 |
| 2025-12-06 | Resendメール送信機能追加（招待・セミナー告知・コミュニティ通知） |
| 2025-12-06 | Supabase PostgreSQLへの移行完了 |
| 2025-12-06 | 機能一覧完全版作成 |
