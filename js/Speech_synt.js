function speak(data) {
    const audioContext = new AudioContext();
    var bloburl = URL.createObjectURL(data);

    window.audio = new Audio();
    window.audio.src = bloburl;
    window.audio.controls = true;
    window.audio.autoplay = true;
    document.body.appendChild(window.audio)
    console.log(window.audio)

    console.log(bloburl);

}

export default speak;