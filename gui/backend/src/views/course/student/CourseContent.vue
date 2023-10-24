<template>
  <div class="app-container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane>
        <span slot="label">概览</span>
        <course-card :teacher="teacher"></course-card>
      </el-tab-pane>
<!--      <el-tab-pane label="视频" name="first">
        <el-row gutter="15">
          <el-col :span="18">
            <VideoPlayer ref="vod"></VideoPlayer>
          </el-col>
          <el-col :span="6">
            <el-aside style="background-color: rgb(238, 241, 246)">
              <el-menu :default-openeds="['1', '3']">
                <el-menu-item index="1-3"  @click.native="click">测试视频1</el-menu-item>
                <el-menu-item index="1-3">测试视频2</el-menu-item>
                <el-menu-item index="1-3">测试视频3</el-menu-item>
              </el-menu>
            </el-aside>
          </el-col>
        </el-row>
      </el-tab-pane>-->
      <el-tab-pane label="文件夹" name="second">
        <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
          <el-table-column type="selection" align="center"/>
          <el-table-column label="标题" prop="title" :show-overflow-tooltip="true"/>
          <el-table-column label="分类" prop="category.title">
            <template slot-scope="scope">
              <el-popover trigger="hover" placement="right">
                <p>名称: {{ scope.row.category.title }}</p>
                <p>描述: {{ scope.row.category.description }}</p>
                <p>推荐:
                  <el-switch
                    v-model="scope.row.category.support"
                    active-color="#13ce66"
                    disabled
                    inactive-color="#ff4949">
                  </el-switch>
                </p>
                <p>
                  创建时间:<span>{{ parseTime(scope.row.category.createTime) }}</span>
                </p>
                <div slot="reference" class="name-wrapper">
                  <el-tag effect="plain">{{ scope.row.category.title }}</el-tag>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="摘要" prop="summary" :show-overflow-tooltip="true"/>
          <el-table-column label="封面" prop="headerImg">
            <template slot-scope="scope">
              <el-image
                style="width: 30px; height: 30px"
                :src="scope.row.headerImg"
                :preview-src-list="[scope.row.headerImg]">
              </el-image>
            </template>
          </el-table-column>
          <el-table-column label="评论" align="center">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.comment"
                         @change="handleCommentChange(scope.row)"/>
            </template>
          </el-table-column>
          <el-table-column label="推荐" align="center">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.support" @change="handleSupportChange(scope.row)" active-color="#13ce66"
                         inactive-color="#ff4949"/>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status ===true">发布</el-tag>
              <el-tag v-else type="warning">草稿</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="权重" prop="weight" align="center">
            <template slot-scope="scope">
              <el-rate v-model="scope.row.weight" :max="5" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" disabled
                       :low-threshold="1" :high-threshold="5" style="display:inline-block"/>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="评论" align="center">
            <template slot-scope="scope">
              <el-popover
                placement="left"
                width="600"
                trigger="click">
                <el-table v-loading="loading" :data="scope.row.commentList" style="width: 100%;">
                  <el-table-column label="昵称" align="center" prop="nickName"/>
                  <el-table-column label="主机" align="center" prop="ip" :show-overflow-tooltip="true"/>
                  <el-table-column label="操作地点" align="center" prop="location"/>
                  <el-table-column label="显示" align="center">
                    <template slot-scope="scope">
                      <el-switch v-model="scope.row.display" active-color="#13ce66" inactive-color="#ff4949"
                                 disabled/>
                    </template>
                  </el-table-column>
                  <el-table-column label="内容" align="center" prop="content" :show-overflow-tooltip="true"/>
                  <el-table-column label="点赞" align="center" prop="good"/>
                  <el-table-column label="踩" align="center" prop="bad"/>
                  <el-table-column label="评论日期" align="center" prop="createTime" width="180">
                    <template slot-scope="scope">
                      <span>{{ parseTime(scope.row.createTime) }}</span>
                    </template>
                  </el-table-column>
                </el-table>
                <el-button size="mini" type="text" icon="el-icon-tickets" slot="reference">共
                  {{ scope.row.commentList.length }}
                  条数据
                </el-button>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button type="text" size="mini" icon="el-icon-edit">
                <router-link :to="'blog/edit/'+scope.row.id">编辑</router-link>
              </el-button>
              <el-popover :ref="scope.row.id" placement="top" width="180">
                <p>确定删除本条数据吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消
                  </el-button>
                  <el-button :loading="delLoading" type="primary" size="mini" @click="handleSubDelete(scope.row.id)">
                    确定
                  </el-button>
                </div>
                <el-button slot="reference" type="text" icon="el-icon-delete" size="mini">删除
                </el-button>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Sticky from '@/components/Sticky' // 粘性header组件
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import { listBlogTagList, getBlog, addBlog, updateBlog, addBlogDraft, updateBlogDraft } from '@/api/blog/blog'
import { listCategory } from '@/api/blog/category'
import { getToken } from '@/utils/auth'
import marked from 'marked'
import ImagePicker from '@/components/ImagePicker'
import MyLocalStorage from '../../../utils/MyLocalStorage'
import { uploadImgToQiNiu } from '@/api/common'
import VideoPlayer from '@/views/course/video/VideoPlayer'
import CourseCard from '@/views/course/components/CourseCard'
import { getUserProfile } from '@/api/system/user'
import { getTeacherProfile } from '@/api/course/course'

export default {
  name: 'CourseContent',
  components: { CourseCard, VideoPlayer, Sticky, mavonEditor, ImagePicker },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      teacher: {},
      imagePickerOpen: false,
      //上传图片的地址
      imagesUploadApi: '',
      //上传文件需要用到的token
      headers: { 'Authorization': 'Bearer ' + getToken() },
      form: {
        headerImgType: 0,
        headerImg: 'https://img.imgdb.cn/item/5e8d961f504f4bcb04240544.png',
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
  created() {
    this.getUser(this.$route.params.id)
  },
  methods: {
    getUser(id) {
      getTeacherProfile(id).then(response => {
        this.teacher = response.data;
        this.teacher.roleGroup = response.roleGroup;
      });
    },
    click(){
      this.$refs.vod.createVideo()
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

.video-cell {
  width: 90px;
  height: 50px;
  display: block;
}
</style>
