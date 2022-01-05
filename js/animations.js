import { mediaStream } from './audio-setup';

const indicator = document.querySelector("#indicator");
let audioContext = new AudioContext();


function StartVADanim(stream) {
    var source = audioContext.createMediaStreamSource(stream);

    console.log("start")

    //setup
    let options = {
        source: source,
        voice_stop: function() {
            console.log('voice_stop')
            indicator.classList.remove("stroke-sky-400");
            indicator.classList.add("stroke-zinc-500")
        ;}, 
        voice_start: function() {
            console.log('voice_start');
            indicator.classList.add("stroke-sky-400")
            indicator.classList.remove("stroke-zinc-500");
        }
    }

    //create VAD
    new VAD(options);
}

const intercheck = setInterval(() => {
    if (mediaStream){
        StartVADanim(mediaStream);
        clearInterval(intercheck);
    }
}, 1000);

