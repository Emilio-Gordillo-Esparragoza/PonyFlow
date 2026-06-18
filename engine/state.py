from typing import TypedDict


class AgentState(TypedDict):
    user_input: str
    plan: str
    code: str
    test_result: str
    review: str
    approved: bool
    iterations: int
