// Audio capture, downsampling, buffering, and NLP clip window management.

const PV_SAMPLE_RATE = 16000;
const FRAME_LENGTH = 4096; // input frame size to ScriptProcessor

let audioContext;
let mediaStream;
let mediaStreamSource;
let processor;
let downsampler;

// Callbacks injected by the network layer
let onFrameEmit = null; // function(buffer: ArrayBuffer)
let onClipReady = null; // function({ sampleRate, pcm: ArrayBuffer })

// Ring buffer stores recent Int16Array frames of downsampled audio
const RING_BUFFER_MAX_SECS = 3; // keep ~3s pre-roll
let ringBuffer = [];
let ringBufferSamples = 0;

// NLP capture window state
let captureActive = false;
let captureSamplesTarget = PV_SAMPLE_RATE * 10; // 10 seconds
let captureSamplesCollected = 0;
let captureFrames = [];
let captureTimer = null;

function initAudio({ onFrame, onClip }) {
  onFrameEmit = onFrame;
  onClipReady = onClip;
}

function createAudioProcessor(audioCtx, audioSource) {
  const node = audioCtx.createScriptProcessor(FRAME_LENGTH, 1, 1);
  const inputSampleRate = audioSource.context.sampleRate;

  // Vite-friendly worker URL
  const workerUrl = new URL('./downsampler/downsampling_worker.js', import.meta.url);
  downsampler = new Worker(workerUrl);
  downsampler.postMessage({ command: 'init', inputSampleRate });

  downsampler.onmessage = (e) => {
    const frame = e.data; // Int16Array at 16kHz
    // Emit realtime stream for server-side VAD/wakeword
    if (onFrameEmit) onFrameEmit(frame.buffer);

    // Maintain ring buffer (~3s)
    pushToRingBuffer(frame);

    // If capture window active, accumulate until target reached
    if (captureActive) appendToCapture(frame);
  };

  node.onaudioprocess = (event) => {
    const data = event.inputBuffer.getChannelData(0);
    downsampler.postMessage({ command: 'process', inputFrame: data });
  };

  node.shutdown = () => {
    node.disconnect();
    node.onaudioprocess = null;
  };

  node.connect(audioCtx.destination);
  return node;
}

function pushToRingBuffer(int16Frame) {
  ringBuffer.push(int16Frame);
  ringBufferSamples += int16Frame.length;
  const maxSamples = PV_SAMPLE_RATE * RING_BUFFER_MAX_SECS;
  while (ringBufferSamples > maxSamples && ringBuffer.length) {
    const old = ringBuffer.shift();
    ringBufferSamples -= old.length;
  }
}

function appendToCapture(int16Frame) {
  captureFrames.push(int16Frame);
  captureSamplesCollected += int16Frame.length;
  if (captureSamplesCollected >= captureSamplesTarget) finalizeCapture();
}

function beginNlpWindow({ preRollMs = 1500, durationMs = 10000 } = {}) {
  // Restart any existing window
  clearTimeout(captureTimer);
  captureActive = false;
  captureFrames = [];
  captureSamplesCollected = 0;
  captureSamplesTarget = Math.floor((PV_SAMPLE_RATE * durationMs) / 1000);

  // Seed with pre-roll from ring buffer
  const preRollSamples = Math.floor((PV_SAMPLE_RATE * preRollMs) / 1000);
  let seeded = 0;
  // Walk ringBuffer from the end backwards to collect recent frames
  for (let i = ringBuffer.length - 1; i >= 0 && seeded < preRollSamples; i--) {
    const fr = ringBuffer[i];
    captureFrames.unshift(fr);
    seeded += fr.length;
  }

  captureActive = true;
  captureTimer = setTimeout(() => finalizeCapture(), durationMs);
}

function finalizeCapture() {
  if (!captureActive) return;
  captureActive = false;
  clearTimeout(captureTimer);

  // Flatten frames into a single Int16Array
  let total = 0;
  for (const fr of captureFrames) total += fr.length;
  const merged = new Int16Array(total);
  let offset = 0;
  for (const fr of captureFrames) {
    merged.set(fr, offset);
    offset += fr.length;
  }

  captureFrames = [];
  captureSamplesCollected = 0;

  if (onClipReady) onClipReady({ sampleRate: PV_SAMPLE_RATE, pcm: merged.buffer });
}

function StartMicrophone() {
  if (audioContext) return; // already started
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const success = (stream) => {
    mediaStream = stream;
    mediaStreamSource = audioContext.createMediaStreamSource(stream);
    processor = createAudioProcessor(audioContext, mediaStreamSource);
    mediaStreamSource.connect(processor);
  };

  const fail = (e) => {
    console.error('Recording failure:', e);
  };

  const constraints = { video: false, audio: { channelCount: 1 } };
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints).then(success).catch(fail);
  } else {
    // Legacy
    navigator.getUserMedia({ video: false, audio: true }, success, fail);
  }
}

function StopMicrophone() {
  if (mediaStream) {
    try { mediaStream.getTracks().forEach(t => t.stop()); } catch {}
  }
  if (mediaStreamSource) {
    try { mediaStreamSource.disconnect(); } catch {}
  }
  if (processor) {
    try { processor.shutdown(); } catch {}
  }
  if (downsampler) {
    try { downsampler.postMessage({ command: 'reset' }); downsampler.terminate(); } catch {}
  }
  if (audioContext) {
    try { audioContext.close(); } catch {}
  }
  audioContext = undefined;
  mediaStream = undefined;
  mediaStreamSource = undefined;
  processor = undefined;
  downsampler = undefined;
  ringBuffer = [];
  ringBufferSamples = 0;
  captureActive = false;
  captureFrames = [];
  captureSamplesCollected = 0;
  clearTimeout(captureTimer);
  captureTimer = null;
}

export { initAudio, StartMicrophone, StopMicrophone, beginNlpWindow };
