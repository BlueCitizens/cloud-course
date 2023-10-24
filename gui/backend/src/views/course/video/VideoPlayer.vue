<template>
  <div>
    <video autoplay controls width="100%" height="500" id="videoElement"></video>
  </div>
</template>

<script>
import flvjs from 'flv.js'

export default {
  name: 'VideoPlayer',

  created() {

  },
  methods:{
    createVideo() {
      if (flvjs.isSupported()) {
        var videoElement = document.getElementById('videoElement');
        var flvPlayer = flvjs.createPlayer({
          type: 'mp4',
          url: 'http://vjs.zencdn.net/v/oceans.mp4' //你的url地址
          //url: this.input //你的url地址
        });
        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
        flvPlayer.play();
      }
    },
  }
}
</script>

<style scoped>

</style>
