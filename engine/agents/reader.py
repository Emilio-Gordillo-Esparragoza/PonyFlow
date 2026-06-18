import json
from state import AgentState
from utils.llm import create_llm

llm = create_llm("mistral")


def reader(state: AgentState) -> dict:
    prompt = (
        "You are a code reviewer. Check for secrets, bad practices, inconsistencies. "
        "Return JSON:\n"
        '{"approved": true/false, "issues": [], "security_risks": []}\n\n'
        f"Code:\n{state['code']}\n\n"
        "Output ONLY valid JSON."
    )
    result = llm.invoke(prompt)
    data = json.loads(result.strip())
    return {"review": result.strip(), "approved": data.get("approved", False)}
