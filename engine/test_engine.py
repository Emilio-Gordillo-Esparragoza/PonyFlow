import sys

sys.path.insert(0, ".")

from state import AgentState


def test_should_rework_passes_when_approved():
    state: AgentState = {
        "user_input": "",
        "plan": "",
        "code": "",
        "test_result": '{"status": "pass"}',
        "review": '{"approved": true}',
        "approved": True,
        "iterations": 0,
    }
    from graph import should_rework

    assert should_rework(state) == "end"


def test_should_rework_loops_on_fail():
    state: AgentState = {
        "user_input": "",
        "plan": "",
        "code": "",
        "test_result": '{"status": "fail"}',
        "review": '{"approved": false}',
        "approved": False,
        "iterations": 0,
    }
    from graph import should_rework

    assert should_rework(state) == "coder"


def test_should_rework_stops_at_max_iterations():
    state: AgentState = {
        "user_input": "",
        "plan": "",
        "code": "",
        "test_result": '{"status": "fail"}',
        "review": '{"approved": false}',
        "approved": False,
        "iterations": 3,
    }
    from graph import should_rework

    assert should_rework(state) == "end"
