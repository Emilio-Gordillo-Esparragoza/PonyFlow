# Multi-Agent System with LangGraph + Ollama

4 agents (Planner, Coder, Tester, Reader) connected via LangGraph with retry logic.

## Setup

### 1. Install Ollama

https://ollama.com/download

### 2. Pull models

```bash
ollama run llama3
ollama run mistral
ollama run phi3
```

### 3. Install Python deps

```bash
pip install -r requirements.txt
```

## Run

```bash
python main.py "create a python function that checks if a number is prime"
```

## Architecture

```
Planner → Coder → Tester → Reader → (approve? → END | fail → Coder)
```

Max 3 iterations.
