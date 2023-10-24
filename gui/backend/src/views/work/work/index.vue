<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="作业标题">
        <el-input v-model="queryParams.roleName" placeholder="请输入作业标题" clearable size="small" style="width: 240px"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="作业状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="截止时间">
        <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="18">
        <div>
          <el-radio-group v-model="checkboxGroup1">
            <el-radio-button v-for="opt in options" :label="opt" :key="opt">{{ opt }}</el-radio-button>
          </el-radio-group>
        </div>
      </el-col>
      <el-col :span="6">
        <el-button icon="el-icon-time" type="info" @click="openHistoryDialog">查看提交历史</el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column label="作业名" prop="workName" align="center"/>
      <el-table-column label="课程名" prop="courseName" align="center"/>
      <el-table-column label="截止时间" align="center" prop="deadline">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.deadline) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" type="success">正常</el-tag>
          <el-tag v-else-if="scope.row.status === 1" type="warning">冻结</el-tag>
          <el-tag v-else-if="scope.row.status === 2" type="danger">截止</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-if="scope.row.status === 0" slot-scope="scope">
          <!--          <el-button type="text" size="normal" icon="el-icon-upload">
                      <router-link :to="'blog/edit/'+scope.row.id">提交</router-link>
                    </el-button>-->
          <el-popover
            placement="top-start"
            title=""
            width=""
            trigger="click"
            content="">
            <el-upload
              class="upload-demo"
              ref="upload"
              drag
              multiple
              :limit="1"
              :auto-upload="true"
              :action="fileUploadApi + '?workId=' + scope.row.workId"
              :headers="headers"
              :on-preview="handlePreview"
              :on-remove="handleRemove">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb
                <!--                <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传</el-button>-->
              </div>
            </el-upload>
            <el-button slot="reference" round>提交</el-button>
          </el-popover>
          <!--          <el-popover :ref="scope.row.id" placement="top" width="220">
                      <p>从云端删除已上传的文件吗？</p>
                      <div style="text-align: right; margin: 0">
                        &lt;!&ndash;              <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消
                                      </el-button>&ndash;&gt;
                        <el-button :loading="delLoading" type="primary" size="mini" @click="handleSubDelete(scope.row.id)">确定
                        </el-button>
                      </div>
                      <el-button slot="reference" type="text" icon="el-icon-delete" size="normal">删除
                      </el-button>
                    </el-popover>-->
          <!-- 好耶 是新的删除组件 https://www.jianshu.com/p/37474cf51f89
                   https://blog.csdn.net/dadsfasfadf/article/details/107020246-->
          <el-popconfirm
            title="确定要撤回（删除）云端文件吗？"
            @onConfirm="handleFileDelete(scope.row.workId)"
            confirm-button-text="好的"
            cancel-button-text="不了"
          >
            <el-button style="margin-left: 5px" slot="reference" round>撤回</el-button>
          </el-popconfirm>
          <!--          <el-button slot="reference" icon="el-icon-time" circle></el-button>-->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
                @pagination="init"/>

    <el-dialog title="提交历史" :visible.sync="dialogTableVisible">
      <el-table :data="gridData">
        <el-table-column property="fileName" label="文件名" width="150"></el-table-column>
        <el-table-column property="workName" label="任务名"></el-table-column>
        <el-table-column property="courseName" label="课程名"></el-table-column>
        <el-table-column property="time" label="时间" width="200"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { listBlog, delBlog, changeBlogSupport, changeBlogComment, getBlog } from '@/api/blog/blog'
import initData from '@/mixins/initData'
import { deleteWorkFile, getHistory, uploadWorkFile } from '@/api/work/work'
import request from '@/utils/request'
import LocalStorageUpload from './../../tool/storage/local/LocalStorageUpload'
import { getToken } from '@/utils/auth'

const workOptions = ['已提交', '未提交', '全部', '过期']
export default {
  mixins: [initData],
  components: {
    LocalStorageUpload
  },
  data() {
    return {
      fileUploadApi: process.env.VUE_APP_BASE_API + '/work/work/po',
      headers: { 'Authorization': 'Bearer ' + getToken() },
      form: {
        id: '1',
        workId: ''
      },
      fileList: [],
      gridData: [],
      dialogTableVisible: false,
      checkboxGroup1: ['上海'],
      checkboxGroup2: ['上海'],
      checkboxGroup3: ['上海'],
      checkboxGroup4: ['上海'],
      options: workOptions,
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
      this.base = '/work/work'
      this.modelName = '作业'
      return true
    },
    submitUpload() {
      //this.$refs.upload.submit();
      uploadWorkFile()
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    //填充提交历史
    openHistoryDialog() {
      getHistory().then(response => {
        if (response.code !== 200) {
          this.msgError(response.msg)
          return
        }
        console.log(response.rows)
        this.gridData = response.rows
      })
      this.dialogTableVisible = true
    },
    handleFileDelete(id) {
      console.log(id)
      deleteWorkFile(id).then(response => {
        if (response.code !== 200) {
          this.msgError(response.msg)
        }else {
          this.msgSuccess("撤回成功")
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
