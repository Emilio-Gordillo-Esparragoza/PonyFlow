'use client'

import React from 'react'
import { SidePanel } from '@/components/SidePanel'
import { RunCard } from '@/components/RunCard'
import { StatusBar } from '@/components/StatusBar'
import { InputBar } from '@/components/InputBar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRunStore } from '@/stores/runStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useEngine } from '@/hooks/useEngine'

export default function App() {
  const { ollamaRunning, engineHealthy, isRunning, checkOllama } = useEngine()
  const { runs, currentRunId, setCurrentRun } = useRunStore()
  const { theme } = useSettingsStore()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  React.useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const dark = theme === 'dark' || (theme === 'system' && prefersDark)
      root.classList.toggle('dark', dark)
    }
    apply()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])

  const currentRun = runs.find((r) => r.id === currentRunId)

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <StatusBar
        ollamaRunning={ollamaRunning}
        engineHealthy={engineHealthy}
        onCheckOllama={checkOllama}
        onSettings={() => setSidebarOpen((open) => !open)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <SidePanel
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectRun={(id) => {
            setCurrentRun(id)
            setSidebarOpen(false)
          }}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4 w-full max-w-none">
              {currentRun ? (
                <RunCard run={currentRun} onCopyCode={handleCopyCode} isCurrent />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground px-6">
                  <div className="text-xl mb-2">Welcome to PonyFlow</div>
                  <div className="text-sm max-w-xl text-center">
                    Enter a prompt below to start a multi-agent coding session. The Planner,
                    Coder, Tester, and Reader will work together to generate, test, and review
                    your code.
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <InputBar isRunning={isRunning} engineHealthy={engineHealthy} />
        </div>
      </div>
    </div>
  )
}
