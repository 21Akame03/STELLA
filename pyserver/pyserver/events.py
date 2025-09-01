from typing import Any, Dict

from .core import sio
from .state import VadState, state, now_ts
from .utils import rms_int16_le, make_beep_wav_data_url


@sio.event
async def connect(sid, environ):
    state[sid] = VadState()
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    state.pop(sid, None)
    print(f"Client disconnected: {sid}")


@sio.on("stream-data")
async def on_stream_data(sid, data):
    # data is expected to be bytes (ArrayBuffer from client) of int16 LE @ 16kHz
    st = state.get(sid)
    if st is None:
        return

    rms = rms_int16_le(data)
    # Simple energy-based VAD with hysteresis
    th_on = 0.02
    th_off = 0.01
    hangover_max = 5

    now = now_ts()
    if st.active:
        if rms < th_off:
            st.hangover_frames += 1
            if st.hangover_frames >= hangover_max:
                st.active = False
                st.hangover_frames = 0
                st.last_change = now
                await sio.emit("VAD_STATUS", {"active": False}, to=sid)
        else:
            st.hangover_frames = 0
    else:
        if rms > th_on:
            st.active = True
            st.last_change = now
            st.activity_start = now
            await sio.emit("VAD_STATUS", {"active": True}, to=sid)

    # Wakeword stub: if speech has been continuous > 0.8s and cooldown passed, fire once
    cooldown_s = 5.0
    if (
        st.active
        and st.wake_armed
        and (now - st.activity_start) > 0.8
        and (now - st.last_wake) > cooldown_s
    ):
        st.wake_armed = False
        st.last_wake = now
        await sio.emit("WAKEWORD_DETECTED", {}, to=sid)
        st.wake_armed = True


@sio.on("nlp-clip")
async def on_nlp_clip(sid, payload: Dict[str, Any]):
    # payload: { sampleRate: int, pcm: bytes }
    try:
        sr = int(payload.get("sampleRate", 16000))
        pcm = payload.get("pcm", b"")
        print(f"Received NLP clip from {sid}: {len(pcm)} bytes @ {sr} Hz")
    except Exception as e:
        print(f"Invalid nlp-clip payload: {e}")

    # Generate a short WAV data URL as a placeholder response
    url = make_beep_wav_data_url(duration_s=1.2, sr=16000, freq=523.25)  # C5 beep
    await sio.emit("AUDIO_RESPONSE", {"url": url}, to=sid)

