# Code Style and Conventions

## TypeScript/React
- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **命名規則**:
  - コンポーネント: PascalCase (例: `DashboardLayout`)
  - 関数: camelCase (例: `handleSubmit`)
  - 定数: UPPER_SNAKE_CASE (例: `MAX_USERS`)
  - ファイル: kebab-case (例: `dashboard-layout.tsx`)

## ディレクトリ構造
```
src/
├── components/    # UIコンポーネント
│   ├── ui/       # 基本UIコンポーネント（shadcn/ui）
│   └── layout/   # レイアウトコンポーネント
├── pages/        # Next.js Pages Router
├── lib/          # ユーティリティ関数
├── hooks/        # カスタムフック
├── types/        # TypeScript型定義
└── styles/       # グローバルスタイル
```

## コンポーネント規則
- Props型は明示的に定義
- デフォルトエクスポートを使用（Pages Routerのため）
- 日本語UIテキストを使用

## スタイリング
- Tailwind CSSクラスを使用
- shadcn/uiコンポーネントをベースに拡張
- レスポンシブデザイン対応

## 重要な注意事項
- コメントは追加しない（ユーザー要望）
- 絵文字は使用しない（明示的に要求された場合を除く）
- Pages Routerを使用（App Routerは使用しない）