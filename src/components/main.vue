<template>
  <section class="animated-bg"></section>
  <section class="w-full h-full fixed polka-dots-bg"></section>

  <!-- camera view -->
  <div class="h-32 xl:w-56 sm:w-36 absolute top-10 right-2 hover:h-3/5 hover:w-3/5  z-20 duration-700 container rounded-xl">
    <video class="input_video absolute w-full h-full  rounded-full"></video>
  </div>

  <!-- spotify playlist -->
  <div class="h-40 xl:w-56 sm:w-36 right-2 top-48 absolute hover:h-2/5 hover:w-3/5 duration-700 z-20 rounded-xl grid grid-cols-10 grid-rows-1 group space-x-2">
    <div class="space-y-2 hidden group-hover:flex group-hover:flex-col group-hover:items-center group-hover:justify-center rounded backdrop-blur-sm bg-slate-600 bg-opacity-25 col-span-2 text-white">

      <button @click="changePlaylist" class="no-underline h-12 w-20 bg-blue-500 hover:bg-white hover:text-black rounded-md" plkey=0>Staged</button>
      <button @click="changePlaylist" class="no-underline h-12 w-20 bg-blue-500 hover:bg-white hover:text-black rounded-md" plkey=1>Bollywood</button>
      <button @click="changePlaylist" class="no-underline h-12 w-20 bg-blue-500 hover:bg-white hover:text-black rounded-md" plkey=2>Lofi</button>
    </div>

    <spotify :plnum="state.currPlaylist"/> 
  </div>

  <!-- I was too lazy and tired, so i copied this work and made some adjustments but im not a plagiarist so therefore -->
  <!-- Find original here: https://codepen.io/fesuydev/pen/EZzxJK -->
  <!-- arc reactor -->
  <div class="absolute h-52 w-56 right-0 bottom-2 group z-20">
    <svg viewbox="0 -100 210 400" class="h-full w-full">
      <defs>
        <filter id="light-circle">
          <feGaussianBlur result="blurred" in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>
      <!-- circle outer -->
      <circle cx="105" cy="105" r="100" style="fill: transparent; stroke-width: 2; stroke-dasharray: 50, 5" class="rotating-circle-norm duration-300" id="recording">
      </circle>
      <circle cx="105" cy="105" r="95" style="fill: transparent;stroke: #64E6EF;stroke-width: 1.5; stroke-dasharray: 0"></circle>
      <!-- circle dash cool :D -->
      <circle cx="105" cy="105" r="80" style="fill: transparent; stroke: #B4F6FB; stroke-width: 10; stroke-dasharray: 1,3" class="mid-circle">
      </circle>

      <circle cx="105" cy="105" r="60" style="fill: transparent; stroke: #B4F6FB; stroke-width: 1.5; stroke-dasharray: 50, 10" class="inner-circle">
      </circle>

      <!-- circle inner -->
      <!-- change color on speech synthesis -->
      <circle cx="105" cy="105" r="50" style="fill: transparent; stroke-width: 15;filter: url(#light-circle);" class="duration-100  stroke-zinc-500 group-hover:stroke-sky-500 " id="indicator"></circle>

      <circle cx="105" cy="105" r="40" style="fill: transparent; stroke: #64E6EF; stroke-width: 2"></circle>
      triangle primary
      <path d="M 105 120 L 130 95 L 80 95 z" style=" stroke-width:5; z-index: 0;" id="triangle" class="stroke-sky-300 fill-sky-300"></path>
    </svg>
  </div>
  

  <!-- Everything else -->
  <div id="bg" class="z-10 grid grid-cols-2 grid-rows-1 h-full w-full absolute">
    <h2 id="Name" style="font-family: 'Courier New', Courier, monospace;">S.T.E.L.L.A</h2>
    <div class="h-full w-10/12 p-10 col-span-2">
      <widgets></widgets>
    </div>
  </div>


</template>

<script>
import './widgets/dayspedia';
// import { Camera } from "@mediapipe/camera_utils";
import spotifyVue from './spotify.vue';

// import './widgets/face_recognition';
import { onMounted, reactive } from '@vue/runtime-core'
import widgetsVue from './widgets.vue';
export default {
  components: {
    widgets: widgetsVue,
    spotify: spotifyVue
  },
  setup() {
    const state = reactive({
      currPlaylist: 0
    })
    
    onMounted(() => {
      let clock = document.createElement('script');
      clock.setAttribute('src', '//w.24timezones.com/l.js');
      document.head.appendChild(clock);


      // const videoElement = document.getElementsByClassName('input_video')[0];
      // const camera = new Camera(videoElement, {
      // onFrame: async () => {
      // },
      // width: 1280,
      // height: 720
      // });
      // camera.start();
    });

    const changePlaylist = (event) => {
      state.currPlaylist = event.target.getAttribute("plkey");
      console.log(event.target.getAttribute("plkey"), state.currPlaylist)
    }


    return {
      state,
      changePlaylist
    }
  },
}
</script>

<style scoped>

#bg {
  width: 100%;
  height: 100%;
  position: absolute;
}

body{
  margin: 0%;
  user-select: none;
}


#Name {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  padding-left: 1rem;
  padding-top: 1rem;
  color: #B4F6FB;
  font-size: x-large;
}

.animated-bg {
  background: linear-gradient(227deg, #002c47, #000000);
  background-size: 400% 400%;

  -webkit-animation: AnimationName 24s ease infinite;
  -moz-animation: AnimationName 24s ease infinite;
  animation: AnimationName 24s ease infinite;

  width: 100%;
  height: 100%;
  position: absolute;
}

@-webkit-keyframes AnimationName {
  0%{background-position:0% 91%}
  50%{background-position:100% 10%}
  100%{background-position:0% 91%}
}
@-moz-keyframes AnimationName {
  0%{background-position:0% 91%}
  50%{background-position:100% 10%}
  100%{background-position:0% 91%}
}
@keyframes AnimationName {
  0%{background-position:0% 91%}
  50%{background-position:100% 10%}
  100%{background-position:0% 91%}
}

/* animated circles */
.rotating-circle-norm {
  animation: rotate-cool 10s cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
  stroke: #B4F6FB;
}

@keyframes rotate-cool {
  0% {stroke-dashoffset: 0%;}
  50%{stroke-dashoffset: 100%;}
  80%{stroke-dashoffset: -100%;}
  100%{stroke-dashoffset: 0%;}
}

.mid-circle {
  animation: rotate-cool-mid 10s linear infinite;
  background-color: black;
}

@keyframes rotate-cool-mid {
  0% {stroke-dashoffset: 0%;}
  100%{stroke-dashoffset: 100%;}
}

.inner-circle {
  animation: rotate-cool-inner 15s cubic-bezier(0.77, 0, 0.175, 1) infinite;
  background-color: black;
}

@keyframes rotate-cool-inner {
  0% {stroke-dashoffset: 0%;}
  50%{stroke-dashoffset: 100%;}
  80%{stroke-dashoffset: -100%;}
  100%{stroke-dashoffset: 0%;}
}

#triangle {
  animation: blink-triangle 5s ease-in-out infinite;
}

@keyframes blink-triangle {
  0% {opacity: 50%;}
  50%{opacity: 100%;}
  100%{opacity: 50%;}
}

.centered {
  right: 50%;
  top: 50%;
  transform: translate(50%, -50%);
}

/* .polka-dots-bg {
  background-image: radial-gradient(
    rgba(158, 158, 158, 0.2) 1px,
    transparent 5px
  );
  background-size: 4rem 4rem;
} */

</style>