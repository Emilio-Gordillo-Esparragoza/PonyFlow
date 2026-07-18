import json
from state import AgentState


def should_rework(state: AgentState) -> str:
    test_ok = False
    try:
        test = json.loads(state.get("test_result", "{}"))
        test_ok = test.get("status") == "pass"
    except (json.JSONDecodeError, KeyError):
        pass
    approved = state.get("approved", False)

    if test_ok and approved:
        return "end"

    iterations = state.get("iterations", 0) + 1
    if iterations >= 3:
        return "end"
    state["iterations"] = iterations
    return "planner"
