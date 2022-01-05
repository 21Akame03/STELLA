// import { socket } from "./network";

// var audioContext;
// var mediaStream;
// var mediaStreamSource;
// var processor;

// var recording;
// var recordingInterval;
// var recordingstart;
// var recordingtime;

// var DOWNSAMPLING_WORKER = 'js/downsampler/downsampling_worker.js'

// function createAudioProcessor(audioContext, audioSource) {
//     let processor = audioContext.createScriptProcessor(4096, 1, 1);

//     const sampleRate = audioSource.context.sampleRate;

//     let downsampler = new Worker(DOWNSAMPLING_WORKER);
//     downsampler.postMessage({command: "init", inputSampleRate: sampleRate});
//     downsampler.onmessage = (e) => {
//         if (socket.connected) {
//             socket.emit('stream-data', e.data.buffer);
//         }
//     }

//     processor.onaudioprocess = (event) => {
//         var data = event.inputBuffer.getChannelData(0);
//         downsampler.postMessage({command: "process", inputFrame: data})
//     }

//     processor.shutdown = () => {
//         processor.disconnect();
//         this.onaudioprocess = null;
//     }

//     processor.connect(audioContext.destination);
//     return processor;
// }

// function StartMicrophone() {
//     audioContext = new AudioContext();

//     const success = (stream) => {
//         console.log('recording');
//         mediaStream = stream;
//         mediaStreamSource = audioContext.createMediaStreamSource(stream);
//         processor = createAudioProcessor(audioContext, mediaStreamSource);
//         mediaStreamSource.connect(processor);
//     }

//     const fail = (e) => {
//         console.error('Recording failure: ', e);
//     }

//     if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//         navigator.mediaDevices.getUserMedia({
//             video: false,
//             audio: {sampleRate: 16000, channelCount: 1}
//         })
//         .then(success)
//         .catch(fail);
//     } else {
//         navigator.getUserMedia({
//             video: false,
//             audio: true
//         }, success, fail);
//     }
// }

// function StopMicrophone() {
//     if (mediaStream) {
//         mediaStream.getTracks()[0].stop();
//     }
//     if (mediaStreamSource) {
//         mediaStreamSource.disconnect();
//     }
//     if (processor) {
//         processor.shutdown();
//     }
//     if (audioContext) {
//         audioContext.close();
//     }
// }

// function StartRecording(e) {
//     if (!recording) {
//         recordingInterval = setInterval(() => {
//             let recordingtime = new Date().getTime() - recordingstart;
//         }, 100);

//         recording = true;
//         recordingstart = new Date().getTime();
//         recordingtime = 0;

//         StartMicrophone();
//     }
// }

// function StopRecording() {
//     if (recording) {
//         if (socket.connected) {
//             socket.emit('stream-reset');
//         }
//         clearInterval(recordingInterval);
//         recording = false;
//         StopMicrophone();
//     }
// }

// export { StartRecording, StopRecording, mediaStream }