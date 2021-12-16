import { PorcupineWorkerFactory } from '@picovoice/porcupine-web-en-worker';
import { CobraWorkerFactory } from "@picovoice/cobra-web-worker";
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import './network';
import { socket } from './network';
import WebAudioRecorder from './lib/web-audio-recorder-min';

// show recording phase
const indicator = document.querySelector("#indicator");
const recording_indicator = document.querySelector("#recording");

let gumStream;
let voiceProb = 0.0;
let recorder;
let encodeAfterrecord = true;
let audioContext = new AudioContext;
let input;


//start media stream
navigator.mediaDevices.getUserMedia (
    // constraints - only audio needed for this app
    {
        audio: {sampleRate: 16000, channelCount: 1}
    })
    // Success callback
    .then(function(stream) {
        gumStream = stream;

        input = audioContext.createMediaStreamSource(stream);
        input.connect(audioContext.destination);

        recorder = new WebAudioRecorder()



    })
    // Error callback
    .catch(function(err) {
        console.log('The following getUserMedia error occurred: ' + err);
    }
);


const recordCmd = () => {
    // animation
    recording_indicator.classList.remove("rotating-circle-norm");
    recording_indicator.classList.add("rotating-circle-record");

    // recorder.start();
    // console.log(recorder.state)

    // let chunks = [];
    // recorder.ondataavailable = function(e) {
    //     chunks.push(e.data);
    // }

    // // recorder event
    // recorder.onstop = async function(e) {
    //     const blob = new Blob(chunks, {type: 'audio/ogg'});
    //     const buffer = await blob.arrayBuffer()
    //     console.log(buffer)

    //     socket.emit("voice_input", buffer);
    //     console.log(blob)
    // }


    // record 5s of command
    //TODO: this needs to be fine tuned
    setTimeout(() => {
        // remove animation
        recording_indicator.classList.remove("rotating-circle-record");
        recording_indicator.classList.add("rotating-circle-record-stop");

        // //stop recorder
        // recorder.stop();
        // console.log(recorder.state);

        setTimeout(() => {
            recording_indicator.classList.add("rotating-circle-norm");
            recording_indicator.classList.remove("rotating-circle-record-stop");
        }, 2000);
    }, 5000);
}




// voice activity detection
function cobraCallback(voiceProbability) {
    //update global variable
    voiceProb = voiceProbability;

}

// check if recording should be allowed
function keywordDetectionCallBack(keyword) {
    // allow a recording session
    recordCmd()
    console.log(keyword)
}

function processErrorCallBack(error) {
    console.error(error);
}

// wake word detection + VAD 
async function startSystem() {
    const accesskey = "aGzATPzW+PvcZb/gwpxzwNvkiW2IHQ0XYPzntr2Vh9x8opM1cX/Bcg==";
    
    const porcupineworker = await PorcupineWorkerFactory.create(
        accesskey,
        [{builtin: "Jarvis", sensitivity:0.5}],
        keywordDetectionCallBack,
        processErrorCallBack
    );

    const cobraWorker = await CobraWorkerFactory.create(
        accesskey,
        cobraCallback
    );

    const webVp = await WebVoiceProcessor.init({
        engines: [porcupineworker, cobraWorker],
        start: true
    });
}

startSystem();