<template>
  <el-card style="margin-bottom:20px;" v-if="teacher!=null">
    <div slot="header" class="clearfix">
      <span>课程信息</span>
    </div>
    <el-col :span="12">
      <div class="card-box">
        <img src="https://img.imgdb.cn/item/5e8d961f504f4bcb04240544.png" class="avatar" alt="无图片">
      </div>
    </el-col>
    <el-col :span="12">
      <div class="user-education user-bio-section">
        <div class="user-bio-section-header">
          <el-icon class="el-icon-tickets"/>
          <span>教师信息</span>
        </div>
        <div class="user-bio-section-body">
          <ul class="list-group list-group-striped">
            <li class="list-group-item">
              <svg-icon icon-class="user"/>
              姓名
              <div class="pull-right">{{ teacher.userName }}</div>
            </li>
            <li class="list-group-item">
              <svg-icon icon-class="phone"/>
              手机号码
              <div class="pull-right">{{ teacher.phone }}</div>
            </li>
            <li class="list-group-item">
              <svg-icon icon-class="email"/>
              教师邮箱
              <div class="pull-right">{{ teacher.email }}</div>
            </li>
            <li class="list-group-item">
              <svg-icon icon-class="peoples"/>
              用户组
              <div class="pull-right">{{ teacher.roleGroup }}</div>
            </li>
          </ul>
        </div>
      </div>
    </el-col>
  </el-card>
</template>

<script>
  import PanThumb from "@/components/PanThumb"


  export default {
    components: {PanThumb},
    props: {
      teacher: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    computed: {
      avatar() {
        return require(`@/assets/avatar/${this.$store.state.user.avatar}`);
      }
    },
    data() {
      return {
        dialogVisible: false,
        page: {
          width: window.screen.width * 0.5,
          height: window.screen.height * 0.5
        }
      }
    },
    methods: {
      changeSuccess(avatar) {
        this.dialogVisible = false;
        this.msgSuccess("修改成功");
        this.teacher.avatar = avatar;
        this.$store.commit('SET_AVATAR', avatar)
      },
    }
  }
</script>

<style lang="scss" scoped>
  .box-center {
    margin: 0 auto;
    display: table;
  }

  .text-muted {
    color: #777;
  }

  .user-profile {

  .user-name {
    font-weight: bold;
  }

  .box-center {
    padding-top: 10px;
  }

  .user-role {
    padding-top: 10px;
    font-weight: 400;
    font-size: 14px;
  }

  .box-social {
    padding-top: 30px;

  .el-table {
    border-top: 1px solid #dfe6ec;
  }

  }
  .user-follow {
    padding-top: 20px;
  }

  }
  .user-bio {
    margin-top: 20px;
    color: #606266;

  span {
    padding-left: 4px;
  }

  .logo-wrapper {
    display: inline-block;
    margin: 10px 0;

  img {
    width: 1.4rem;
    display: inline-block;
    margin: 0 .6rem;
    cursor: pointer;

  &
  .unbind {
    -webkit-filter: grayscale(100%);
    -moz-filter: grayscale(100%);
    -o-filter: grayscale(100%);
    filter: grayscale(100%);
  }

  &
  .radius {
    border-radius: 50%;
  }

  }
  }
  .user-bio-section {
    font-size: 14px;
    padding: 15px 0;

  .user-bio-section-header {
    border-bottom: 1px solid #dfe6ec;
    padding-bottom: 10px;
    margin-bottom: 10px;
    font-weight: bold;
  }

  }
  }
</style>
