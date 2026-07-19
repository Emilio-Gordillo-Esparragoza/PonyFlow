'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Trash2, X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Run } from '@/lib/protocol'
import { useRunStore } from '@/stores/runStore'

interface RunHistoryProps {
  onSelectRun: (id: string) => void
  /** When true, fills parent instead of acting as a permanent left column */
  embedded?: boolean
}

export function RunHistory({ onSelectRun, embedded = false }: RunHistoryProps) {
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

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden h-full',
        !embedded && 'w-64 border-r bg-card'
      )}
    >
      <div className="p-3 border-b bg-muted/50 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Chats</h3>
        {runs.length > 0 && (
          <button
            onClick={clearRuns}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Clear history"
            type="button"
          >
            <Trash2 className="w-3 h-3 inline" />
          </button>
        )}
      </div>

      {runs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground p-4 text-center">
          <div className="text-sm mb-1">No chats yet</div>
          <div className="text-xs">Enter a prompt to start</div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {runs.map((run) => (
              <button
                key={run.id}
                type="button"
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
                      type="button"
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
      )}
    </div>
  )
}
