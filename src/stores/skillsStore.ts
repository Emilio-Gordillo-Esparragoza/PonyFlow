import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Skill {
  id: string
  name: string
  content: string
  createdAt: number
  builtin?: boolean
}

interface SkillsStore {
  skills: Skill[]
  addSkill: (name: string, content: string) => void
  updateSkill: (id: string, patch: Partial<Pick<Skill, 'name' | 'content'>>) => void
  removeSkill: (id: string) => void
}

const BUILTIN_SKILLS: Skill[] = [
  {
    id: 'builtin-ponytail',
    name: 'Ponytail',
    content:
      'Minimal code ruleset for the Coder agent: YAGNI, prefer stdlib, prefer native, prefer existing deps, prefer one-liners, then write the shortest correct solution.',
    createdAt: 0,
    builtin: true,
  },
]

export const useSkillsStore = create<SkillsStore>()(
  persist(
    (set) => ({
      skills: BUILTIN_SKILLS,
      addSkill: (name, content) =>
        set((state) => ({
          skills: [
            {
              id: crypto.randomUUID(),
              name: name.trim(),
              content: content.trim(),
              createdAt: Date.now(),
            },
            ...state.skills,
          ],
        })),
      updateSkill: (id, patch) =>
        set((state) => ({
          skills: state.skills.map((skill) =>
            skill.id === id && !skill.builtin ? { ...skill, ...patch } : skill
          ),
        })),
      removeSkill: (id) =>
        set((state) => ({
          skills: state.skills.filter((skill) => skill.id !== id || skill.builtin),
        })),
    }),
    {
      name: 'ponyflow-skills',
      merge: (persisted, current) => {
        const stored = (persisted as SkillsStore | undefined)?.skills ?? []
        const custom = stored.filter((s) => !s.builtin)
        return {
          ...current,
          ...persisted,
          skills: [...BUILTIN_SKILLS, ...custom],
        }
      },
    }
  )
)
