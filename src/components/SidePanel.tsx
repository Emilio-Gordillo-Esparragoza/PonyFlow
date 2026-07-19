'use client'

import React from 'react'
import { X, Plus, Trash2, MessageSquare, Bot, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { RunHistory } from '@/components/RunHistory'
import { useSkillsStore } from '@/stores/skillsStore'

type Tab = 'chats' | 'agents' | 'skills'

const AGENTS = [
  {
    id: 'planner',
    name: 'Planner',
    model: 'mistral',
    description: 'Structures requests into JSON plans and revises on rework.',
  },
  {
    id: 'coder',
    name: 'Coder',
    model: 'llama3',
    description: 'Writes minimal Python under Ponytail constraints.',
  },
  {
    id: 'tester',
    name: 'Tester',
    model: 'phi3',
    description: 'LLM static check with pass/fail and concrete suggestions.',
  },
  {
    id: 'reader',
    name: 'Reader',
    model: 'mistral',
    description: 'Reviews security, practices, and Ponytail violations.',
  },
] as const

interface SidePanelProps {
  open: boolean
  onClose: () => void
  onSelectRun: (id: string) => void
}

export function SidePanel({ open, onClose, onSelectRun }: SidePanelProps) {
  const [tab, setTab] = React.useState<Tab>('chats')
  const [creating, setCreating] = React.useState(false)
  const [skillName, setSkillName] = React.useState('')
  const [skillContent, setSkillContent] = React.useState('')
  const { skills, addSkill, removeSkill } = useSkillsStore()

  if (!open) return null

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!skillName.trim() || !skillContent.trim()) return
    addSkill(skillName, skillContent)
    setSkillName('')
    setSkillContent('')
    setCreating(false)
  }

  return (
    <aside className="w-72 shrink-0 border-r bg-card flex flex-col overflow-hidden h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
        <nav className="flex gap-1">
          {(
            [
              { id: 'chats', label: 'Chats', icon: MessageSquare },
              { id: 'agents', label: 'Agents', icon: Bot },
              { id: 'skills', label: 'Skills', icon: Sparkles },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors',
                tab === id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={tab === id}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </nav>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar" className="h-7 w-7">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {tab === 'chats' && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <RunHistory onSelectRun={onSelectRun} embedded />
        </div>
      )}

      {tab === 'agents' && (
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {AGENTS.map((agent) => (
              <div key={agent.id} className="rounded-md border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium">{agent.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {agent.model}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {tab === 'skills' && (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="p-3 border-b">
            {creating ? (
              <form onSubmit={handleCreateSkill} className="space-y-2">
                <input
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="Skill name"
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
                />
                <Textarea
                  value={skillContent}
                  onChange={(e) => setSkillContent(e.target.value)}
                  placeholder="Skill instructions..."
                  className="min-h-[88px] text-sm"
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={!skillName.trim() || !skillContent.trim()}>
                    Save
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button type="button" size="sm" className="w-full" onClick={() => setCreating(true)}>
                <Plus className="w-4 h-4 mr-1.5" />
                Create skill
              </Button>
            )}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {skills.map((skill) => (
                <div key={skill.id} className="rounded-md border border-border bg-background p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium truncate">{skill.name}</span>
                      {skill.builtin && (
                        <Badge variant="secondary" className="text-[10px]">
                          Built-in
                        </Badge>
                      )}
                    </div>
                    {!skill.builtin && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.id)}
                        className="text-muted-foreground hover:text-destructive p-0.5"
                        aria-label={`Delete ${skill.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {skill.content}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </aside>
  )
}
