<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="(o, index) in list" :key="o" style="margin-bottom: 15px">
        <router-link :to="o.status?'live/liveRoom/'+o.courseId:''" class="link-type">
          <el-card shadow="hover" :body-style="{ padding: '0px' }">
            <img height="200px" :style="o.status?'':'filter: brightness(40%)'"
                 src="https://www.nuist.edu.cn/_upload/article/images/49/0f/2b85a7794289a04dd4c290337adf/beb058d0-c8e5-4d37-b9ef-fe4c267f5497.jpg"
                 class="image" alt="">
            <div style="padding: 14px;">
              <span style="font-size: 20px">{{ o.title }}</span>
              <div style="margin-top: 15px" class="bottom clearfix">
                <div><i :class="o.status?'el-icon-s-data':'el-icon-time'" :style="o.status?'color: deepskyblue':'color: red'"></i>&nbsp;{{o.status?'直播中':'上次直播：'+o.updateTime}}</div>
              </div>
            </div>
          </el-card>
        </router-link>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { listBlog, delBlog, changeBlogSupport, changeBlogComment } from '@/api/blog/blog'
import initData from '@/mixins/initData'

export default {
  mixins: [initData],
  data() {
    return {
      // 状态数据字典
      statusOptions: [],
      //推荐数据字典
      supportOptions: [],
      // 查询参数
      queryParams: {
        workName: undefined,
        title: undefined,
        summary: undefined,
        status: undefined,
        comment: undefined
      },
      // 表单校验
      rules: {
        roleName: [
          { required: true, message: '博客名称不能为空', trigger: 'blur' }
        ],
        roleKey: [
          { required: true, message: '权限字符不能为空', trigger: 'blur' }
        ],
        roleSort: [
          { required: true, message: '博客顺序不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.$nextTick(() => {
      this.init()
      this.getDicts('bg_blog_status').then(response => {
        this.statusOptions = response.data
      })
      this.getDicts('bg_blog_support').then(response => {
        this.supportOptions = response.data
      })
    })
  },
  methods: {
    beforeInit() {
      this.base = '/live/live'
      this.modelName = '直播'
      return true
    },
    // 博客状态修改
    handleCommentChange(row) {
      let text = row.comment ? '开启评论' : '关闭评论'
      this.$confirm('确认要"' + text + '""' + row.title + '"博客吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return changeBlogComment(row.id, row.comment)
      }).then((response) => {
        if (response.code == 200) {
          this.msgSuccess(text + '成功')
        } else {
          this.msgError(text + '失败')
        }
      }).catch(function() {
        this.msgError(text + '失败')
      })
    },
    handleSupportChange(row) {
      let text = row.support ? '推荐' : '取消推荐'
      this.$confirm('确认要' + text + '"' + row.title + '"博客吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return changeBlogSupport(row.id, row.support)
      }).then((response) => {
        if (response.code == 200) {
          this.msgSuccess(text + '成功')
        } else {
          this.msgError(text + '失败')
        }
      }).catch(function() {
        row.support = row.support === false ? true : false
      })
    },
    testAlert() {
      console.log('nmsl')
    }
  }
}
</script>
<style lang="scss" scoped>
.circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
}
</style>
