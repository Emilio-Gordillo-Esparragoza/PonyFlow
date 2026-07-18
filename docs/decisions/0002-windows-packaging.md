# 0002 — Windows packaging via PyInstaller + Tauri

## Status

Accepted

## Context

The Windows CI workflow freezes the Python engine with PyInstaller, then bundles it into a Tauri MSI. The repo previously gitignored `*.spec` and did not commit `engine/ponyflow.spec` or declare PyInstaller as a dependency, so release builds failed.

## Decision

- Commit [`engine/ponyflow.spec`](../../engine/ponyflow.spec) and stop blanket-ignoring `*.spec` in `.gitignore`.
- Declare `pyinstaller` in [`engine/requirements.txt`](../../engine/requirements.txt).
- Freeze the engine as `ponyflow-engine` (with Ponytail skill data under `engine/agents/skills/`).
- Tauri bundles `../engine/dist/ponyflow-engine*` as a resource.
- Pushing tags matching `v*` runs `.github/workflows/build-windows.yml`, which creates a GitHub Release and attaches the MSI.

## Consequences

- Windows releases are reproducible from CI.
- Spec changes are reviewed in PRs like other source.
- Local production builds require PyInstaller + a successful freeze before `npm run tauri:build`.
