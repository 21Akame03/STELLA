import { io } from 'socket.io-client';
import { VAD_anim_start, VAD_anim_end, startPlaybackViz, stopPlaybackViz } from './animations';
import { initAudio, StartMicrophone, StopMicrophone, beginNlpWindow } from './audio-setup';
const socket = io("http://localhost:8000");


// Wire audio streaming callbacks to socket events
initAudio({
    onFrame: (buffer) => {
        if (socket.connected) socket.emit('stream-data', buffer);
    },
    onClip: ({ sampleRate, pcm }) => {
        if (socket.connected) socket.emit('nlp-clip', { sampleRate, pcm });
    }
});

socket.on("connect", () => {
    console.log("Socket connected");
    VAD_anim_start();
    StartMicrophone();
});

socket.on("VAD_STATUS", (args) => {
    if (args && args.active === true) {
        VAD_anim_start();
    } else if (args && args.active === false) {
        VAD_anim_end();
    }
});

// Server indicates wakeword detected on live stream
socket.on('WAKEWORD_DETECTED', () => {
    console.log('Wakeword detected');
    // Begin NLP capture window: pre-roll + 10s
    beginNlpWindow({ preRollMs: 1500, durationMs: 10000 });
});

// Server returns synthesized audio (MP3) to play
// Accepts either a URL string or binary/base64 payloads.
const audioEl = document.getElementById('audio');
let playbackCtx = null;
let mediaElSource = null;

function teardownPlayback() {
    try { stopPlaybackViz(); } catch {}
    try { audioEl.pause(); } catch {}
    try { if (mediaElSource) mediaElSource.disconnect(); } catch {}
    try { if (playbackCtx) playbackCtx.close(); } catch {}
    playbackCtx = null;
    mediaElSource = null;
}

socket.on('AUDIO_RESPONSE', async (payload) => {
    try {
        teardownPlayback();

        let objectUrl = null;
        if (payload && typeof payload === 'string') {
            // direct URL
            audioEl.src = payload;
        } else if (payload && payload.url) {
            audioEl.src = payload.url;
        } else if (payload && payload.mp3Base64) {
            const byteChars = atob(payload.mp3Base64);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/mpeg' });
            objectUrl = URL.createObjectURL(blob);
            audioEl.src = objectUrl;
        } else if (payload && payload.mp3) {
            // ArrayBuffer
            const blob = new Blob([payload.mp3], { type: 'audio/mpeg' });
            objectUrl = URL.createObjectURL(blob);
            audioEl.src = objectUrl;
        } else {
            console.warn('AUDIO_RESPONSE payload not recognized');
            return;
        }

        // Prepare analyser to drive ring beeps during playback
        playbackCtx = new (window.AudioContext || window.webkitAudioContext)();
        mediaElSource = playbackCtx.createMediaElementSource(audioEl);
        const analyser = playbackCtx.createAnalyser();
        analyser.fftSize = 2048;
        mediaElSource.connect(analyser);
        analyser.connect(playbackCtx.destination);

        audioEl.onended = () => {
            stopPlaybackViz();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            teardownPlayback();
        };

        // Resume context if suspended (autoplay policies)
        if (playbackCtx.state === 'suspended') {
            await playbackCtx.resume();
        }

        startPlaybackViz(analyser);
        await audioEl.play();
    } catch (err) {
        console.error('Failed to play AUDIO_RESPONSE:', err);
        try { stopPlaybackViz(); } catch {}
    }
});

socket.on('connect_error', (err) => {
    console.error('Socket connect_error:', err?.message || err);
    VAD_anim_end();
});

socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${reason}`);
    VAD_anim_end();
    StopMicrophone();
});

export { socket }
