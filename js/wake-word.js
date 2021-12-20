import { PorcupineWorkerFactory } from '@picovoice/porcupine-web-en-worker';
import { CobraWorkerFactory } from "@picovoice/cobra-web-worker";
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import './network';
import {recordCmd} from './record-speech';
import { socket } from './network';

// let voiceProb = 0.0;


// //start media stream
// navigator.mediaDevices.getUserMedia (
//     // constraints - only audio needed for this app
//     {
//         audio: {sampleRate: 16000, channelCount: 1}
//     })
//     // Success callback
//     .then(function(stream) {
//         recorder = new MediaRecorder(stream)
//     })
//     // Error callback
//     .catch(function(err) {
//         console.log('The following getUserMedia error occurred: ' + err);
//     }
// );


// // voice activity detection
// function cobraCallback(voiceProbability) {
//     //update global variable
//     voiceProb = voiceProbability;

// }

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

    // const cobraWorker = await CobraWorkerFactory.create(
    //     accesskey,
    //     cobraCallback
    // );

    const webVp = await WebVoiceProcessor.init({
        engines: [porcupineworker],
        start: true
    });
}

startSystem();