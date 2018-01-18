<template>
    <div>
         <textarea ref="textarea"></textarea>
    </div>
</template>

<script>
    require('codemirror/lib/codemirror.css');
    require('codemirror/addon/fold/foldgutter.css')

    import _CodeMirror from 'codemirror/lib/codemirror';
    import 'codemirror/addon/selection/active-line'
    import 'codemirror/addon/mode/overlay'
    import 'codemirror/mode/xml/xml'
    import 'codemirror/mode/markdown/markdown';
    import 'codemirror/mode/gfm/gfm';
    import 'codemirror/mode/javascript/javascript'
    import 'codemirror/mode/css/css'
    import 'codemirror/mode/htmlmixed/htmlmixed'
    import 'codemirror/mode/clike/clike'
    import 'codemirror/mode/meta'
    import 'codemirror/addon/fold/foldcode'
    import 'codemirror/addon/fold/foldgutter'
    import 'codemirror/addon/fold/brace-fold'
    import 'codemirror/addon/fold/xml-fold'
    import 'codemirror/addon/fold/indent-fold'
    import 'codemirror/addon/fold/markdown-fold'
    import 'codemirror/addon/fold/comment-fold'
    import 'codemirror/addon/edit/closebrackets'
    import 'codemirror/addon/edit/closetag'

    const CodeMirror = window.CodeMirror || _CodeMirror;
    console.log("CodeMirror");

    function mergeOptions(target, defaultOptions, options) {
      for(const key in defaultOptions){
        target[key] = defaultOptions[key];
      }
      for(const key in options){
        if(!defaultOptions.hasOwnProperty(key)){
          target[key] = options[key];
        }
      }
      return target;
    }
    export default {
        name: "codemirror",
        data() {
            return {
                content: '',
                cm: null,
                globalOptions: {
                  mode: "gfm",
                  tokenTypeOverrides: {
                    emoji: "emoji"
                  },
                  lineNumbers: true,
                  lineWrapping: true,
                  styleActiveLine: true,
                  indentUnit: 4,
                  indentWithTabs: false,
                  foldGutter: true,
                  autoCloseBrackets: true,
                  autoCloseTags: true,
                  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                },
            }
        },
        props: {
            value: {
                type: String,
                default: () => '',
            },
            readonly: {
                type: Boolean,
                default: () => false,
            },
            options: {
                type: Object,
                default: () => this.globalOptions,
            },
        },
        watch: {
            options: {
                deep: true,
                handler(options, oldOptions) {
                  for (const key in options) {
                    if(!this.globalOptions.hasOwnProperty(key)){
                      this.cm.setOption(key, options[key]);
                    }
                  }
                },
            },
            readonly(val, oldVal) {
                this.cm.setOption("readOnly", val);
            },
            value(val, oldVal){
              let cmVal = this.cm.getValue();
              if(val !== cmVal){
                const scrollInfo = this.cm.getScrollInfo();
                this.cm.setValue(val);
                this.content = val;
                this.cm.scrollTo(scrollInfo.left, scrollInfo.top);
              }
            },
        },
        mounted() {
            this.initialize()
        },
        methods: {
            initialize(){
                this.cm = CodeMirror.fromTextArea(this.$refs.textarea, mergeOptions({}, this.globalOptions, this.options));
                this.cm.setValue(this.value);
                this.cm.on('change', cm => {
                  this.content = cm.getValue();
                  this.$emit('input', this.content);
                });
                const events = [
                    'scroll',
                    'focus',
                    'blur',
                    'contextmenu',
                ];
                const onEdEvents = {}
                for (let i = 0; i < events.length; i++) {
                  if (typeof events[i] === 'string' && onEdEvents[events[i]] === undefined) {
                    (event => {
                      onEdEvents[event] = null
                      this.cm.on(event, (a, b, c) => {
                        this.$emit(event, a, b, c)
                      })
                    })(events[i]);
                  }
                }
            },
        },
        refresh() {
            this.cm.refresh()
        },

    }
</script>

<style>
  .cm-header { font-family: arial; }
  .cm-header-1 { font-size: 150%; }
  .cm-header-2 { font-size: 130%; }
  .cm-header-3 { font-size: 120%; }
  .cm-header-4 { font-size: 110%; }
  .cm-header-5 { font-size: 100%; }
  .cm-header-6 { font-size: 90%; }
  .cm-strong { font-size: 140%; }
</style>