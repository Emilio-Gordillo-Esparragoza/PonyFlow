import { describe, it, expect } from 'vitest'
import { updateRunWithEvent } from './engine'
import { Run, EngineEvent } from './protocol'

const mockRun = (): Run => ({
  id: 'test', prompt: 'test', code: '', status: 'running',
  createdAt: Date.now(), iteration: 0,
  state: { plan: '', code: '', test_result: '', review: '', approved: false, iterations: 0 },
  currentAgent: 'planner',
  agentOutputs: {
    planner: { output: '', status: 'pending', duration: 0, startTime: 0 },
    coder: { output: '', status: 'pending', duration: 0, startTime: 0 },
    tester: { output: '', status: 'pending', duration: 0, startTime: 0 },
    reader: { output: '', status: 'pending', duration: 0, startTime: 0 },
  }
})

describe('updateRunWithEvent', () => {
  it('handles agent_start', () => {
    const event: EngineEvent = { type: 'agent_start', agent: 'coder', run_id: 'test' }
    const updated = updateRunWithEvent(mockRun(), event)
    expect(updated.currentAgent).toBe('coder')
    expect(updated.agentOutputs.coder.status).toBe('active')
  })

  it('handles token streaming', () => {
    let run = mockRun()
    run = updateRunWithEvent(run, { type: 'agent_start', agent: 'coder', run_id: 'test' })
    run = updateRunWithEvent(run, { type: 'token', agent: 'coder', content: 'def foo():' })
    run = updateRunWithEvent(run, { type: 'token', agent: 'coder', content: ' pass' })
    expect(run.code).toBe('def foo(): pass')
  })
})