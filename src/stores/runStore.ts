import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Run, EngineEvent } from '../lib/protocol'
import { updateRunWithEvent } from '../lib/engine'

interface RunStore {
  runs: Run[]
  currentRunId: string | null
  addRun: (run: Run) => void
  updateRun: (id: string, event: EngineEvent) => void
  setCurrentRun: (id: string | null) => void
  removeRun: (id: string) => void
  clearRuns: () => void
  getCurrentRun: () => Run | undefined
}

export const useRunStore = create<RunStore>()(
  persist(
    (set, get) => ({
      runs: [],
      currentRunId: null,

      addRun: (run) =>
        set((state) => ({
          runs: [run, ...state.runs],
          currentRunId: run.id,
        })),

      updateRun: (id, event) =>
        set((state) => {
          const index = state.runs.findIndex((r) => r.id === id)
          if (index === -1) return state
          const updated = updateRunWithEvent(state.runs[index], event)
          const newRuns = [...state.runs]
          newRuns[index] = updated
          return { runs: newRuns }
        }),

      setCurrentRun: (id) => set({ currentRunId: id }),

      removeRun: (id) =>
        set((state) => ({
          runs: state.runs.filter((r) => r.id !== id),
          currentRunId: state.currentRunId === id ? null : state.currentRunId,
        })),

      clearRuns: () => set({ runs: [], currentRunId: null }),

      getCurrentRun: () => {
        const { runs, currentRunId } = get()
        return runs.find((r) => r.id === currentRunId)
      },
    }),
    {
      name: 'ponyflow-runs',
      partialize: (state) => ({ runs: state.runs.slice(0, 50) }),
    }
  )
)
