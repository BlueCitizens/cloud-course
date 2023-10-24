<template>
  <div>
    <video id="videoPlayer" controls></video>
  </div>
</template>

<script>
import dashjs from 'dashjs'

export default {
  name: 'VodPlayer',
  created() {

  },
  mounted() {
  },
  methods: {
    init(val) {
      let url = val
      let player = dashjs.MediaPlayer().create()
      player.initialize(document.querySelector('#videoPlayer'), url, false)
    }
  }
}
</script>

<style scoped>
video {
  width: 1000px;
  height: 600px;
}
</style>
