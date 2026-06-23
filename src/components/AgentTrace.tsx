'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { FileText, Terminal } from 'lucide-react'
import { AgentName, AgentStatus } from '@/lib/protocol'

interface AgentTraceProps {
  run: {
    agentOutputs: Record<AgentName, { output: string; status: AgentStatus; duration: number }>
    currentAgent?: AgentName
    iteration: number
    status: string
  }
  onCopyCode: (code: string) => void
}

const AGENTS: { id: AgentName; label: string; icon: React.ReactNode }[] = [
  { id: 'planner', label: 'Planner', icon: <FileText className="w-4 h-4" /> },
  { id: 'coder', label: 'Coder', icon: <Terminal className="w-4 h-4" /> },
  { id: 'tester', label: 'Tester', icon: <Terminal className="w-4 h-4" /> },
  { id: 'reader', label: 'Reader', icon: <FileText className="w-4 h-4" /> },
]

const STATUS_COLORS: Record<AgentStatus, string> = {
  pending: 'bg-gray-400',
  active: 'bg-yellow-400 animate-pulse',
  done: 'bg-green-400',
  error: 'bg-red-400',
}

export function AgentTrace({ run, onCopyCode: _onCopyCode }: AgentTraceProps) {
  const [expanded, setExpanded] = React.useState<Record<AgentName, boolean>>({
    planner: false,
    coder: false,
    tester: false,
    reader: false,
  })

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const handleAgentClick = (agent: AgentName) => {
    setExpanded((prev) => ({ ...prev, [agent]: !prev[agent] }))
  }

  return (
    <div className="w-full space-y-2">
      {run.iteration > 1 && (
        <div className="text-center text-sm text-muted-foreground mb-2">
          Iteration {run.iteration} / 3
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {AGENTS.map((agent, index) => {
          const output = run.agentOutputs[agent.id]
          const isActive = run.currentAgent === agent.id
          const status = output.status
          const isLast = index === AGENTS.length - 1

          return (
            <React.Fragment key={agent.id}>
              <div
                className={cn(
                  'flex flex-col items-center gap-1 min-w-[140px] transition-all',
                  isActive && 'animate-pulse-border'
                )}
                onClick={() => handleAgentClick(agent.id)}
              >
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all',
                    isActive
                      ? 'border-primary bg-primary/5 shadow-[0_0_0_2px_hsl(var(--primary)/0.2)]'
                      : 'border-border bg-card'
                  )}
                >
                  <span className="text-lg">{agent.icon}</span>
                  <span className="font-medium text-sm">{agent.label}</span>
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      STATUS_COLORS[status]
                    )}
                  />
                </div>
                {output.duration > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(output.duration)}
                  </span>
                )}

                {expanded[agent.id] && output.output && (
                  <div className="mt-2 w-[140px] max-h-40 overflow-auto text-xs bg-muted/50 p-2 rounded border text-left">
                    <pre className="whitespace-pre-wrap font-mono">{output.output.slice(0, 500)}</pre>
                  </div>
                )}
              </div>

              {!isLast && (
                <div className="flex items-center text-muted-foreground px-1">
                  →
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {run.currentAgent && run.agentOutputs[run.currentAgent]?.status === 'active' && (
        <div className="text-center text-sm text-primary">
          ⚡ {run.currentAgent} is working...
        </div>
      )}
    </div>
  )
}
