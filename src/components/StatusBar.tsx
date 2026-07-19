'use client'

import { cn } from '@/lib/utils'
import { Settings, Circle, AlertCircle } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { Button } from '@/components/ui/button'

interface StatusBarProps {
  ollamaRunning: boolean
  engineHealthy: boolean
  onCheckOllama: () => void
  onSettings: () => void
  sidebarOpen?: boolean
}

export function StatusBar({
  ollamaRunning,
  engineHealthy,
  onCheckOllama,
  onSettings,
  sidebarOpen = false,
}: StatusBarProps) {
  const { theme, setTheme } = useSettingsStore()

  return (
    <div className="flex w-full items-center justify-between h-10 px-3 border-b bg-card shrink-0 gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Button
          variant={sidebarOpen ? 'secondary' : 'ghost'}
          size="icon"
          onClick={onSettings}
          aria-label="Open sidebar"
          aria-pressed={sidebarOpen}
          className="h-8 w-8 shrink-0"
        >
          <Settings className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-4 min-w-0 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                ollamaRunning ? 'bg-green-500' : 'bg-red-500'
              )}
            />
            <span className="text-sm font-medium whitespace-nowrap">
              Ollama: {ollamaRunning ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                engineHealthy ? 'bg-green-500' : 'bg-red-500'
              )}
            />
            <span className="text-sm font-medium whitespace-nowrap">
              Engine: {engineHealthy ? 'Running' : 'Stopped'}
            </span>
          </div>

          {!ollamaRunning && (
            <div className="flex items-center gap-2 px-2 py-1 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800 rounded text-yellow-800 dark:text-yellow-200 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Ollama not running. Start with: <code>ollama serve</code>
              </span>
              <Button variant="ghost" size="sm" onClick={onCheckOllama}>
                Check Again
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm shrink-0">
        <Circle className="w-3 h-3 text-foreground" />
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
          className="theme-select bg-transparent border-none text-sm text-foreground focus:outline-none cursor-pointer"
          aria-label="Color theme"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
    </div>
  )
}
