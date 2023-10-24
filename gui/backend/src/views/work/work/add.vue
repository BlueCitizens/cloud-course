<template>
  <blog-detail :is-edit="false"/>
</template>

<script>
  import BlogDetail from './PaperDetail'

  export default {
    name: 'AddBlog',
    components: {BlogDetail}
  }
</script>
