from pathlib import Path
from state import AgentState
from utils.llm import create_llm

llm = create_llm("llama3")

PONYTAIL = Path(__file__).parent / "skills" / "ponytail.md"


def coder(state: AgentState) -> dict:
    rules = PONYTAIL.read_text(encoding="utf-8")

    prompt = (
        f"{rules}\n\n"
        "You are using Ponytail. You MUST minimize code. "
        "Do NOT overengineer. Prefer deletion over addition.\n\n"
        f"Plan: {state['plan']}\n"
        f"User request: {state['user_input']}\n"
        f"Previous test result (if any): {state.get('test_result', 'none')}\n"
        f"Previous review (if any): {state.get('review', 'none')}\n\n"
        "Write the Python code. Output ONLY the code, no explanation, no markdown."
    )
    result = llm.invoke(prompt)
    code = result.strip()
    if "```" in code:
        code = code.split("```")[1]
        if code.startswith("python"):
            code = code[6:]
        code = code.strip()
    return {"code": code}
