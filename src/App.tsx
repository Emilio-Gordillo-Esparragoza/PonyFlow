'use client'

import React from 'react'
import { RunHistory } from '@/components/RunHistory'
import { RunCard } from '@/components/RunCard'
import { StatusBar } from '@/components/StatusBar'
import { InputBar } from '@/components/InputBar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRunStore } from '@/stores/runStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useEngine } from '@/hooks/useEngine'
import { cn } from '@/lib/utils'

export default function App() {
  const { ollamaRunning, engineHealthy, isRunning, checkOllama } = useEngine()
  const { runs, currentRunId, setCurrentRun } = useRunStore()
  const { theme } = useSettingsStore()

  React.useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const currentRun = runs.find((r) => r.id === currentRunId)

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className={cn('flex h-screen bg-background', theme === 'dark' && 'dark')}>
      <StatusBar
        ollamaRunning={ollamaRunning}
        engineHealthy={engineHealthy}
        onCheckOllama={checkOllama}
        onSettings={() => {}}
      />

      <div className="flex-1 flex overflow-hidden">
        <RunHistory onSelectRun={setCurrentRun} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            {currentRun ? (
              <RunCard run={currentRun} onCopyCode={handleCopyCode} isCurrent />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <div className="text-xl mb-2">Welcome to PonyFlow</div>
                <div className="text-sm max-w-md text-center">
                  Enter a prompt in the input bar to start a multi-agent coding session.
                  The Planner, Coder, Tester, and Reader will work together to generate,
                  test, and review your code.
                </div>
              </div>
            )}
          </ScrollArea>

          <InputBar isRunning={isRunning} engineHealthy={engineHealthy} />
        </div>
      </div>
    </div>
  )
}
