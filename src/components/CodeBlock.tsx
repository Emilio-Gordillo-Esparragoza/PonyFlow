'use client'

import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { invoke } from '@tauri-apps/api/core'

interface CodeBlockProps {
  code: string
  language?: string
  onCopy: (code: string) => void
}

export function CodeBlock({ code, language = 'python', onCopy }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    onCopy(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    try {
      await invoke('dialog:save', {
        filters: [{ name: 'Python', extensions: ['py'] }],
        defaultPath: 'generated_code.py',
        title: 'Save generated code',
      })
    } catch (e) {
      console.error('Save failed:', e)
    }
  }

  if (!code.trim()) {
    return (
      <div className="bg-muted/50 border rounded-lg p-4 text-center text-muted-foreground">
        No code generated yet
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/50">
        <span className="text-xs text-muted-foreground uppercase">{language}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            aria-label="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            aria-label="Save to file"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          padding: '1rem',
          overflow: 'auto',
          maxHeight: '400px',
        }}
        showLineNumbers={true}
        lineNumberStyle={{
          color: 'hsl(var(--muted-foreground) / 0.5)',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
