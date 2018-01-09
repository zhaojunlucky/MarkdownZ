<template>
    <div>
         <textarea ref="textarea"></textarea>
    </div>
</template>

<script>
    require('codemirror/mode/gfm/gfm');
    require('codemirror/addon/selection/active-line')
    require('codemirror/lib/codemirror.css');
    const CodeMirror = require('codemirror');
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
                  mode: 'gfm',
                  lineNumbers: true,
                  lineWrapping: true,
                  styleActiveLine: true,
                  indentUnit: 4,
                  indentWithTabs: true,
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
  .cm-tab {
         background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAMCAYAAAAkuj5RAAAAAXNSR0IArs4c6QAAAGFJREFUSMft1LsRQFAQheHPowAKoACx3IgEKtaEHujDjORSgWTH/ZOdnZOcM/sgk/kFFWY0qV8foQwS4MKBCS3qR6ixBJvElOobYAtivseIE120FaowJPN75GMu8j/LfMwNjh4HUpwg4LUAAAAASUVORK5CYII=);
         background-position: right;
         background-repeat: no-repeat;
      }
</style>