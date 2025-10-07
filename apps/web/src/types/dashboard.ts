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
  }
]
