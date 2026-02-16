export type WidgetType =
  | 'stats'
  | 'services'
  | 'quick-actions'
  | 'recent-activity'
  | 'training-calendar'
  | 'data-books'
  | 'newsletter'
  | 'community'
  | 'digital-edition'
  | 'materials-catalog'
  | 'store'
  | 'fair-registration'
  // Premier subscription widgets
  | 'expert-recommendations'
  | 'admin-summary'
  | 'kpi-cards'
  | 'upcoming-seminars'
  | 'recent-archives'
  | 'community-updates'

export interface Widget {
  id: string
  type: WidgetType
  title: string
  enabled: boolean
  order: number
  width: 'full' | 'half' | 'third' | 'two-thirds'
}

export interface DashboardConfig {
  widgets: Widget[]
  layout: 'grid' | 'masonry'
}

export const defaultWidgets: Widget[] = [
  {
    id: 'stats',
    type: 'stats',
    title: '統計情報',
    enabled: true,
    order: 0,
    width: 'full'
  },
  {
    id: 'services',
    type: 'services',
    title: 'サービス利用状況',
    enabled: true,
    order: 1,
    width: 'two-thirds'
  },
  {
    id: 'quick-actions',
    type: 'quick-actions',
    title: 'クイックアクション',
    enabled: true,
    order: 2,
    width: 'third'
  },
  {
    id: 'recent-activity',
    type: 'recent-activity',
    title: '最近のアクティビティ',
    enabled: true,
    order: 3,
    width: 'full'
  },
  {
    id: 'training-calendar',
    type: 'training-calendar',
    title: '研修カレンダー',
    enabled: false,
    order: 4,
    width: 'full'
  },
  {
    id: 'data-books',
    type: 'data-books',
    title: 'データブック',
    enabled: false,
    order: 5,
    width: 'half'
  },
  {
    id: 'newsletter',
    type: 'newsletter',
    title: '編集長ニュースレター',
    enabled: false,
    order: 6,
    width: 'half'
  },
  {
    id: 'community',
    type: 'community',
    title: 'コミュニティ',
    enabled: false,
    order: 7,
    width: 'full'
  },
  // Premier subscription default widgets
  {
    id: 'expert-recommendations',
    type: 'expert-recommendations',
    title: '今月のおすすめ（エキスパート）',
    enabled: true,
    order: 8,
    width: 'full'
  },
  {
    id: 'admin-summary',
    type: 'admin-summary',
    title: '管理者サマリー',
    enabled: true,
    order: 9,
    width: 'full'
  },
  {
    id: 'kpi-cards',
    type: 'kpi-cards',
    title: 'KPIカード',
    enabled: true,
    order: 10,
    width: 'full'
  },
  {
    id: 'upcoming-seminars',
    type: 'upcoming-seminars',
    title: '今後のセミナー',
    enabled: true,
    order: 11,
    width: 'half'
  },
  {
    id: 'recent-archives',
    type: 'recent-archives',
    title: '最新のアーカイブ',
    enabled: true,
    order: 9,
    width: 'half'
  },
  {
    id: 'community-updates',
    type: 'community-updates',
    title: 'コミュニティ更新',
    enabled: true,
    order: 10,
    width: 'full'
  }
]
