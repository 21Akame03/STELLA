import { Camera } from "@mediapipe/camera_utils";

const videoElement = document.getElementsByClassName('input_video')[0];


const camera = new Camera(videoElement, {
onFrame: async () => {
    await faceMesh.send({image: videoElement});
},
width: 1280,
height: 720
});
camera.start();