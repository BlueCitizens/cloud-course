<template>
  <blog-detail :is-edit="true"/>
</template>

<script>
  import BlogDetail from './PaperDetail'

  export default {
    name: 'EditBlog',
    components: {BlogDetail}
  }
</script>
