import { io } from 'socket.io-client';
import { VAD_anim_start, VAD_anim_end } from './animations';
const socket = io("http://localhost:8000");


socket.on("connect", () => {
    console.log("connected")
    VAD_anim_start()
});

// socket.on("VAD_STATUS", (args) => {
//     if (args.active == true) {
//         VAD_anim_start();
//     } else if (args.active == false) {
//         VAD_anim_end();
//     }
// });

socket.on('disconnect', (e) => {
    console.log(`Disconnected: ${e}`);
})

export { socket }