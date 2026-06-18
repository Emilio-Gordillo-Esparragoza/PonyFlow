import json
from state import AgentState
from utils.llm import create_llm
from config import MODELS

llm = create_llm(MODELS.planner)


def planner(state: AgentState) -> dict:
    prompt = (
        "You are a planner. Given a user request, output a JSON plan with a 'steps' array "
        "describing what code needs to be written. Output ONLY valid JSON, no other text.\n\n"
        f"User request: {state['user_input']}"
    )
    result = llm.invoke(prompt)
    plan = result.strip()
    if "{" not in plan:
        plan = json.dumps({"steps": [plan]})
    return {"plan": plan}
