<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="(o, index) in list" :key="o" style="margin-bottom: 15px">
        <router-link :to="'course/course/'+o.courseId" class="link-type">
          <el-card shadow="hover" :body-style="{ padding: '0px' }">
            <img height="180px"
                 src="https://www.nuist.edu.cn/_upload/article/images/49/0f/2b85a7794289a04dd4c290337adf/beb058d0-c8e5-4d37-b9ef-fe4c267f5497.jpg"
                 class="image" alt="">
            <div style="padding: 14px;">
              <span style="font-size: 20px">{{ o.courseName }}</span>
              <div style="margin-top: 15px" class="bottom clearfix">
                <div>任课教师：{{
                    o.teacherName ? o.teacherName : '未知'
                  }}
                </div>
              </div>
            </div>
          </el-card>
        </router-link>
      </el-col>
    </el-row>
<!--    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column label="课程名" prop="courseName" align="center"/>
      <el-table-column label="教师" align="center" prop="teacherName">
        &lt;!&ndash;        <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.deadline) }}</span>
                </template>&ndash;&gt;
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          &lt;!&ndash; 好耶 是新的删除组件 https://www.jianshu.com/p/37474cf51f89
                   https://blog.csdn.net/dadsfasfadf/article/details/107020246&ndash;&gt;
          <router-link to="course/course/1" class="link-type">
            <el-button type="primary">查看详情</el-button>
          </router-link>
        </template>
      </el-table-column>

    </el-table>-->

<!--    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
                @pagination="init"/>-->
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
      this.base = '/course/course'
      this.modelName = '博客'
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
