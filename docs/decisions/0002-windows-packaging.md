# 0002 — Windows packaging via PyInstaller + Tauri

## Status

Accepted

## Context

The Windows CI workflow freezes the Python engine with PyInstaller, then bundles it into a Tauri MSI. The repo previously gitignored `*.spec` and did not commit `engine/ponyflow.spec` or declare PyInstaller as a dependency, so release builds failed.

## Decision

- Commit [`engine/ponyflow.spec`](../../engine/ponyflow.spec) and stop blanket-ignoring `*.spec` in `.gitignore`.
- Declare `pyinstaller` in [`engine/requirements.txt`](../../engine/requirements.txt).
- Freeze the engine as `ponyflow-engine` (with Ponytail skill data under `engine/agents/skills/`) via `python -m PyInstaller ponyflow.spec`.
- Stage `engine/dist/ponyflow-engine.exe` into `src-tauri/resources/` before the Tauri build so the resource path is stable on CI.
- Tauri bundles MSI and NSIS installers; tags matching `v*` attach those artifacts to a GitHub Release.

## Consequences

- Windows releases are reproducible from CI.
- Spec changes are reviewed in PRs like other source.
- Local production builds require PyInstaller + a successful freeze before `npm run tauri:build`.
