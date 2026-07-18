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

    prior_plan = state.get("plan") or ""
    prior_code = state.get("code") or ""
    prior_test = state.get("test_result") or ""
    prior_review = state.get("review") or ""

    if prior_plan or prior_code or prior_test or prior_review:
        prompt += (
            "\n\nPrevious attempt failed. Revise the plan to fix the problems below.\n"
            f"Previous plan: {prior_plan or 'none'}\n"
            f"Previous code: {prior_code or 'none'}\n"
            f"Test result: {prior_test or 'none'}\n"
            f"Review: {prior_review or 'none'}\n"
        )

    result = llm.invoke(prompt)
    plan = result.strip()
    if "{" not in plan:
        plan = json.dumps({"steps": [plan]})
    return {"plan": plan}
