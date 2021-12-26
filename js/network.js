import { io } from 'socket.io-client';
import { StartRecording, StopRecording } from './audio-setup';
import speak from './Speech_synt';


// let socket = new WebSocket("ws://127.0.0.1:8000");

// socket.addEventListener('open', (event) => {
//     socket.send(JSON.stringify({event: "Connection"}));
// });

// socket.addEventListener('close', (event) => {
//     console.log("disconnected")
// })

// socket.addEventListener("message", (event) => {
//     let data = event.data;
//     console.log(data)

//     // if bytes data then its voice
//     if (data instanceof Blob) {speak(data)};
// })

const socket = io("ws://localhost:8000");

socket.on("connect", () => {

    console.log("connected")
    StartRecording()
});

socket.on('disconnect', (e) => {
    console.log(`Disconnected: ${e}`);
    StopRecording();
})

export { socket }
