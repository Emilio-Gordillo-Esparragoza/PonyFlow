import json
from state import AgentState
from utils.llm import create_llm
from config import MODELS

llm = create_llm(MODELS.reader)


def reader(state: AgentState) -> dict:
    prompt = (
        "You are a code reviewer. Check for secrets, bad practices, inconsistencies. "
        "Return JSON:\n"
        '{"approved": true/false, "issues": [], "security_risks": []}\n\n'
        f"Code:\n{state['code']}\n\n"
        "Output ONLY valid JSON."
    )
    result = llm.invoke(prompt)
    try:
        data = json.loads(result.strip())
        if "approved" not in data:
            return {
                "review": json.dumps(
                    {
                        "approved": False,
                        "issues": ["Invalid reader output: missing approved"],
                    }
                ),
                "approved": False,
            }
        return {"review": json.dumps(data), "approved": data.get("approved", False)}
    except json.JSONDecodeError:
        return {
            "review": json.dumps(
                {"approved": False, "issues": ["Invalid JSON from reader"]}
            ),
            "approved": False,
        }
