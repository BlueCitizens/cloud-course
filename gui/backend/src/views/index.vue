<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="40">
      <el-col :span="16">
        <el-carousel height="250px" type="card">
          <el-carousel-item v-for="item in 3" :key="item">
            <h3 class="small">轮播图测试{{ item }}，你好NUIST</h3>
            <img
              src="https://www.nuist.edu.cn/_upload/article/images/49/0f/2b85a7794289a04dd4c290337adf/beb058d0-c8e5-4d37-b9ef-fe4c267f5497.jpg"
              class="image" alt="">
          </el-carousel-item>
        </el-carousel>
      </el-col>
      <panel-group @handleSetLineChartData="handleSetLineChartData"/>
    </el-row>
    <el-row>
      <el-table
        :data="tableData"
        height="350"
        border
        style="width: 100%">
        <el-table-column
          prop="date"
          label="公告"
          width="1200">
        </el-table-column>
        <el-table-column
          prop="name"
          label="发布">
        </el-table-column>
        <el-table-column
          label="操作">
          <el-button size="small">详情</el-button>
        </el-table-column>
      </el-table>
    </el-row>
<!--    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <el-col :xs="24" :sm="24" :lg="24">
        <line-chart v-if="lineChartData.expectedData!=undefined" :chart-data="lineChartData"/>
      </el-col>
    </el-row>
    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <Log/>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="16">
        <div class="chart-wrapper">
          <pie-chart :spider-data="spiderData" v-if="spiderData.length!=0"/>
        </div>
      </el-col>
    </el-row>-->
    <el-dialog
      title="创建作业"
      :visible.sync="dialogVisible"
      width="40%"
      :before-close="handleClose">
      <el-form label-width="80px">
        <el-form-item label="作业名称">
          <el-input v-model="workName"></el-input>
        </el-form-item>
        <el-form-item label="截止时间">
          <el-col :span="11">
            <el-date-picker type="date" placeholder="选择日期" style="width: 100%;"></el-date-picker>
          </el-col>
          <el-col class="line" :span="0.5"><i class="el-icon-minus"></i></el-col>
          <el-col :span="11">
            <el-time-picker placeholder="选择时间" style="width: 100%;"></el-time-picker>
          </el-col>
        </el-form-item>
        <el-form-item label="允许提交">
          <el-switch v-model="value"></el-switch>
        </el-form-item>
        <el-form-item label="命名正则">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
import PanelGroup from './dashboard/PanelGroup'
import LineChart from './dashboard/LineChart'
import PieChart from './dashboard/PieChart'
import { listLineChartData, listSpiderData } from '@/api/dashboard'
import Log from '@/views/dashboard/Log'

var lineChartDataAll = {
  note: {
    expectedData: [],
    actualData: [],
    axisData: []
  },
  book: {
    expectedData: [],
    actualData: [],
    axisData: []
  },
  visitor: {
    expectedData: [],
    actualData: [],
    axisData: []
  },
  blog: {
    expectedData: [],
    actualData: [],
    axisData: []
  }
}

export default {
  name: 'Index',
  components: {
    PanelGroup,
    Log,
    LineChart,
    PieChart
  },
  data() {
    return {
      value: true,
      workName: '',
      dialogVisible: false,
      carouselData: [{
        date: '2021-05-03',
        name: 'admin',
        address: '上海市普陀区金沙江路 1518 弄'
      }],
      tableData: [{
        date: '2021-05-03',
        name: 'admin',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2021-05-02',
        name: 'admin',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2021-05-04',
        name: 'admin',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2021-05-01',
        name: 'admin',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2021-05-08',
        name: 'admin',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2021-05-06',
        name: 'admin',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2021-05-07',
        name: 'admin',
        address: '上海市普陀区金沙江路 1518 弄'
      }],
      lineChartData: {},
      spiderData: []
    }
  },
  created() {
    this.handleSetLineChartData('visitor')
    this.getSpiderData()
  },
  methods: {
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {
        })
    },
    getSpiderData() {
      listSpiderData().then(response => {
        this.spiderData = response.data
      })
    },
    handleSetLineChartData(type) {
      if (lineChartDataAll[type].axisData.length == 0) {
        listLineChartData(type).then(response => {
          this.lineChartData = response.data
          lineChartDataAll[type] = response.data
        })
      } else {
        this.lineChartData = lineChartDataAll[type]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }

}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
