# PonyFlow

A local-first desktop app that runs a multi-agent AI pipeline (Planner → Coder → Tester → Reader) to generate, test, and review code using local LLMs via Ollama. No cloud, no API keys, no data leaves your machine.

PonyFlow solves the problem of AI-assisted coding without sacrificing privacy or control. It's for developers who want real AI code generation — not autocomplete — but refuse to send proprietary code to third-party APIs. The entire pipeline runs locally on your hardware.

---

## Why Local?

**Privacy:** Your code never leaves your machine. No telemetry, no training data harvesting, no cloud logging. What you write stays yours.

**Offline:** Works without internet after initial model downloads. Pull the models once, then unplug.

**Cost:** Zero per-token charges. No API keys, no subscription, no rate limits. The only cost is your electricity.

**Control:** Choose your own models. Swap them per agent. Tune temperatures. The pipeline is yours to modify.

---

## Why 4 Agents?

A single LLM call produces worse code than a pipeline of specialized agents. Each agent has a different model tuned for its task:

- **Planner** (mistral): Structures the request into a JSON plan. Breaks down vague prompts into actionable steps.
- **Coder** (llama3): Writes minimal Python code under Ponytail constraints. No fluff, no overengineering.
- **Tester** (phi3): Executes the code and reports pass/fail with concrete suggestions.
- **Reader** (mistral): Reviews for security issues, bad practices, and Ponytail violations.

The Reader can send the Coder back for rework (loop, max 3 iterations). This separation of concerns catches bugs the Coder alone would miss — logic errors, security holes, over-engineered solutions.

---

## The Ponytail Philosophy

Ponytail is a strict code-generation ruleset loaded into the Coder agent at runtime. It enforces minimal, high-signal code. The rules (in priority order):

1. **YAGNI** — Do we need this at all? If not, delete it.
2. **Prefer stdlib** — No PyPI dependency if standard library works.
3. **Prefer native** — Use OS-native features before libraries.
4. **Prefer existing deps** — Reuse what's already imported.
5. **Prefer one-liners** — Can this be a single expression?
6. **Only then write minimal code** — Shortest correct solution wins.

Behavior constraints: no comments, no type annotations unless required, no docstrings, no edge case handling unless the edge case exists. Prefer deletion over addition. Zero-overhead abstractions only.

This is enforced at the prompt level — the rules are prepended to every Coder call. They are not optional and must never be removed.

---

## Architecture

```
┌─────────────┐     JSONL stdin/stdout      ┌──────────────────┐
│  Tauri/Rust │ ◄─────────────────────────► │  Python Engine   │
│  (Frontend) │                             │  (LangGraph)     │
└─────────────┘                             └──────────────────┘
```

The Rust backend is thin (≤300 lines) — process management only. It spawns the Python engine, relays JSONL over stdin/stdout, and handles health checks. All agent logic lives in Python.

### Agent Pipeline

```
Planner → Coder → Tester → Reader → (approve? → END | fail → Coder)
```

Max 3 iterations. Each arrow is a LangGraph edge with state passing.

---

## Quick Start

### Prerequisites

- Python 3.10+
- Ollama installed and running

### Install Ollama Models

```bash
ollama serve
ollama pull llama3
ollama pull mistral
ollama pull phi3
```

### Development (CLI)

```bash
# Install Python deps
pip install -r engine/requirements.txt

# Run a single prompt (natural language)
python engine/engine.py --cli "write a prime checker"
```

The CLI accepts a prompt directly via `--cli "your prompt"` and prints human-readable output — no JSONL needed.

### Development (GUI)

```bash
# Install frontend deps
npm install

# Install Python deps (in engine/)
cd engine && pip install -r requirements.txt

# Run Tauri dev (frontend + Python engine)
npm run tauri:dev
```

This starts Vite (hot-reload frontend at `localhost:1420`) and launches the Tauri window with the Python engine spawned as a subprocess.

> **Note:** GUI binaries will be available for download in future releases (Windows `.msi`, macOS `.dmg`, Linux `.AppImage` / `.deb`). For now, build from source using the steps above.

---

## Project Structure

```
ponyflow/
├── src-tauri/           # Rust backend (minimal — process management only)
│   ├── src/main.rs      # Spawns Python, relays JSONL, health checks
│   └── Cargo.toml
├── src/                 # React 19 + TypeScript + Tailwind
│   ├── components/      # AgentTrace, CodeBlock, InputBar, RunCard, RunHistory, StatusBar
│   ├── stores/          # Zustand stores (runStore, settingsStore)
│   ├── lib/             # Protocol types, engine bridge, utils
│   └── hooks/           # useEngine hook
├── engine/              # Python engine (source of truth)
│   ├── engine.py        # JSONL main loop
│   ├── graph.py         # LangGraph pipeline definition
│   ├── state.py         # AgentState TypedDict
│   ├── agents/          # planner, coder, tester, reader (each ~20 lines)
│   │   └── skills/
│   │       └── ponytail.md
│   ├── utils/llm.py     # Ollama factory
│   └── requirements.txt
├── package.json
└── README.md
```

---

## Protocol

Brief reference for the JSONL protocol between frontend and engine.

### Input (Frontend → Engine)

```json
{"type": "run", "id": "uuid", "prompt": "write a prime checker"}
{"type": "cancel", "id": "uuid"}
```

### Output (Engine → Frontend)

```json
{"type": "agent_start", "agent": "planner", "run_id": "..."}
{"type": "token", "agent": "coder", "content": "def is_prime(n):"}
{"type": "agent_end", "agent": "planner", "output": "...", "run_id": "..."}
{"type": "run_complete", "run_id": "...", "code": "...", "state": {...}}
{"type": "run_error", "run_id": "...", "error": "..."}
{"type": "engine_error", "message": "...", "fatal": true}
```

---

## Building for Production

```bash
# Build Python engine
cd engine
pyinstaller ponyflow.spec

# Build Tauri app (bundles engine binary + frontend)
cd ..
npm run tauri:build
```

Output: `src-tauri/target/release/bundle/`

---

## License

MIT License — Copyright (c) 2026 Emilio Gordillo Esparragoza