import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:8000/")

socket.on('connect', () => {
    console.log("connection")
})

socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected` ); // undefined
});

export { socket }