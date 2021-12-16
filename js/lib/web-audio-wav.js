(function(t){var s=Math.min,r=Math.max;var n=function(t,s,n){var r=n.length;for(var e=0;e<r;++e)t.setUint8(s+e,n.charCodeAt(e))};var e=function(e,n){this.sampleRate=e;this.numChannels=n;this.numSamples=0;this.dataViews=[]};e.prototype.encode=function(o){var e=o[0].length,i=this.numChannels,f=new DataView(new ArrayBuffer(e*i*2)),u=0;for(var n=0;n<e;++n)for(var t=0;t<i;++t){var a=o[t][n]*32767;f.setInt16(u,a<0?r(a,-32768):s(a,32767),true);u+=2}this.dataViews.push(f);this.numSamples+=e};e.prototype.finish=function(r){var t=this.numChannels*this.numSamples*2,e=new DataView(new ArrayBuffer(44));n(e,0,"RIFF");e.setUint32(4,36+t,true);n(e,8,"WAVE");n(e,12,"fmt ");e.setUint32(16,16,true);e.setUint16(20,1,true);e.setUint16(22,this.numChannels,true);e.setUint32(24,this.sampleRate,true);e.setUint32(28,this.sampleRate*4,true);e.setUint16(32,this.numChannels*2,true);e.setUint16(34,16,true);n(e,36,"data");e.setUint32(40,t,true);this.dataViews.unshift(e);var s=new Blob(this.dataViews,{type:"audio/wav"});this.cleanup();return s};e.prototype.cancel=e.prototype.cleanup=function(){delete this.dataViews};t.WavAudioEncoder=e})(self);var sampleRate=44100,numChannels=2,options=undefined,maxBuffers=undefined,encoder=undefined,recBuffers=undefined,bufferCount=0;function error(e){self.postMessage({command:"error",message:"wav: "+e})}function init(e){sampleRate=e.config.sampleRate;numChannels=e.config.numChannels;options=e.options}function setOptions(e){if(encoder||recBuffers)error("cannot set options during recording");else options=e}function start(e){maxBuffers=Math.ceil(options.timeLimit*sampleRate/e);if(options.encodeAfterRecord)recBuffers=[];else encoder=new WavAudioEncoder(sampleRate,numChannels)}function record(e){if(bufferCount++<maxBuffers)if(encoder)encoder.encode(e);else recBuffers.push(e);else self.postMessage({command:"timeout"})}function postProgress(e){self.postMessage({command:"progress",progress:e})}function finish(){if(recBuffers){postProgress(0);encoder=new WavAudioEncoder(sampleRate,numChannels);var e=Date.now()+options.progressInterval;while(recBuffers.length>0){encoder.encode(recBuffers.shift());var n=Date.now();if(n>e){postProgress((bufferCount-recBuffers.length)/bufferCount);e=n+options.progressInterval}}postProgress(1)}self.postMessage({command:"complete",blob:encoder.finish(options.wav.mimeType)});cleanup()}function cleanup(){encoder=recBuffers=undefined;bufferCount=0}self.onmessage=function(n){var e=n.data;switch(e.command){case"init":init(e);break;case"options":setOptions(e.options);break;case"start":start(e.bufferSize);break;case"record":record(e.buffer);break;case"finish":finish();break;case"cancel":cleanup()}};self.postMessage({command:"loaded"});
