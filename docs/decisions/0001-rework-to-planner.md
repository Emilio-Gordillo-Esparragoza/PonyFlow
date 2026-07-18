# 0001 — Rework failures route to Planner

## Status

Accepted

## Context

The original loop ran Planner once, then repeatedly `Coder → Tester → Reader`. On fail, rework went straight back to the Coder. That meant the plan was never revised when tests or review found structural problems, so the Coder often repeated the same approach.

## Decision

On fail (test status not `pass`, or Reader not approved), route rework to the **Planner**, then run the full cycle again:

`Planner → Coder → Tester → Reader` (max 3 iterations).

The Planner prompt includes prior plan, code, test result, and review so it can revise steps before the next coding attempt.

`should_rework` in `engine/graph.py` returns `"planner"`. The live loop in `engine/engine.py` runs Planner inside each iteration.

## Consequences

- Failures can change the plan, not only the code.
- Each iteration costs an extra Planner LLM call.
- Docs and UI copy describe fail → Planner, not fail → Coder.
