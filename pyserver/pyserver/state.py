from typing import Dict
import time


class VadState:
    def __init__(self) -> None:
        self.active = False
        self.last_change = 0.0
        self.hangover_frames = 0
        self.activity_start = 0.0
        self.wake_armed = True
        self.last_wake = 0.0


# Per-connection VAD + wakeword state
state: Dict[str, VadState] = {}


def now_ts() -> float:
    return time.time()

