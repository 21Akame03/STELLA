Python Socket.IO server for STELLA

Run instructions
- Create venv: `python3 -m venv .venv && source .venv/bin/activate`
- Install deps: `pip install -r requirements.txt`
- Start with uvicorn: `uvicorn pyserver.main:asgi_app --host 0.0.0.0 --port 8000 --reload`
- Or run directly: `python main.py`

What it does
- Receives `stream-data` (Int16 PCM, 16kHz), runs simple energy VAD, emits `VAD_STATUS`.
- After ~0.8s of continuous speech, emits `WAKEWORD_DETECTED` (stub wakeword logic with cooldown).
- Receives `nlp-clip` (pre-roll + 10s 16k PCM) and responds with `AUDIO_RESPONSE` containing a data URL for a short generated WAV beep (plays in the client UI). Replace with real TTS/mp3 as needed.

Project structure
- `pyserver/core.py`: creates `sio`, `rest`, and `asgi_app`.
- `pyserver/routes.py`: FastAPI routes (e.g., `/health`).
- `pyserver/state.py`: per-client VAD + wakeword state.
- `pyserver/utils.py`: audio helpers (RMS, beep WAV).
- `pyserver/events.py`: Socket.IO event handlers.
- `pyserver/main.py`: wires routes/events; exposes `asgi_app`.
- `main.py`: convenience runner for local dev.

Notes
- This is a minimal reference server without external VAD/ASR/LLM. Integrate your models/services where needed.
