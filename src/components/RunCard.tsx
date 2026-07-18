'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CodeBlock } from './CodeBlock'
import { AgentTrace } from './AgentTrace'
import { ChevronDown, ChevronUp, AlertCircle, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Run } from '@/lib/protocol'

interface RunCardProps {
  run: Run
  onCopyCode: (code: string) => void
  isCurrent?: boolean
}

export function RunCard({ run, onCopyCode, isCurrent }: RunCardProps) {
  const [expanded, setExpanded] = React.useState(true)

  const getStatusBadge = () => {
    switch (run.status) {
      case 'running':
        return <Badge variant="default">Running</Badge>
      case 'complete':
        return run.state.approved ? <Badge variant="success">Approved</Badge> : <Badge variant="destructive">Rejected</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const parseTestResult = () => {
    try {
      return JSON.parse(run.state.test_result)
    } catch {
      return { status: 'unknown', errors: [], suggestions: [] }
    }
  }

  const parseReview = () => {
    try {
      return JSON.parse(run.state.review)
    } catch {
      return { approved: false, issues: [], security_risks: [] }
    }
  }

  const testResult = parseTestResult()
  const review = parseReview()

  return (
    <Card className={cn('w-full overflow-hidden', isCurrent && 'ring-2 ring-primary')}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg truncate">{run.prompt.slice(0, 100)}</CardTitle>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{new Date(run.createdAt).toLocaleTimeString()}</span>
              {run.completedAt && (
                <span>Completed: {new Date(run.completedAt).toLocaleTimeString()}</span>
              )}
              {run.error && (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {run.error.slice(0, 50)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          <AgentTrace run={run} />

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security Review
                <Badge variant={review.approved ? 'success' : 'destructive'}>
                  {review.approved ? 'Approved' : 'Rejected'}
                </Badge>
              </h4>
              {review.security_risks.length > 0 && (
                <div className="text-sm text-destructive space-y-1">
                  {review.security_risks.map((risk: string, i: number) => (
                    <div key={i}>• {risk}</div>
                  ))}
                </div>
              )}
              {review.issues.length > 0 && (
                <div className="text-sm text-muted-foreground space-y-1 mt-2">
                  {review.issues.map((issue: string, i: number) => (
                    <div key={i}>• {issue}</div>
                  ))}
                </div>
              )}
              {review.security_risks.length === 0 && review.issues.length === 0 && (
                <div className="text-sm text-green-600">No issues found</div>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                Test Result
                <Badge variant={testResult.status === 'pass' ? 'success' : 'destructive'}>
                  {testResult.status === 'pass' ? 'Pass' : 'Fail'}
                </Badge>
              </h4>
              {testResult.errors.length > 0 && (
                <div className="text-sm text-destructive space-y-1">
                  {testResult.errors.map((err: string, i: number) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}
              {testResult.suggestions.length > 0 && (
                <div className="text-sm text-muted-foreground space-y-1 mt-2">
                  {testResult.suggestions.map((sug: string, i: number) => (
                    <div key={i}>• {sug}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          <CodeBlock code={run.code} onCopy={onCopyCode} />
        </CardContent>
      )}
    </Card>
  )
}

function Separator() {
  return <hr className="border-border my-2" />
}
