import sys
import json
import time
import threading
import argparse
from state import AgentState
from agents.planner import planner
from agents.coder import coder
from agents.tester import tester
from agents.reader import reader


cancel_event = threading.Event()


def run_agent_cycle(state: AgentState, run_id: str):
    yield {"type": "agent_start", "agent": "coder", "run_id": run_id}
    code_result = ""
    for event in coder(state):
        if event["type"] == "token":
            yield event
        else:
            code_result = event.get("output", "")
            yield event

    if code_result:
        state["code"] = code_result

    yield {"type": "agent_start", "agent": "tester", "run_id": run_id}
    test_result = tester(state)
    state.update(test_result)
    yield {
        "type": "agent_end",
        "agent": "tester",
        "output": state["test_result"],
        "run_id": run_id,
    }

    yield {"type": "agent_start", "agent": "reader", "run_id": run_id}
    reader_result = reader(state)
    state.update(reader_result)
    yield {
        "type": "agent_end",
        "agent": "reader",
        "output": state["review"],
        "run_id": run_id,
    }


def run_pipeline(prompt: str, run_id: str):
    global cancel_event
    cancel_event.clear()

    state: AgentState = {
        "user_input": prompt,
        "plan": "",
        "code": "",
        "test_result": "",
        "review": "",
        "approved": False,
        "iterations": 0,
    }

    yield {"type": "agent_start", "agent": "planner", "run_id": run_id}
    result = planner(state)
    state.update(result)

    yield {
        "type": "agent_end",
        "agent": "planner",
        "output": state["plan"],
        "run_id": run_id,
    }

    max_iterations = 3
    while state.get("iterations", 0) < max_iterations:
        if cancel_event.is_set():
            yield {
                "type": "run_error",
                "run_id": run_id,
                "error": "Cancelled by user",
            }
            return

        yield from run_agent_cycle(state, run_id)

        test_ok = False
        try:
            test = json.loads(state.get("test_result", "{}"))
            test_ok = test.get("status") == "pass"
        except (json.JSONDecodeError, KeyError):
            pass

        approved = state.get("approved", False)
        iterations = state.get("iterations", 0) + 1
        state["iterations"] = iterations

        if test_ok and approved:
            yield {
                "type": "run_complete",
                "run_id": run_id,
                "code": state["code"],
                "state": {
                    "plan": state["plan"],
                    "code": state["code"],
                    "test_result": state["test_result"],
                    "review": state["review"],
                    "approved": state["approved"],
                    "iterations": state["iterations"],
                },
            }
            return

        if iterations >= max_iterations:
            yield {
                "type": "run_complete",
                "run_id": run_id,
                "code": state["code"],
                "state": {
                    "plan": state["plan"],
                    "code": state["code"],
                    "test_result": state["test_result"],
                    "review": state["review"],
                    "approved": state["approved"],
                    "iterations": state["iterations"],
                },
            }
            return


def print_cli_header():
    print("+----------------------------------+")
    print("|         PONYFLOW ENGINE          |")
    print("+----------------------------------+")
    print()


def print_section(title: str):
    print(f"\n-- {title} {'-' * (30 - len(title))}")
    print()


def run_cli(prompt: str):
    print_cli_header()
    print(f"Prompt: {prompt}\n")

    run_id = "cli-" + str(int(time.time() * 1000))
    plan_output = ""
    test_output = ""
    review_output = ""
    approved = False
    iterations = 0
    final_code = ""

    for event in run_pipeline(prompt, run_id):
        etype = event.get("type")

        if etype == "agent_start":
            continue

        if etype == "agent_end":
            agent = event.get("agent")
            output = event.get("output", "")

            if agent == "planner":
                plan_output = output
                print_section("Planner")
                print(output)

            elif agent == "tester":
                test_output = output
                print_section("Tester")
                try:
                    test = json.loads(output)
                    status = test.get("status", "unknown")
                    print(f"Status: {status}")
                    if test.get("suggestions"):
                        print(f"Suggestions: {test['suggestions']}")
                    if status == "pass":
                        print("No errors.")
                except (json.JSONDecodeError, KeyError):
                    print(output)

            elif agent == "reader":
                review_output = output
                print_section("Reader")
                try:
                    review = json.loads(output)
                    approved = review.get("approved", False)
                    print(f"Approved: {approved}")
                    if review.get("issues"):
                        print(f"Issues: {review['issues']}")
                    if approved:
                        print("No issues.")
                except (json.JSONDecodeError, KeyError):
                    print(output)

        elif etype == "run_complete":
            final_code = event.get("code", "")
            state_obj = event.get("state", {})
            iterations = (
                state_obj.get("iterations", 0) if isinstance(state_obj, dict) else 0
            )
            print_section("FINAL CODE")
            print(final_code)
            status = "Approved" if approved else "Not approved"
            print(f"\n{'=' * 14} {status} after {iterations} iterations {'=' * 14}")
            return

        elif etype == "run_error":
            error = event.get("error", "Unknown error")
            print(f"\nError: {error}")
            return

        elif etype == "engine_error":
            message = event.get("message", "Unknown error")
            print(f"\nEngine error: {message}")
            return

    if not final_code:
        print("\nError: No output generated")


def main():
    parser = argparse.ArgumentParser(description="PonyFlow Engine")
    parser.add_argument(
        "--cli", metavar="PROMPT", help="Run a single prompt in CLI mode"
    )
    args = parser.parse_args()

    if args.cli:
        run_cli(args.cli)
        return

    while True:
        line = sys.stdin.readline()
        if not line:
            break
        try:
            req = json.loads(line.strip())
            if req.get("type") == "run":
                run_id = req.get("id", "")
                prompt = req.get("prompt", "")
                for event in run_pipeline(prompt, run_id):
                    print(json.dumps(event), flush=True)
            elif req.get("type") == "cancel":
                cancel_event.set()
        except json.JSONDecodeError:
            print(
                json.dumps(
                    {
                        "type": "engine_error",
                        "message": "Invalid JSON input",
                        "fatal": False,
                    }
                ),
                flush=True,
            )


if __name__ == "__main__":
    main()
