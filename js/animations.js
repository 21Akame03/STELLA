// import { mediaStream } from './audio-setup';

const indicator = document.querySelector("#indicator");
let rafId = null;
let playbackAnalyser = null;
// let audioContext = new AudioContext();

function VAD_anim_start() {
    console.log('voice_start');
    indicator.classList.add("stroke-sky-400")
    indicator.classList.remove("stroke-zinc-500");
}

function VAD_anim_end() {
    console.log('voice_stop')
    indicator.classList.remove("stroke-sky-400");
    indicator.classList.add("stroke-zinc-500")
}

export { VAD_anim_start, VAD_anim_end };

// function StartVADanim(stream) {
//     var source = audioContext.createMediaStreamSource(stream);

//     console.log("start")

//     //setup
//     let options = {
//         source: source,
//         voice_stop: function() {
//             console.log('voice_stop')
//             indicator.classList.remove("stroke-sky-400");
//             indicator.classList.add("stroke-zinc-500")
//         ;}, 
//         voice_start: function() {
//             console.log('voice_start');
//             indicator.classList.add("stroke-sky-400")
//             indicator.classList.remove("stroke-zinc-500");
//         }
//     }
// }

// const intercheck = setInterval(() => {
//     if (mediaStream){
//         StartVADanim(mediaStream);
//         clearInterval(intercheck);
//     }
// }, 1000);

function startPlaybackViz(analyser) {
    playbackAnalyser = analyser;
    const bufferLength = analyser.fftSize;
    const timeData = new Uint8Array(bufferLength);
    cancelAnimationFrame(rafId);

    const loop = () => {
        analyser.getByteTimeDomainData(timeData);
        // Compute simple RMS to detect beats/energy
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = (timeData[i] - 128) / 128; // normalize -1..1
            sum += v * v;
        }
        const rms = Math.sqrt(sum / bufferLength);

        // Map RMS to visual: toggle brighter stroke on higher energy
        if (rms > 0.08) {
            indicator.classList.add("stroke-sky-400");
            indicator.classList.remove("stroke-zinc-500");
        } else if (rms > 0.02) {
            indicator.classList.add("stroke-sky-200");
            indicator.classList.remove("stroke-zinc-500");
        } else {
            indicator.classList.remove("stroke-sky-200");
            indicator.classList.remove("stroke-sky-400");
            indicator.classList.add("stroke-zinc-500");
        }

        rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
}

function stopPlaybackViz() {
    cancelAnimationFrame(rafId);
    rafId = null;
    playbackAnalyser = null;
}

export { startPlaybackViz, stopPlaybackViz };
