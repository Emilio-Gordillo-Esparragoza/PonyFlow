import json
from state import AgentState
from utils.llm import create_llm
from config import MODELS

llm = create_llm(MODELS.tester)


def tester(state: AgentState) -> dict:
    prompt = (
        "You are a tester. Given code, test it and return JSON:\n"
        '{"status": "pass/fail", "errors": [], "suggestions": []}\n\n'
        f"Code:\n{state['code']}\n\n"
        "Output ONLY valid JSON."
    )
    result = llm.invoke(prompt)
    try:
        parsed = json.loads(result.strip())
        if "status" not in parsed:
            return {
                "test_result": json.dumps(
                    {
                        "status": "fail",
                        "errors": ["Invalid tester output: missing status"],
                    }
                )
            }
        return {"test_result": json.dumps(parsed)}
    except json.JSONDecodeError:
        return {
            "test_result": json.dumps(
                {"status": "fail", "errors": ["Invalid JSON from tester"]}
            )
        }
