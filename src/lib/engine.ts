import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { EngineEvent, Run, InputMessageType } from './protocol'

type EventCallback = (event: EngineEvent) => void

let eventCallback: EventCallback | null = null
let unlistenOutput: (() => void) | null = null
let unlistenError: (() => void) | null = null
let unlistenCrashed: (() => void) | null = null

export async function initEngine(callback: EventCallback) {
  eventCallback = callback
  unlistenOutput = await listen<string>('python:output', (event: { payload: string }) => {
    try {
      const parsed = JSON.parse(event.payload)
      eventCallback?.(parsed)
    } catch {
      console.error('Failed to parse engine event:', event.payload)
    }
  })
  unlistenError = await listen<string>('python:error', (event: { payload: string }) => {
    console.error('Python stderr:', event.payload)
  })
  unlistenCrashed = await listen('python:crashed', () => {
    eventCallback?.({ type: 'engine_error', message: 'Python engine crashed', fatal: true })
  })
}

export async function sendInput(input: InputMessageType) {
  await invoke('send_input', { input: JSON.stringify(input) })
}

export async function getHealth() {
  return await invoke<boolean>('get_health')
}

export function cleanup() {
  unlistenOutput?.()
  unlistenError?.()
  unlistenCrashed?.()
  unlistenOutput = null
  unlistenError = null
  unlistenCrashed = null
  eventCallback = null
}

export function createRun(prompt: string): Run {
  const id = crypto.randomUUID()
  return {
    id,
    prompt,
    code: '',
    state: {
      plan: '',
      code: '',
      test_result: '',
      review: '',
      approved: false,
      iterations: 0,
    },
    status: 'running',
    createdAt: Date.now(),
    iteration: 0,
    currentAgent: 'planner',
    agentOutputs: {
      planner: { output: '', status: 'pending', duration: 0, startTime: 0 },
      coder: { output: '', status: 'pending', duration: 0, startTime: 0 },
      tester: { output: '', status: 'pending', duration: 0, startTime: 0 },
      reader: { output: '', status: 'pending', duration: 0, startTime: 0 },
    },
  }
}

export function updateRunWithEvent(run: Run, event: EngineEvent): Run {
  const newRun = { ...run, agentOutputs: { ...run.agentOutputs } }

  switch (event.type) {
    case 'agent_start': {
      const agent = event.agent
      const startTime = Date.now()
      newRun.currentAgent = agent
      newRun.iteration = newRun.state.iterations + 1
      newRun.agentOutputs[agent] = {
        ...newRun.agentOutputs[agent],
        status: 'active',
        duration: 0,
        startTime,
      }
      break
    }
    case 'agent_end': {
      const agent = event.agent
      const output = newRun.agentOutputs[agent]
      const duration = Date.now() - (output.startTime || Date.now())
      newRun.agentOutputs[agent] = {
        ...output,
        output: event.output,
        status: 'done',
        duration,
      }
      break
    }
    case 'token': {
      if (event.agent === 'coder') {
        const output = newRun.agentOutputs.coder
        newRun.agentOutputs.coder = {
          ...output,
          output: output.output + event.content,
        }
        newRun.code = output.output + event.content
      }
      break
    }
    case 'run_complete': {
      newRun.status = 'complete'
      newRun.code = event.code
      newRun.state = event.state
      newRun.completedAt = Date.now()
      newRun.currentAgent = undefined
      break
    }
    case 'run_error': {
      newRun.status = 'error'
      newRun.error = event.error
      newRun.completedAt = Date.now()
      newRun.currentAgent = undefined
      break
    }
    case 'engine_error': {
      if (event.fatal) {
        newRun.status = 'error'
        newRun.error = event.message
        newRun.completedAt = Date.now()
      }
      break
    }
  }

  return newRun
}