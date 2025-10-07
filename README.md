# Reform One Platform

リフォーム産業新聞社 統合会員・課金・CMS・研修・建材プラットフォーム

## 🚀 概要

Reform Oneは、リフォーム産業新聞社の各種サービスを統合する次世代プラットフォームです。

### 主要機能

- **📱 統合ID**: 電子版・建材トレンド・公式ストア・研修を単一ログインで統合
- **💳 課金管理**: プレミアプラン（10万/20万円/年）の法人契約管理
- **🔐 セキュリティ**: MFA対応、ドメイン制限、監査ログによる安全な運用
- **🎨 カスタマイズ可能ダッシュボード**: ユーザーがウィジェットの表示/非表示を自由に設定可能
- **📅 研修カレンダー**: 研修予定を一覧表示、申込状況をリアルタイムで確認

## 🛠 技術スタック

- **フロントエンド**: Next.js 14.2.5, React 18, TypeScript
- **バックエンド**: Next.js API Routes, Prisma ORM
- **データベース**: SQLite (開発) / PostgreSQL (本番)
- **認証**: Email/Password, MFA (TOTP)
- **UI**: shadcn/ui (Radix UI + Tailwind CSS)
- **状態管理**: Zustand
- **モノレポ**: Turborepo

## 📦 プロジェクト構成

```
reform-one/
├── apps/
│   ├── web/          # メインWebアプリケーション
│   └── admin/        # 管理画面（予定）
├── packages/
│   ├── database/     # Prisma設定とモデル
│   ├── auth/         # 認証・認可ライブラリ
│   ├── api/          # OpenAPI定義
│   └── ui/           # 共通UIコンポーネント（予定）
└── turbo.json        # Turborepo設定
```

## 🏃‍♂️ 開発環境セットアップ

### 必要要件

- Node.js 18+
- npm 10.2.4+

### インストールと起動

```bash
# 依存関係のインストール
npm install

# データベースのセットアップ
npm run db:migrate
npm run db:seed

# 開発サーバーの起動
npm run dev
```

アプリケーションは http://localhost:3001 で起動します。

## 🔑 テストアカウント

| ロール | メールアドレス | パスワード | MFA |
|--------|---------------|------------|-----|
| 管理者 | admin@test-org.com | Admin123! | 無効 |
| マネージャー | manager@test-org.com | User123! | 無効 |
| メンバー | member@test-org.com | User123! | 無効 |
| デモ管理者 | demo@demo-company.com | Admin123! | 有効 |

## 📚 開発コマンド

```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm run lint       # コードチェック
npm run test       # テスト実行
npm run db:studio  # Prisma Studio起動
```

## 🚢 デプロイ

本プロジェクトはVercelにデプロイ可能です。

### 環境変数

本番環境では以下の環境変数を設定してください：

- `DATABASE_URL`: PostgreSQL接続文字列
- `JWT_SECRET`: JWT署名用シークレット
- `NEXTAUTH_SECRET`: NextAuth.js用シークレット
- `STRIPE_*`: Stripe API キー（Phase 1以降）

## 📝 ライセンス

© 2024 リフォーム産業新聞社. All rights reserved.

## 🤝 コントリビューション

本プロジェクトは社内開発プロジェクトです。コントリビューションは社内メンバーのみ受け付けています。