# Suggested Commands for Reform One Development

## 開発環境
```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

## データベース管理
```bash
# Prismaスキーマから型を生成
npm run db:generate

# データベーススキーマをプッシュ
npm run db:push

# マイグレーション実行
npm run db:migrate

# Prisma Studio起動（データベース管理UI）
npm run db:studio
```

## コード品質
```bash
# Lintチェック
npm run lint

# フォーマット
npm run format

# テスト実行
npm run test
```

## Git操作
```bash
# ステータス確認
git status

# 差分確認
git diff

# コミット履歴
git log --oneline -10
```

## プロジェクト構造確認
```bash
# ファイル検索
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules

# 特定パターンの検索
rg "pattern" --type ts --type tsx
```

## システムコマンド (Darwin/macOS)
```bash
# ディレクトリ内容表示
ls -la

# ファイル内容確認
cat filename

# プロセス確認
ps aux | grep node

# ポート使用状況
lsof -i :3001
```

## テストアカウント
- 管理者: admin@test-org.com / Admin123!
- マネージャー: manager@test-org.com / User123!
- メンバー: member@test-org.com / User123!

## 開発URL
- http://localhost:3001 (メインアプリケーション)