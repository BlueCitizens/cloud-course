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
          <el-switch style="margin-left: 10px" v-model="scope.row.status" active-color="#13ce66"
                     inactive-color="#ff4949" :active-value=0
                     :inactive-value=1>
          </el-switch>
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button slot="reference" @click="openHistoryDialog(scope.row)" round>
            下载
          </el-button>
          <!-- 好耶 是新的删除组件 https://www.jianshu.com/p/37474cf51f89
                   https://blog.csdn.net/dadsfasfadf/article/details/107020246-->
          <el-popconfirm :ref="scope.row.workId"
            title="确定要删除作业任务吗？（将一并删除作业文件）"
            @onConfirm="handleSubDelete(scope.row.workId)"
            confirm-button-text="好的"
            cancel-button-text="不了"
          >
            <el-button style="margin-left: 5px" slot="reference" round>删除</el-button>
          </el-popconfirm>
          <el-button style="margin-left: 5px" slot="reference" icon="el-icon-time" circle></el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
                @pagination="init"/>

    <el-dialog title="云端文件" :visible.sync="dialogTableVisible" :before-close="handleClose">
      <el-table
        ref="multipleTable"
        :data="fileList"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="fileName"
          label="文件名"
          width="200">
        </el-table-column>
        <el-table-column
          prop="userName"
          label="上传用户">
        </el-table-column>
        <el-table-column
          prop="address"
          label="地址">
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px">
        <el-button @click="handleDownload()">下载选中</el-button>
        <el-button @click="handleDownloadAll(29)">全部下载</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { changeBlogComment, changeBlogSupport } from '@/api/blog/blog'
import initData from '@/mixins/initData'
import { downloadAllFileByWork, getFileByWork, uploadWorkFile } from '@/api/work/work'
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
      multipleSelection: [],//作业下载多选框
      fileList: [],
      downloadParams: {
        workId: '',
        workName: '',
        courseName: ''
      },
      downloadParamsReset: {
        workId: '',
        workName: '',
        courseName: ''
      },
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
    handleClose(){
      this.downloadParams = this.downloadParamsReset
      this.dialogTableVisible = false
    },
    //填充提交历史
    openHistoryDialog(row) {
      getFileByWork(row.workId).then(response => {
        /*if (response.code !== 200) {
          this.msgError(response.msg)
          return
        }*/
        this.downloadParams.workId = row.workId
        this.downloadParams.workName = row.workName
        this.downloadParams.courseName = row.courseName
        this.fileList = response.rows
      })
      this.dialogTableVisible = true
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
/*    handleSelectionChange(val) {
      this.multipleSelection = val
    },*/
    handleDownload() {

    },
    handleDownloadAll() {
      downloadAllFileByWork(this.downloadParams.workId).then(response => {
        const blob = new Blob([response])
        const fileName = this.downloadParams.courseName + '-' + this.downloadParams.workName + '.zip'
        if ('download' in document.createElement('a')) { // 非IE下载
          const elink = document.createElement('a')
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href) // 释放URL 对象
          document.body.removeChild(elink)
        } else { // IE10+下载
          navigator.msSaveBlob(blob, fileName)
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
