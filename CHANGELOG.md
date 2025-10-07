# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added - 2025-10-07

#### ダッシュボードのカスタマイズ機能
- ウィジェット方式のカスタマイズ可能なダッシュボード実装
- ユーザーがウィジェットの表示/非表示を切り替え可能
- Zustand + persistでlocalStorageに設定を保存
- 以下のウィジェットを実装：
  - 統計情報ウィジェット
  - サービス利用状況ウィジェット
  - クイックアクションウィジェット
  - 最近のアクティビティウィジェット
  - 研修カレンダーウィジェット

#### 研修カレンダー表示機能
- 研修予定を一覧表示
- 日時、場所、定員情報の表示
- 申込状況のプログレスバー
- 満席/残りわずか/受付中のステータス表示
- 申込ボタン（満席の場合は無効化）

#### UIコンポーネント追加
- Dialogコンポーネント（@radix-ui/react-dialog）
- Switchコンポーネント（@radix-ui/react-switch）

#### 型定義・ストア
- `src/types/dashboard.ts` - ダッシュボード関連の型定義
- `src/store/dashboard-store.ts` - ダッシュボード設定のグローバルストア

#### ウィジェットコンポーネント
- `StatsWidget.tsx` - 統計情報
- `ServicesWidget.tsx` - サービス利用状況
- `QuickActionsWidget.tsx` - クイックアクション
- `RecentActivityWidget.tsx` - 最近のアクティビティ
- `TrainingCalendarWidget.tsx` - 研修カレンダー
- `DashboardCustomizeDialog.tsx` - カスタマイズダイアログ

### Changed
- `/dashboard/index.tsx` - ウィジェット方式に全面刷新
- `package.json` - @radix-ui/react-switchを追加

### Documentation
- `future_development_tasks.md` - 今後の開発タスクリストを追加

## [1.0.0] - 2025-08-29

### Added
- リフォーム産業新聞社管理システムの初回実装
- 完全なUIシステムとコンテンツ管理機能
- Vercelデプロイ設定
- 管理画面ダッシュボード
- 顧客管理機能
- 電子新聞管理
- コンテンツ管理
- 研修管理
- 建材カタログ管理
- 分析機能
