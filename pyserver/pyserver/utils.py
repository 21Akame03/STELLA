import base64
import math


def rms_int16_le(buf: bytes) -> float:
    """Compute RMS of little-endian int16 samples normalized to 1.0."""
    if not buf:
        return 0.0
    mv = memoryview(buf)
    n = len(buf) // 2
    if n == 0:
        return 0.0
    sum_sq = 0.0
    for i in range(0, n * 2, 2):
        s = int.from_bytes(mv[i:i + 2], byteorder="little", signed=True)
        v = s / 32768.0
        sum_sq += v * v
    return (sum_sq / n) ** 0.5


def make_beep_wav_data_url(duration_s: float = 1.2, sr: int = 16000, freq: float = 440.0) -> str:
    """Generate a simple sine beep WAV and return as a data URL."""
    num_samples = int(sr * duration_s)
    amp = int(0.25 * 32767)
    pcm = bytearray()
    for i in range(num_samples):
        t = i / sr
        sample = int(amp * math.sin(2 * math.pi * freq * t))
        pcm += int.to_bytes(sample, 2, "little", signed=True)

    subchunk2_size = len(pcm)
    chunk_size = 36 + subchunk2_size
    byte_rate = sr * 1 * 2
    block_align = 1 * 2

    header = bytearray()
    header += b"RIFF"
    header += chunk_size.to_bytes(4, "little")
    header += b"WAVE"
    header += b"fmt "
    header += (16).to_bytes(4, "little")  # PCM fmt chunk size
    header += (1).to_bytes(2, "little")   # AudioFormat PCM
    header += (1).to_bytes(2, "little")   # NumChannels = 1
    header += sr.to_bytes(4, "little")    # SampleRate
    header += byte_rate.to_bytes(4, "little")
    header += block_align.to_bytes(2, "little")
    header += (16).to_bytes(2, "little")  # BitsPerSample
    header += b"data"
    header += subchunk2_size.to_bytes(4, "little")

    wav = bytes(header) + bytes(pcm)
    b64 = base64.b64encode(wav).decode("ascii")
    return f"data:audio/wav;base64,{b64}"

