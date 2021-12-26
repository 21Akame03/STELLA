import { PorcupineWorkerFactory } from '@picovoice/porcupine-web-en-worker';
import { CobraWorkerFactory } from "@picovoice/cobra-web-worker";
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import './network';
import {recordCmd} from './record-speech';
import { socket } from './network';

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