<template>
  <div class="app-container">
    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column label="课程名" prop="courseName" align="center"/>
      <!--      <el-table-column label="rtmp地址" prop="rtmp" align="center">
                      <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.deadline) }}</span>
                      </template>
            </el-table-column>-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <!-- 好耶 是新的删除组件 https://www.jianshu.com/p/37474cf51f89
                   https://blog.csdn.net/dadsfasfadf/article/details/107020246-->
          <el-button type="warning" @click="handleAddWork(scope.row)" plain>新建作业</el-button>
          <el-button type="success" @click="" plain>上传资料</el-button>
          <el-button type="primary" @click="handleAddVideo(scope.row)" plain>上传视频</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="title"
      :visible.sync="open"
      width="40%">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="上传课程">
          <el-input v-model="form.courseName" disabled></el-input>
        </el-form-item>
        <el-form-item label="作业名称">
          <el-input v-model="form.workName"></el-input>
        </el-form-item>
        <el-form-item label="截止时间">
          <el-date-picker
            v-model="form.deadline"
            type="datetime"
            placeholder="选择日期时间"
            align="right"
            style="width: 100%;"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
            :picker-options="pickerOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="允许提交">
          <el-switch v-model="form.status" active-color="#ff4949" inactive-color="#13ce66" active-value="1"
                     inactive-value="0">
          </el-switch>
        </el-form-item>
        <el-form-item label="命名正则">
          <el-input v-model="form.namingRule"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="cancel">取 消</el-button>
    <el-button type="primary" @click="submitForm">确 定</el-button>
  </span>
    </el-dialog>

    <el-dialog
      :title="title"
      :visible.sync="videoFormVisible"
      width="60%">
      <el-form ref="form" :model="videoForm" label-width="80px">
        <el-form-item label="上传课程">
          <el-input v-model="videoForm.courseName" disabled></el-input>
        </el-form-item>
        <el-form-item label="视频名称">
          <el-input v-model="videoForm.videoName"></el-input>
        </el-form-item>
        <el-form-item label="上传文件">
          <el-upload
            ref="upload"
            class="upload-demo"
            drag
            :auto-upload="false"
            :action="fileUploadApi + '?courseId=' + videoForm.courseId"
            :headers="headers"
            :data="this.videoForm"
            multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将视频拖到此处，或<em>点击选取</em></div>
          </el-upload>
        </el-form-item>
        <el-form-item label="简介">
          <el-input type="textarea" v-model="videoForm.summary"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="cancel">取 消</el-button>
    <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
  </span>
    </el-dialog>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
                @pagination="init"/>
  </div>
</template>

<script>
import { listBlog, delBlog, changeBlogSupport, changeBlogComment } from '@/api/blog/blog'
import { addWork } from '@/api/work/work'
import initData from '@/mixins/initData'
import { getToken } from '@/utils/auth'

export default {
  mixins: [initData],
  data() {
    return {
      fileUploadApi: process.env.VUE_APP_BASE_API + '/vod/vod/po',
      headers: { 'Authorization': 'Bearer ' + getToken() },
      videoFormVisible: false,
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '明天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() + 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周后',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      },
      form: {
        courseId: '',
        courseName: '',
        workName: '',
        deadline: '',
        status: '',
        namingRule: '',
        remark: ''
      },
      videoForm: {
        courseId: '',
        courseName: '',
        videoName: '',
        sourcePath: '',
        summary: ''
      },
      videoFormReset: {
        courseId: '',
        courseName: '',
        workName: '',
        summary: ''
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
      this.modelName = '作业'
      return true
    },
    submitUpload() {
      this.$refs.upload.submit();
    },
    /** 新增作业按钮操作 */
    handleAddWork(row) {
      this.reset()
      this.title = '新建' + this.modelName
      this.form = this.formReset
      this.form.courseId = row.courseId
      this.form.courseName = row.courseName
      this.open = true
    },
    /** 新增作业按钮操作 */
    handleAddVideo(row) {
      this.reset()
      this.title = '新建视频'
      this.videoForm = this.videoFormReset
      this.videoForm.courseId = row.courseId
      this.videoForm.courseName = row.courseName
      this.videoFormVisible = true
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          addWork(this.form).then(response => {
            if (response.code === 200) {
              this.msgSuccess('新增成功')
              this.open = false
              this.init()
            } else {
              this.msgError(response.msg)
            }
          })
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
