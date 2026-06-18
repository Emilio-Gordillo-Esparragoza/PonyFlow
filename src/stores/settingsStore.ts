import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Settings {
  theme: 'light' | 'dark' | 'system'
  ollamaUrl: string
  autoScroll: boolean
  showAgentTrace: boolean
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setOllamaUrl: (url: string) => void
  setAutoScroll: (enabled: boolean) => void
  setShowAgentTrace: (enabled: boolean) => void
}

export const useSettingsStore = create<Settings>()(
  persist(
    (set) => ({
      theme: 'system',
      ollamaUrl: 'http://localhost:11434',
      autoScroll: true,
      showAgentTrace: true,
      setTheme: (theme) => set({ theme }),
      setOllamaUrl: (url) => set({ ollamaUrl: url }),
      setAutoScroll: (enabled) => set({ autoScroll: enabled }),
      setShowAgentTrace: (enabled) => set({ showAgentTrace: enabled }),
    }),
    {
      name: 'ponyflow-settings',
    }
  )
)
