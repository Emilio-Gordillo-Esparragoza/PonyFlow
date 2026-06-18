'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { initEngine, sendInput, getHealth, cleanup, EngineEvent } from '@/lib/engine'
import { useRunStore } from '@/stores/runStore'

export function useEngine() {
  const [ollamaRunning, setOllamaRunning] = useState(false)
  const [engineHealthy, setEngineHealthy] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const updateRun = useRunStore((s) => s.updateRun)
  const currentRunId = useRunStore((s) => s.currentRunId)
  const healthCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleEvent = useCallback((event: EngineEvent) => {
    if (currentRunId) {
      updateRun(currentRunId, event)
    }

    if (event.type === 'run_complete' || event.type === 'run_error') {
      setIsRunning(false)
    }
    if (event.type === 'agent_start') {
      setIsRunning(true)
    }
    if (event.type === 'engine_error' && event.fatal) {
      setEngineHealthy(false)
    }
  }, [currentRunId, updateRun])

  useEffect(() => {
    initEngine(handleEvent)

    const checkHealth = async () => {
      try {
        const healthy = await getHealth()
        setEngineHealthy(healthy)

        const response = await fetch('http://localhost:11434/api/tags', { method: 'GET' })
        setOllamaRunning(response.ok)
      } catch {
        setEngineHealthy(false)
        setOllamaRunning(false)
      }
    }

    checkHealth()
    healthCheckInterval.current = setInterval(checkHealth, 10000)

    return () => {
      cleanup()
      if (healthCheckInterval.current) clearInterval(healthCheckInterval.current)
    }
  }, [handleEvent])

  const checkOllama = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags', { method: 'GET' })
      setOllamaRunning(response.ok)
    } catch {
      setOllamaRunning(false)
    }
  }

  const cancelRun = async () => {
    if (currentRunId) {
      await sendInput({ type: 'cancel', id: currentRunId })
      setIsRunning(false)
    }
  }

  return {
    ollamaRunning,
    engineHealthy,
    isRunning,
    checkOllama,
    cancelRun,
  }
}