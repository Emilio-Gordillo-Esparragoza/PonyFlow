'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Trash2, X, ChevronRight } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Run } from '@/lib/protocol'
import { useRunStore } from '@/stores/runStore'

interface RunHistoryProps {
  onSelectRun: (id: string) => void
}

export function RunHistory({ onSelectRun }: RunHistoryProps) {
  const { runs, currentRunId, removeRun, clearRuns } = useRunStore()

  const getStatusIcon = (status: Run['status']) => {
    switch (status) {
      case 'complete':
        return <span className="text-green-500">✓</span>
      case 'error':
        return <span className="text-red-500">✗</span>
      case 'running':
        return <span className="text-yellow-500 animate-pulse">▶</span>
      case 'cancelled':
        return <span className="text-gray-500">⊘</span>
      default:
        return <span className="text-gray-400">?</span>
    }
  }

  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        <div className="text-lg mb-2">No runs yet</div>
        <div className="text-sm">Enter a prompt to start</div>
      </div>
    )
  }

  return (
    <div className="w-64 border-r bg-card flex flex-col overflow-hidden">
      <div className="p-3 border-b bg-muted/50 flex items-center justify-between">
        <h3 className="font-semibold text-sm">History</h3>
        {runs.length > 0 && (
          <button
            onClick={clearRuns}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Clear history"
          >
            <Trash2 className="w-3 h-3 inline" />
          </button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {runs.map((run) => (
            <button
              key={run.id}
              onClick={() => onSelectRun(run.id)}
              className={cn(
                'w-full text-left p-2 rounded transition-colors',
                currentRunId === run.id
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted/50'
              )}
            >
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">{getStatusIcon(run.status)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{run.prompt.slice(0, 50)}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{new Date(run.createdAt).toLocaleTimeString()}</span>
                    {run.iteration > 1 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                        Iter {run.iteration}/3
                      </Badge>
                    )}
                  </div>
                </div>
                {currentRunId === run.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeRun(run.id)
                    }}
                    className="text-muted-foreground hover:text-destructive p-1"
                    title="Remove from history"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
