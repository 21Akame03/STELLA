# pip install ollama pydantic
import json
import time
from typing import Dict, Any

import ollama
from pydantic import BaseModel, Field, ValidationError

MODEL = "llama3.2:3b"


# ---------- Tool schema ----------
class CheckLightsArgs(BaseModel):
    zone: str = Field(pattern="^(left|right|both)$", description="LED zone")


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "check_light",
            "description": "Return LED state for a zone.",
            "parameters": CheckLightsArgs.model_json_schema(),
        },
    }
]

# ---------- Prompts ----------
SYSTEM = (
    "You are LUCY, an assistant planner. "
    "Only use the provided tool. "
    "For real-world facts, NEVER answer in prose—return exactly one tool call. "
    "If zone is unspecified, default to 'both'."
)

WORLD = {
    "devices": {
        "led/front_strip": {
            "zones": ["left", "right", "both"],
            "effects": ["solid", "breathe", "chase"],
        }
    }
}


# ---------- Executor ----------
def check_light_impl(args: Dict[str, Any]) -> Dict[str, Any]:
    # Replace with your real device twin / MQTT retained state.
    fake_state = {
        "left": {"on": True, "color": "3366FF", "brightness": 30, "effect": "breathe"},
        "right": {"on": False, "color": "000000", "brightness": 0, "effect": "solid"},
        "both": {"on": True, "color": "3366FF", "brightness": 30, "effect": "breathe"},
    }
    z = args["zone"]
    s = fake_state.get(
        z, {"on": False, "color": "000000", "brightness": 0, "effect": "solid"}
    )
    s["zone"] = z
    s["ts"] = int(time.time())
    return s


DISPATCH = {"check_light": check_light_impl}


# ---------- Core loop ----------
def plan_and_execute(user_text: str) -> str:
    # Ask the model
    resp = ollama.chat(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": user_text},
            {"role": "user", "content": "World state:\n" + json.dumps(WORLD)},
        ],
        tools=TOOLS,
        options={"num_predict": 64},
    )

    msg = resp.get("message", {})
    tool_calls = msg.get("tool_calls")  # correct key

    # If the model slipped into prose, nudge once
    if not tool_calls:
        retry = ollama.chat(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": user_text + " Use a tool call only."},
            ],
            tools=TOOLS,
            options={"num_predict": 64},
        )
        msg = retry.get("message", {})
        tool_calls = msg.get("tool_calls")

    if not tool_calls:
        return "I couldn’t verify that."

    # Enforce exactly one tool call
    call = tool_calls[0]
    fn = call["function"]["name"]
    raw_args = call["function"]["arguments"]

    # Validate args
    try:
        args = json.loads(raw_args) if isinstance(raw_args, str) else raw_args
        parsed = CheckLightsArgs(**args).model_dump()
    except (ValidationError, json.JSONDecodeError):
        return "Invalid tool arguments."

    # Execute deterministically
    if fn not in DISPATCH:
        return "Unknown tool."

    result = DISPATCH[fn](parsed)

    # Human-facing summary
    state = "on" if result["on"] else "off"
    return f"Zone {result['zone']} is {state}, {result['brightness']}% {result['effect']} #{result['color']}."


# ---------- Demo ----------
if __name__ == "__main__":
    print(plan_and_execute("Is the left light on?"))
    print(plan_and_execute("Check the front lights."))  # defaults to 'both'
    print(plan_and_execute("Check right."))
