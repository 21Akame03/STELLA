# pip install ollama pydantic piper-tts playsound

import json
import time
import wave
import os
from typing import Dict, Any

import ollama
from pydantic import BaseModel, Field, ValidationError
from piper import PiperVoice
from playsound import playsound

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


# ---------- Executor (your device twin / MQTT state stub) ----------
def check_light_impl(args: Dict[str, Any]) -> Dict[str, Any]:
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
    tool_calls = msg.get("tool_calls")

    if not tool_calls:
        retry = ollama.chat(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": user_text + " Use a tool call only."},
                {"role": "user", "content": "World state:\n" + json.dumps(WORLD)},
            ],
            tools=TOOLS,
            options={"num_predict": 64},
        )
        msg = retry.get("message", {})
        tool_calls = msg.get("tool_calls")

    if not tool_calls:
        return "I couldn’t verify that."

    call = tool_calls[0]
    fn = call["function"]["name"]
    raw_args = call["function"]["arguments"]

    try:
        args = json.loads(raw_args) if isinstance(raw_args, str) else raw_args
        parsed = CheckLightsArgs(**args).model_dump()
    except (ValidationError, json.JSONDecodeError):
        return "Invalid tool arguments."

    if fn not in DISPATCH:
        return "Unknown tool."

    result = DISPATCH[fn](parsed)
    state = "on" if result["on"] else "off"
    return f"Zone {result['zone']} is {state}, {result['brightness']}% {result['effect']} #{result['color']}."


# ---------- TTS ----------
def tts_piper(
    text: str, voice_path: str, out_wav: str = "check_light_reply.wav"
) -> str:
    if not os.path.exists(voice_path):
        raise FileNotFoundError(
            f"Piper voice not found: {voice_path}\n"
            "Download a compatible .onnx voice and set VOICE_PATH."
        )
    voice = PiperVoice.load(voice_path)
    with wave.open(out_wav, "wb") as f:
        voice.synthesize_wav(text, f)
    return out_wav


def speak_check(user_query: str, voice_path: str) -> str:
    summary = plan_and_execute(user_query)
    try:
        wav = tts_piper(summary, voice_path)
        playsound(wav)
    except Exception as e:
        print(f"[TTS warning] {e}")
    return summary


# ---------- Demo ----------
if __name__ == "__main__":
    VOICE_PATH = (
        "/Users/akame/Documents/Prog/STELLA/pyserver/en_US-hfc_female-medium.onnx"
    )
    print(speak_check("Check right.", VOICE_PATH))  # voice + print
    print(speak_check("Check the front lights.", VOICE_PATH))  # defaults to 'both'
    print(speak_check("Is the left light on?", VOICE_PATH))
