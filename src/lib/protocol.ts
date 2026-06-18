export type AgentName = 'planner' | 'coder' | 'tester' | 'reader'

export type AgentStatus = 'pending' | 'active' | 'done' | 'error'

export interface AgentEvent {
  type: 'agent_start'
  agent: AgentName
  run_id: string
}

export interface AgentEndEvent {
  type: 'agent_end'
  agent: AgentName
  output: string
  run_id: string
}

export interface TokenEvent {
  type: 'token'
  agent: 'coder'
  content: string
}

export interface RunCompleteEvent {
  type: 'run_complete'
  run_id: string
  code: string
  state: RunState
}

export interface RunErrorEvent {
  type: 'run_error'
  run_id: string
  error: string
}

export interface EngineErrorEvent {
  type: 'engine_error'
  message: string
  fatal: boolean
}

export type EngineEvent =
  | AgentEvent
  | AgentEndEvent
  | TokenEvent
  | RunCompleteEvent
  | RunErrorEvent
  | EngineErrorEvent

export interface RunState {
  plan: string
  code: string
  test_result: string
  review: string
  approved: boolean
  iterations: number
}

export interface Run {
  id: string
  prompt: string
  code: string
  state: RunState
  status: 'running' | 'complete' | 'error' | 'cancelled'
  createdAt: number
  completedAt?: number
  error?: string
  currentAgent?: AgentName
  iteration: number
  agentOutputs: Record<AgentName, { output: string; status: AgentStatus; duration: number; startTime: number }>
}

export interface InputMessage {
  type: 'run'
  id: string
  prompt: string
}

export interface CancelMessage {
  type: 'cancel'
  id: string
}

export type InputMessageType = InputMessage | CancelMessage
