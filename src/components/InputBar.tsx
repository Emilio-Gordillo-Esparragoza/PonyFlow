'use client'

import React from 'react'
import { Send, Square, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useRunStore } from '@/stores/runStore'
import { sendInput, createRun } from '@/lib/engine'

interface InputBarProps {
  isRunning: boolean
  engineHealthy: boolean
}

export function InputBar({ isRunning, engineHealthy }: InputBarProps) {
  const [prompt, setPrompt] = React.useState('')
  const addRun = useRunStore((s) => s.addRun)
  const setCurrentRun = useRunStore((s) => s.setCurrentRun)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isRunning || !engineHealthy) return

    const run = createRun(prompt.trim())
    addRun(run)
    setCurrentRun(run.id)

    await sendInput({ type: 'run', id: run.id, prompt: prompt.trim() })
    setPrompt('')
  }

  const handleCancel = async () => {
    const { currentRunId } = useRunStore.getState()
    if (currentRunId) {
      await sendInput({ type: 'cancel', id: currentRunId })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t bg-card p-4">
      <div className="flex gap-2">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={!engineHealthy ? 'Engine not ready...' : isRunning ? 'Running...' : 'Describe what you want to build...'}
          disabled={isRunning || !engineHealthy}
          className="flex-1 min-h-[60px] max-h-[150px] resize-none"
          rows={3}
        />
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            disabled={!prompt.trim() || isRunning || !engineHealthy}
            className="h-fit"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Running
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send
              </>
            )}
          </Button>
          {isRunning && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancel}
              className="h-fit"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
