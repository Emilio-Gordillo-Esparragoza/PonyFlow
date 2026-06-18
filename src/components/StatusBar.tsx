'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Settings, Server, Circle, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { Button } from '@/components/ui/button'

interface StatusBarProps {
  ollamaRunning: boolean
  engineHealthy: boolean
  onCheckOllama: () => void
  onSettings: () => void
}

export function StatusBar({ ollamaRunning, engineHealthy, onCheckOllama, onSettings }: StatusBarProps) {
  const { theme, setTheme } = useSettingsStore()

  return (
    <div className="flex items-center justify-between h-10 px-4 border-b bg-card">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={cn(
            'w-2 h-2 rounded-full',
            ollamaRunning ? 'bg-green-500' : 'bg-red-500'
          )} />
          <span className="text-sm font-medium">
            Ollama: {ollamaRunning ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            'w-2 h-2 rounded-full',
            engineHealthy ? 'bg-green-500' : 'bg-red-500'
          )} />
          <span className="text-sm font-medium">
            Engine: {engineHealthy ? 'Running' : 'Stopped'}
          </span>
        </div>

        {!ollamaRunning && (
          <div className="flex items-center gap-2 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Ollama not running. Start with: <code>ollama serve</code></span>
            <Button variant="ghost" size="sm" onClick={onCheckOllama}>
              Check Again
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
          <Circle className="w-3 h-3" style={{ color: theme === 'dark' ? '#fff' : '#000' }} />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
            className="bg-transparent border-none text-sm focus:outline-none"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Settings">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
