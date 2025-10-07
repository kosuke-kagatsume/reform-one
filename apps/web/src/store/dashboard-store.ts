import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DashboardConfig, Widget, defaultWidgets } from '@/types/dashboard'

interface DashboardStore {
  config: DashboardConfig
  setWidgetEnabled: (widgetId: string, enabled: boolean) => void
  reorderWidgets: (widgets: Widget[]) => void
  resetToDefault: () => void
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      config: {
        widgets: defaultWidgets,
        layout: 'grid'
      },
      setWidgetEnabled: (widgetId, enabled) =>
        set((state) => ({
          config: {
            ...state.config,
            widgets: state.config.widgets.map((w) =>
              w.id === widgetId ? { ...w, enabled } : w
            )
          }
        })),
      reorderWidgets: (widgets) =>
        set((state) => ({
          config: {
            ...state.config,
            widgets
          }
        })),
      resetToDefault: () =>
        set({
          config: {
            widgets: defaultWidgets,
            layout: 'grid'
          }
        })
    }),
    {
      name: 'dashboard-config'
    }
  )
)
