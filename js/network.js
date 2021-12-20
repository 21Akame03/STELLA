let socket = new WebSocket("ws://127.0.0.1:8000");

socket.addEventListener('open', (event) => {
    socket.send(JSON.stringify({event: "Connection"}));
});

socket.addEventListener('close', (event) => {
    console.log("disconnected")
})

socket.addEventListener("message", (event) => {
    let data = event.data;
    // data = data.output
    console.log(data)
})


export { socket }