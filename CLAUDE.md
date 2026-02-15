# Reform One プロジェクト ルール

## 必須: スキーマ変更時のデプロイ手順

Prismaスキーマを変更した場合、**以下の手順を必ず実行すること**。これを怠ると本番環境で500エラーが発生する。

### 手順

1. **スキーマファイルを同期**
   ```bash
   cp packages/database/prisma/schema.prisma apps/web/prisma/schema.prisma
   ```

2. **データベースにスキーマをプッシュ**
   ```bash
   cd apps/web && npx prisma db push
   ```

3. **ビルド確認**
   ```bash
   npm run build
   ```

4. **コミット & プッシュ**

### 重要

- スキーマのマスターは `packages/database/prisma/schema.prisma`
- `apps/web/prisma/schema.prisma` は必ず同期すること
- `prisma db push` を忘れるとVercelデプロイ後にランタイムエラーになる

## プロジェクト構成

- **apps/web**: Next.js 14 (Pages Router) - メインアプリケーション
- **packages/database**: Prisma スキーマ管理
- **packages/auth**: 認証ライブラリ
- **packages/api**: API ユーティリティ

## 技術スタック

- Next.js 14.2.5 (Pages Router)
- Prisma ORM + PostgreSQL (Supabase)
- Turborepo モノレポ
- Resend (メール送信)
- Stripe (決済)
