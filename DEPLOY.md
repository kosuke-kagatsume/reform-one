# Vercel デプロイ手順

Reform One プラットフォームのVercelへのデプロイ手順です。

## 🚀 デプロイ方法

### 1. Vercel Webコンソールからインポート

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. "Import Project" をクリック
3. GitHubリポジトリ `https://github.com/kosuke-kagatsume/reform-one` を選択
4. 以下の設定を行う：

#### プロジェクト設定

- **Framework Preset**: Next.js
- **Root Directory**: `.` （デフォルトのまま）
- **Build Command**: `npm install && cd apps/web && npm run build`
- **Output Directory**: `apps/web/.next`
- **Install Command**: `npm install`

### 2. 環境変数の設定

Vercelのプロジェクト設定で以下の環境変数を追加：

```
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-key-here
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### 3. デプロイの実行

1. "Deploy" ボタンをクリック
2. ビルドが完了するまで待つ
3. デプロイURLにアクセスして動作確認

## 📝 注意事項

- 本番環境ではPostgreSQLを使用することを推奨
- JWT_SECRETとNEXTAUTH_SECRETは必ず強固なランダム文字列に変更してください
- Stripe関連の環境変数はPhase 1以降で設定

## 🔗 関連リンク

- GitHubリポジトリ: https://github.com/kosuke-kagatsume/reform-one
- Vercel Dashboard: https://vercel.com/dashboard