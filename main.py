import sys
from graph import build_graph


def main():
    if len(sys.argv) > 1:
        user_input = " ".join(sys.argv[1:])
    else:
        user_input = input("Enter your request: ")

    graph = build_graph()
    state = {
        "user_input": user_input,
        "plan": "",
        "code": "",
        "test_result": "",
        "review": "",
        "approved": False,
        "iterations": 0,
    }

    result = graph.invoke(state)
    print("\n" + "=" * 50)
    print("FINAL CODE:")
    print(result.get("code", "No code generated"))
    print("=" * 50)


if __name__ == "__main__":
    main()
