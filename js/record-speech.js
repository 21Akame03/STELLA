import { socket } from './network';

const indicator = document.querySelector("#indicator");
const recording_indicator = document.querySelector("#recording");
let mediaStream, recorder;

let audioContext = new AudioContext();
navigator.mediaDevices.getUserMedia({audio: {sampleRate: 16000, channelCount: 1}}).then(stream => {
    mediaStream = stream;

    // start vad
    StartgetUserMedia(stream);

    // create recorder 
}
).catch(console.error);

function StartgetUserMedia(stream) {
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
    var vad = new VAD(options);
}

function StartMicrophone() {
    recorder = new MediaRecorder(mediaStream)
    
    let chunks = [];
    recorder.ondataavailable = function(e) {
        chunks.push(e.data);
    }
    
    recorder.start()

    //  send the whole damn binary
    recorder.onstop = (e) => {
        const blob = new Blob(chunks, { 'type' : 'audio/wav' });
        chunks = [];
        socket.send(blob);
    }
}

const recordCmd = () => {
    // animation
    recording_indicator.classList.remove("rotating-circle-norm");
    recording_indicator.classList.add("rotating-circle-record");

    StartMicrophone();

    // record 5s of command
    //TODO: this needs to be fine tuned
    setTimeout(() => {
        // remove animation
        recording_indicator.classList.remove("rotating-circle-record");
        recording_indicator.classList.add("rotating-circle-record-stop");
        
        recorder.stop();

        setTimeout(() => {
            recording_indicator.classList.add("rotating-circle-norm");
            recording_indicator.classList.remove("rotating-circle-record-stop");
        }, 1000);
    }, 6000);
}

export { recordCmd }