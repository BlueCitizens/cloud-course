<template>
  <el-col class="panel-group" :span="8">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :lg="12" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('visitor')">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="job" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              即将截止
            </div>
            <count-to :start-val="0" :end-val="visitorCount" :duration="2600" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('blog')">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="nested" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              待交作业
            </div>
            <count-to :start-val="0" :end-val="blogCount" :duration="3000" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :lg="12" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('book')">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="online" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              正在直播
            </div>
            <count-to :start-val="0" :end-val="bookCount" :duration="3200" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('note')">
          <div class="card-panel-icon-wrapper icon-shopping">
            <svg-icon icon-class="education" class-name="card-panel-icon"/>
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              所有课程
            </div>
            <count-to :start-val="0" :end-val="noteCount" :duration="3600" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-col>
</template>

<script>
import CountTo from 'vue-count-to'
import { listPanelGroup } from '@/api/dashboard'

export default {
  components: {
    CountTo
  },
  data() {
    return {
      bookCount: 0,
      blogCount: 4,
      visitorCount: 1,
      noteCount: 5
    }
  },
  created() {
    this.getPanelGroup()
  },
  methods: {
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    },
    //获取数据
    getPanelGroup() {
      listPanelGroup().then(response => {
        this.bookCount = response.data.bookCount
        this.blogCount = response.data.blogCount
        this.visitorCount = response.data.visitorCount
        this.noteCount = response.data.noteCount
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &
    :hover {

      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }

    }

    .icon-people {
      color: #f4516c;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #34bfa3;
    }

    .icon-shopping {
      color: #66ccff
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }

    }
  }
}

@media (max-width: 550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }

}
</style>
