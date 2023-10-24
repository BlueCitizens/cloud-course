<template>
  <div class="createPost-container">
    <div>
      <!--      <video autoplay controls width="100%" height="500" id="videoElement"></video>-->
      <VodPlayer ref="vodPlayer" id="videoElement"></VodPlayer>
      <!--      <video-player :options="videoOptions"/>-->
    </div>
    <!--    <el-button @click="createVideo">播放</el-button>-->
  </div>
</template>

<script>
import Sticky from '@/components/Sticky' // 粘性header组件
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import { getVod, stopVod } from '@/api/vod/vod'
import { getToken } from '@/utils/auth'
import ImagePicker from '@/components/ImagePicker'
import MyLocalStorage from '../../../utils/MyLocalStorage'
import VodPlayer from '@/components/Player/VodPlayer'
import { getLive } from '@/api/live/live'

export default {
  name: 'BlogDetail',
  components: { Sticky, mavonEditor, ImagePicker, VodPlayer },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      vod: {},
      //上传文件需要用到的token
      headers: { 'Authorization': 'Bearer ' + getToken() },
      form: {
        headerImgType: 0,
        headerImg: '',
        weight: 1,
        tagTitleList: [],
        comment: true,
        support: false,
        original: true
      },
      loading: false,
      tempRoute: {},
      categoryOptions: [],
      blogTagOptions: [],
      // 表单校验
      rules: {
        title: [
          { required: true, message: '文章标题不能为空', trigger: 'blur' },
          { min: 3, max: 100, message: '长度在 3 到 100 个字符', trigger: 'change' }
        ],
        summary: [
          { required: true, message: '文章摘要不能为空', trigger: 'blur' },
          { min: 10, max: 250, message: '长度在 10 到 250 个字符', trigger: 'change' }
        ],
        categoryId: [
          { required: true, message: '文章分类不能为空', trigger: 'change' }
        ],
        comment: [
          { required: true, message: '评论不能为空', trigger: 'change' }
        ],
        tag: [
          { required: true, message: '至少选择一个标签', trigger: 'change' }
        ]
      }
    }
  },
  mounted() {
    this.getVod(this.$route.params.id)
  },
  created() {
  },
  methods: {
    /*    createVideo() {
          var videoElement = document.getElementById('videoElement')
          var url = 'https://bitmovin.com/mpeg-dash-hls-examples-sample-streams/'
          var context = new Dash.di.DashContext()
          var player = new MediaPlayer(context)
          player.startup()
          player.attachView(videoElement)
          player.attachSource(url)
        },*/
    getVod(id) {
      getVod(id).then(response => {
        this.msgSuccess('点播加载成功')
        this.vod = response.data
        this.$nextTick(() => this.$refs.vodPlayer.init(this.vod.url))

      })
    },
    stopVod() {
      console.log('stop出去了')
      stopVod()
    }
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose()
    }
  }
}
</script>

<style lang="scss">
@import "~@/assets/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 30px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }

    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }

}

.article-textarea /deep/ {

  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }

}

.el-tag + .el-tag {
  margin-left: 10px;
}


.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 224px;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 224px;
  line-height: 224px;
  text-align: center;
}

.avatar {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
