<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column label="课程名" prop="courseName" align="center"/>
      <el-table-column label="推流码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.status ? parsePushCode(scope.row) : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="" label="流密钥" prop="key" align="center">

      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 1" type="success" @click="handleStopLive(scope.row)">关闭直播</el-button>
          <el-button v-else type="success" @click="handleStartLive(scope.row)" plain>开启直播</el-button>
          <el-button style="margin-left: 5px" slot="reference" icon="el-icon-refresh" size="small" @click="handleResetKey(scope.row)" circle></el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
                @pagination="init"/>
  </div>
</template>

<script>
import { listBlog, delBlog, changeBlogSupport, changeBlogComment } from '@/api/blog/blog'
import { addWork, getHistory } from '@/api/work/work'
import initData from '@/mixins/initData'
import { resetKey, startLive, stopLive } from '@/api/live/live'

export default {
  mixins: [initData],
  data() {
    return {
      workParams: {
        courseId: '',
        workName: '',
        date1: '',
        date2: '',
        value: true,
        namingRule: '',
        remark: ''
      },
      // 状态数据字典
      statusOptions: [],
      //推荐数据字典
      supportOptions: [],
      // 查询参数
      queryParams: {
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
    parsePushCode(row) {
      return row.rtmp + '?uid=' + row.updateBy + '&key=' + row.key
    },
    /** 开启直播按钮操作 */
    handleStartLive(row) {
      startLive(row.courseId).then(response => {
        if (response.rows !== null) {
          this.msgSuccess('直播已开启，请推流')
          this.init()
        } else {
          this.msgError('直播开启失败，请联系管理员')
        }
      })
    },
    handleStopLive(row) {
      stopLive(row.courseId).then(response => {
        if (response.rows !== null) {
          this.msgSuccess('直播已关闭，请停止推流')
          this.init()
          this.list = response.rows
        } else {
          this.msgError('直播关闭失败，请联系管理员')
        }
      })
    },
    handleResetKey(row) {
      resetKey(row.courseId).then(response => {
        if (response.rows !== null) {
          this.msgSuccess('推流码已重置，请重新获取')
          this.init()
          this.list = response.rows
        } else {
          this.msgError('重置失败，请联系管理员')
        }
      })
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
