import json
from langgraph.graph import StateGraph, END
from state import AgentState
from agents.planner import planner
from agents.coder import coder
from agents.tester import tester
from agents.reader import reader


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
    return "coder"


def build_graph() -> StateGraph:
    workflow = StateGraph(AgentState)

    workflow.add_node("planner", planner)
    workflow.add_node("coder", coder)
    workflow.add_node("tester", tester)
    workflow.add_node("reader", reader)

    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "coder")
    workflow.add_edge("coder", "tester")
    workflow.add_edge("tester", "reader")
    workflow.add_conditional_edges(
        "reader",
        should_rework,
        {
            "coder": "coder",
            "end": END,
        },
    )

    return workflow.compile()
