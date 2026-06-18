import json
from state import AgentState
from utils.llm import create_llm

llm = create_llm("phi3")


def tester(state: AgentState) -> dict:
    prompt = (
        "You are a tester. Given code, test it and return JSON:\n"
        '{"status": "pass/fail", "errors": [], "suggestions": []}\n\n'
        f"Code:\n{state['code']}\n\n"
        "Output ONLY valid JSON."
    )
    result = llm.invoke(prompt)
    return {"test_result": result.strip()}
