<template>
  <div class="createPost-container">
<!--<el-button @click="getVod">az</el-button>
<el-button @click="stopVod">az</el-button>-->
    <div>
      <video autoplay controls width="100%" height="500" id="videoElement"></video>
    </div>
    <el-input v-model="input" placeholder="请输入内容"></el-input>
    <el-button @click="createVideo">播放</el-button>
  </div>
</template>

<script>
  import Sticky from '@/components/Sticky' // 粘性header组件
  import {mavonEditor} from 'mavon-editor'
  import 'mavon-editor/dist/css/index.css'
  import {getVod,stopVod} from "@/api/live/live";
  import {getToken} from '@/utils/auth'
  import marked from 'marked'
  import ImagePicker from '@/components/ImagePicker'
  import MyLocalStorage from "../../../utils/MyLocalStorage"
  import {uploadImgToQiNiu} from "@/api/common"
  import flvjs from 'flv.js'

  export default {
    name: 'BlogDetail',
    components: {Sticky, mavonEditor, ImagePicker},
    props: {
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        input: '',
        imagePickerOpen: false,
        //上传图片的地址
        imagesUploadApi: '',
        //上传文件需要用到的token
        headers: {'Authorization': 'Bearer ' + getToken()},
        form: {
          headerImgType: 0,
          headerImg: '',
          weight: 1,
          tagTitleList: [],
          comment: true,
          support: false,
          original: true,
        },
        loading: false,
        tempRoute: {},
        categoryOptions: [],
        blogTagOptions: [],
        // 表单校验
        rules: {
          title: [
            {required: true, message: "文章标题不能为空", trigger: "blur"},
            {min: 3, max: 100, message: '长度在 3 到 100 个字符', trigger: 'change'}
          ],
          summary: [
            {required: true, message: "文章摘要不能为空", trigger: "blur"},
            {min: 10, max: 250, message: '长度在 10 到 250 个字符', trigger: 'change'}
          ],
          categoryId: [
            {required: true, message: "文章分类不能为空", trigger: "change"}
          ],
          comment: [
            {required: true, message: "评论不能为空", trigger: "change"}
          ],
          tag: [
            {required: true, message: "至少选择一个标签", trigger: "change"}
          ]
        }
      }
    },
    created() {
      var blogCache = MyLocalStorage.Cache.get("blogCache");
      var fetch = true;
      if (blogCache != undefined && blogCache.content != undefined && blogCache.content.length != 0) {
        this.$confirm('检测到本地存在未发布博客,是否继续编辑', '提示', {
          confirmButtonText: '继续编辑',
          cancelButtonText: '删除本地记录',
          type: 'warning'
        }).then(() => {
          this.msgSuccess("已成功恢复!");
          fetch = false;
          this.form = blogCache;
        }).catch(() => {
          this.msgInfo("已删除!");
          //删除缓存
          MyLocalStorage.Cache.remove("blogCache");
        });
      }
      if (fetch&&this.isEdit) {
          const id = this.$route.params && this.$route.params.id;
          this.fetchData(id);
      }
      this.tempRoute = Object.assign({}, this.$route);
      //设置category
      this.getCategory();
      this.imagesUploadApi = process.env.VUE_APP_BASE_API + "/tool/qiNiu";

      setInterval(() => {
        MyLocalStorage.Cache.put("blogCache", this.form);
      }, 10000)
    },
    methods: {
      createVideo() {
        if (flvjs.isSupported()) {
          var videoElement = document.getElementById('videoElement');
          var flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4', //你的url地址
            isLive:true
            //url: this.input //你的url地址
          });
          flvPlayer.attachMediaElement(videoElement);
          flvPlayer.load();
          flvPlayer.play();
        }
      },
      stopVod(){
        console.log("stop出去了");
        stopVod();
      },
      onImgSelect(url) {
        this.form.headerImg = url;
        if (this.form.headerImgType == 0) {
          this.form.headerImgType = 1;
        }
      },
      headerImgTypeChange() {
        if (this.form.headerImgType == 0) {
          this.form.headerImg = undefined;
        }
      },
      //上传文件成功回调方法
      handleUploadSuccess(res, file) {
        if (res.code == 200) {
          this.form.headerImg = res.data.url;
          //修改headerImgType
          if (this.form.headerImgType == 0) {
            this.form.headerImgType = 1;
          }
        } else {
          this.msgError("上传文件失败!" + res.message);
        }
      },
      //查询标签
      getRemoteTagList(query) {
        if (query !== '') {
          this.loading = true;
          setTimeout(() => {
            this.loading = false;
            listBlogTagList(query).then(response => {
                this.blogTagOptions = response.rows;
                this.loading = false;
              }
            );
          }, 200);
        } else {
          this.blogTagOptions = []
        }
      },
      //获取文章分类
      getCategory() {
        listCategory().then(response => {
            if (response.code == 200) {
              this.categoryOptions = response.rows;
            } else {
              this.msgError(response.msg);
            }
          }
        );
      },
      fetchData(id) {
        getBlog(id).then(response => {
          if (response.code != 200) {
            this.msgError(response.msg);
            return;
          }
          this.form = response.data;
        })
      },
      submitBlog() {
        this.form.htmlContent = marked(this.form.content);
        //删除缓存
        MyLocalStorage.Cache.remove("blogCache");
        this.$refs.form.validate(valid => {
          if (valid) {
            this.loading = true;
            this.form.status = true;
            let obj = JSON.parse(JSON.stringify(this.form));
            if (obj.id == undefined) {
              addBlog(obj).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("发布成功");
                  this.$store.dispatch('tagsView/delView', this.$route);
                  this.$router.push({path: '/blogManage/blog'})
                } else {
                  this.msgError(response.msg);
                }
                this.loading = false;
              }).catch(error => {
                this.loading = false;
              });
            } else {
              updateBlog(obj).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("发布成功");
                  this.$store.dispatch('tagsView/delView', this.$route);
                  this.$router.push({path: '/blogManage/blog'})
                } else {
                  this.msgError(response.msg);
                }
                this.loading = false;
              }).catch(error => {
                this.loading = false;
              });
            }
          }
        })
      },
      draftBlog() {
        this.form.htmlContent = marked(this.form.content);
        if (this.form.content.length === 0 || this.form.title.length === 0) {
          this.$message({
            message: '请填写必要的标题和内容',
            type: 'warning'
          });
          return
        }
        //删除缓存
        MyLocalStorage.Cache.remove("blogCache");
        let obj = JSON.parse(JSON.stringify(this.form));
        obj.status = false;
        if (obj.id == undefined) {
          addBlogDraft(obj).then(response => {
            if (response.code === 200) {
              this.msgSuccess("保存草稿成功");
            } else {
              this.msgError(response.msg);
            }
          });
        } else {
          updateBlogDraft(obj).then(response => {
            if (response.code === 200) {
              this.msgSuccess("保存草稿成功");
            } else {
              this.msgError(response.msg);
            }
          });
        }
      },
      handleEditorImgAdd(pos, $file) {
        // 第一步.将图片上传到服务器.
        var formdata = new FormData();
        formdata.append('file', $file);
        uploadImgToQiNiu(formdata).then((url) => {
          // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
          // $vm.$img2Url 详情见本页末尾
          $vm.$img2Url(pos, url);
        })
      },
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
