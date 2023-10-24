<template>
  <div class="app-container">

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column label="标题" prop="title" align="center"/>
      <el-table-column label="摘要" prop="summary" align="center"/>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" type="danger">异常</el-tag>
          <el-tag v-else-if="scope.row.status === 1" type="warning">转码中</el-tag>
          <el-tag v-else-if="scope.row.status === 2" type="success">已发布</el-tag>
        </template>
      </el-table-column>
<!--      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button slot="reference" @click="openHistoryDialog(scope.row)" round>
            下载
          </el-button>
          &lt;!&ndash; 好耶 是新的删除组件 https://www.jianshu.com/p/37474cf51f89
                   https://blog.csdn.net/dadsfasfadf/article/details/107020246&ndash;&gt;
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
      </el-table-column>-->
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
import LocalStorageUpload from '../tool/storage/local/LocalStorageUpload'
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
      this.base = '/vod/vod'
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
    handleClose() {
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
