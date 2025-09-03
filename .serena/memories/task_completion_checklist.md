# Task Completion Checklist

## タスク完了時の確認事項

### 1. コード品質チェック
```bash
# Lintチェック実行
npm run lint

# TypeScriptの型チェック
npm run build
```

### 2. テスト実行
```bash
# テスト実行（カバレッジ付き）
npm run test
```

### 3. ローカル動作確認
```bash
# 開発サーバーで動作確認
npm run dev
# http://localhost:3001 でアクセス
```

### 4. Git管理
```bash
# 変更内容の確認
git status
git diff

# ステージング
git add .

# コミット（ユーザーが明示的に要求した場合のみ）
git commit -m "適切なコミットメッセージ"
```

### 5. 確認ポイント
- [ ] 日本語UIテキストが正しく表示される
- [ ] レスポンシブデザインが機能している
- [ ] エラーハンドリングが適切
- [ ] 型安全性が保たれている
- [ ] 既存機能への影響がない

### 6. 特に注意すること
- コメントを追加していないか確認
- 絵文字を不必要に使用していないか確認
- Pages Routerの規約に従っているか確認