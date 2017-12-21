<template>
  <markdown-editor></markdown-editor>
</template>

<script>
  import MarkdownEditor from './markdown-editor/MarkdownEditor'
  import SystemInformation from './LandingPage/SystemInformation'
  export default {
    name: 'landing-page',
    components: { MarkdownEditor, SystemInformation },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

body {
  font-family: sans-serif;
  font-size: 16px;
  height: 100%;
  margin: 0;
  box-sizing: border-box;
}

</style>
