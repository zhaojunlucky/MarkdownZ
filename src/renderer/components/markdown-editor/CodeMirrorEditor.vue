<template>
    <div>
        <textarea ref="textarea" ></textarea>
    </div>
</template>

<script>
    import 'codemirror/mode/gfm/gfm.js'
    require('codemirror/lib/codemirror.css')
    const CodeMirror = require('codemirror');
     export default {
        name: 'codemirroreditor',
        data() {
          return {
            content: '',
            codemirror: null,
            cminstance: null,
          }
        },
        methods:{
            initialize(){
                this.codemirror = CodeMirror.fromTextArea(this.$refs.textarea,  {
                                 name:"gfm",
                                  lineNumbers: true,
                                  theme: "default",
                                  writable: true,
                                });
                this.cminstance = this.codemirror
                this.cminstance.setValue("1werw\nerer\nddf\n");
            },
        },
        mounted() {
          this.initialize()
        },
    }
</script>