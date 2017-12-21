<template>
  <div class="root">
    <aside class="side-bar">
      <div class="toolbar" id="test">
        <button @click="addNote" :title="notes.length + ' note(s) already'"><i class="material-icons">add</i> Add note</button>
      </div>
      <div class="notes">
        <div class="note" v-for="note of sortedNotes" :class="{selected: note === selectedNote}" @click="selectNote(note)" @contextmenu="openNoteContextMenu(note)">{{note.title}}</div>
      </div>
    </aside>
    <!-- vmd ==> vue markdown -->
    <div class="vmd" ref="vmd">
      <div class="vmd-header" ref="vmdHeader">
        <div class="vmd-btn-group">
          <button type="button" class="vmd-btn vmd-btn-default" @click="addStrong" title="Bold (Ctrl + B)"><i class="vf-bold"></i></button>
          <button type="button" class="vmd-btn vmd-btn-default" @click="addItalic" title="Italic (Ctrl + I)"><i class="vf-italic"></i></button>
          <button type="button" class="vmd-btn vmd-btn-default" @click="addHeading" title="Head 3 (Ctrl + 3)"><i class="vf-header"></i></button>
          <button type="button" class="vmd-btn vmd-btn-default" @click="addStrikethrough" title="Strikethrough (Ctrl + D)"><i class="vf-strikethrough"></i>
          </button>
        </div>
        <div class="vmd-btn-group">
          <button type="button" class="vmd-btn vmd-btn-default" @click="addUl" title="Unordered list (Ctrl + U)"><i class="vf-list-ul"></i></button>
          <button type="button" class="vmd-btn vmd-btn-default" @click="addOl" title="Ordered list (Ctrl + O)"><i class="vf-list-ol"></i></button>
          <button type="button" class="vmd-btn vmd-btn-default" @click="addTable" title="Table (Ctrl + T)"><i class="vf-table"></i></button>
        </div>
        <div class="vmd-btn-group">
          <button type="button" class="vmd-btn vmd-btn-default" @click="addLink" title="Hyperlink (Ctrl + L)"><i class="vf-chain"></i></button>
          <button type="button" class="vmd-btn vmd-btn-default" @click="addImage" title="Image (Ctrl + G)"><i class="vf-image"></i></button>
        </div>
        <div class="vmd-btn-group">
          <button type="button" class="vmd-btn vmd-btn-default" @click="addCode" title="Code (Ctrl + K)"><i class="vf-code"></i></button>
          <button type="button" class="vmd-btn vmd-btn-default" @click="addQuote" title="Quote (Ctrl + Q)"><i class="vf-quote-left"></i></button>
        </div>
        <div class="vmd-btn-group">
          <button type="button" title="Preview" class="vmd-btn vmd-btn-default" @click="preview"><i :class="previewClass"></i></button>
          <button type="button" title="HTML" class="vmd-btn vmd-btn-default" @click="sanitizeHtml">HTML</button>
        </div>
      </div>
      <div class="vmd-body" ref="vmdBody">
        <template v-if="selectedNote">
          <textarea class="vmd-editor" :style="vmdEditorStyle" ref="vmdEditor" v-model="selectedNote.content"
                    title="This is a editor."
                    @input="vmdInputting($event.target.value)"
                    @focus="vmdActive"
                    @blur="vmdInactive"
                    @keydown.tab.prevent="addTab"
                    @keydown.ctrl.b.prevent="addStrong"
                    @keydown.ctrl.i.prevent="addItalic"
                    @keydown.ctrl.d.prevent="addStrikethrough"
                    @keydown.ctrl.51.prevent="addHeading"
                    @keydown.ctrl.r.prevent="addLine"
                    @keydown.ctrl.q.prevent="addQuote"
                    @keydown.ctrl.k.prevent="addCode"
                    @keydown.ctrl.l.prevent="addLink"
                    @keydown.ctrl.g.prevent="addImage"
                    @keydown.ctrl.t.prevent="addTable"
                    @keydown.ctrl.u.prevent="addUl"
                    @keydown.ctrl.o.prevent="addOl"
                    @keydown.enter.prevent="addEnter"
                    @keydown.ctrl.a.prevent="selectAll"
                    @keydown.ctrl.c.prevent="copyAll"
          ></textarea>
          <div class="vmd-preview markdown-body" ref="vmdPreview" v-show="isPreview" v-html="compiledMarkdown"></div>
        </template>
      </div>
      <div class="vmd-footer" ref="vmdFooter">
        <a type="button" class="vmd-btn vmd-btn-default vmd-btn-borderless">Markdown</a>
        <span type="button" class="txt">Created: {{ selectedNote.created | date }}</span>
        <a type="button" class="txt">Words: {{ wordsCount }}</a>
        <a type="button" class="txt">Characters: {{ charactersCount }}</a>
      </div>
    </div>
  </div>

</template>

<script>
  // 引入依赖库
  import marked from 'marked'
  import hljs from 'highlight.js'

  import './styles/markdown.css'
  import './styles/iconfont.css'

  import locale from './locale/en'

  const electron = require('electron');
  const remote = electron.remote;
  const Menu = remote.Menu;
  const MenuItem = remote.MenuItem;

  function confirm(title, message){
    var dialog = remote.dialog;
    var choice = dialog.showMessageBox(
            remote.getCurrentWindow(),
            {
                type: 'question',
                buttons: ['Yes', 'No'],
                title: title,
                message: message
            });
    return choice == 0;
  }
  // 配置marked环境
  marked.setOptions({
    highlight: function (code) {
      return hljs ? hljs.highlightAuto(code).value : code
    }
  });

  /**
   * 定义__debounce函数
   *
   * @param fn 最终将执行的方法
   * @param delay 延时
   */
  function __debounce(fn, delay) {
    let timer = null;
    return function () {
      let context = this;
      let args = arguments;
      // 清除 timer
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    }
  }

  export default {
    name: 'VueEditor',
    props: {
      value: {
        type: String,
        default: null
      }
    },
    data() {
      return {
        vmd: null,
        vmdBody: null,
        vmdHeader: null,
        vmdFooter: null,
        vmdEditor: null,
        vmdPreview: null,
        vmdInput: '---\nlayout: post\ntitle: "<title>"\ndate: <date>\ncategories: cate/["cat1", "cat2"]\n---\n\n',
        lang: 'en',
        isPreview: true,
        isSanitize: true,
        notes: JSON.parse(localStorage.getItem('notes')) || [],
        selectedId: localStorage.getItem('selected-id') || null,
        noteContextMenu: null,
        contextMenuOpNote: null,
      }
    },
    created(){
      let that = this;
      this.noteContextMenu = new Menu()
      this.noteContextMenu.append(new MenuItem({ label: 'Rename', click: function(){
          console.log(that.contextMenuOpNote)
        }}))
      this.noteContextMenu.append(new MenuItem({ type: 'separator' }))
      this.noteContextMenu.append(new MenuItem({ label: 'Delete', click: function(){
          if(confirm("Confirm", "Are you sure to delete '" + that.contextMenuOpNote.title + "' ?")){
            const index = that.notes.indexOf(that.contextMenuOpNote)
            if (index !== -1) {
              that.notes.splice(index, 1);
            }
            if(that.selectNote && that.contextMenuOpNote.id === that.selectNote.id){
              that.selectNote = null;
            }

          }
          that.contextMenuOpNote = null;
        }}))
    },
    computed: {
      /**
       * 编译成markdown文档
       */
      compiledMarkdown() {
        return marked(this.selectedNote.content, {sanitize: this.isSanitize})
      },
      vmdEditorStyle() {
        return this.isPreview ? null : {
          width: '100%'
        }
      },
      previewClass() {
        return this.isPreview ? 'vf-eye-slash' : 'vf-eye'
      },
      selectedNote () {
        // We return the matching note with selectedId
        return this.notes.find(note => note.id === this.selectedId)
      },
      sortedNotes () {
        return this.notes.slice().sort((a, b) => a.created - b.created)
      },
      linesCount () {
        if (this.selectedNote) {
          // Count the number of new line characters
          return this.selectedNote.content.split(/\r\n|\r|\n/).length
        }
      },

      wordsCount () {
        if (this.selectedNote) {
          var s = this.selectedNote.content
          // Turn new line cahracters into white-spaces
          s = s.replace(/\n/g, ' ')
          // Exclude start and end white-spaces
          s = s.replace(/(^\s*)|(\s*$)/gi, '')
          // Turn 2 or more duplicate white-spaces into 1
          s = s.replace(/[ ]{2,}/gi, ' ')
          // Return the number of spaces
          return s.split(' ').length
        }
      },

      charactersCount () {
        if (this.selectedNote) {
          return this.selectedNote.content.split('').length
        }
      },
    },
    mounted() {
      // 缓存DOM组件
      this.__saveDom();
      // 重置组件大小
      this.__resize();
      // 添加滚动监听事件
      window.addEventListener('resize', this.vmdResize, false);
      this.vmdEditor.addEventListener('scroll', this.vmdSyncScrolling, false);
      this.vmdPreview.addEventListener('scroll', this.vmdSyncScrolling, false);
      // 自动获取焦点
      this.vmdEditor.focus()
    },
    beforeDestroy() {
      // 移除滚动监听事件
      this.saveNotes()
      window.removeEventListener('resize', this.vmdResize, false);
      this.vmdEditor.removeEventListener('scroll', this.vmdSyncScrolling, false);
      this.vmdPreview.removeEventListener('scroll', this.vmdSyncScrolling, false);

      // 移除DOM组件
      this.__removeDom();
    },
    methods: {
      addNote(){
        const time = Date.now()
        // Default new note
        const note = {
          id: String(time),
          title: 'New note ' + (this.notes.length + 1),
          content: this.vmdInput,
          created: time,
          favorite: false,
        }
        // Add
        this.notes.push(note)
        // Select
        this.selectNote(note)
      },
      vmdActive() {
        this.$refs.vmd.classList.add('active')
      },
      vmdInactive() {
        this.$refs.vmd.classList.remove('active')
      },
      sanitizeHtml() {
        this.isSanitize = !this.isSanitize;
      },
      /**
       * 同步滚动
       */
      vmdSyncScrolling(e) {
        e = e || window.event;
        if (this.vmdEditor === e.target) {
          this.vmdPreview.scrollTop = e.target.scrollTop
        } else {
          this.vmdEditor.scrollTop = e.target.scrollTop
        }
      },
      vmdResize: __debounce(function (e) {
        this.__resize()
      }, 100),
      /**
       * 监听用户输入
       */
      vmdInputting: __debounce(function (value) {
        this.vmdEditor.value = value;
        this.__updateInput()
      }, 100),
      preview() {
        this.isPreview = !this.isPreview
      },
      selectNote (note) {
        // This will update the 'selectedNote' computed property
        this.selectedId = note.id
      },
      openNoteContextMenu(note){
        this.contextMenuOpNote = note;
        this.noteContextMenu.popup(remote.getCurrentWindow());
      },
      saveNotes () {
        // Don't forget to stringify to JSON before storing
        localStorage.setItem('notes', JSON.stringify(this.notes))
        console.log('Notes saved!', new Date())
      },
      /**
       * 扩展 Tab 快捷键
       */
      selectAll(){
        this.__setSelection(0, this.vmdEditor.value.length)
      },
      copyAll(){
        this.vmdEditor.select();
        document.execCommand("Copy");
      },
      addTab() {
        this.__updateInput(this.__localize('tabText'));
      },
      addEnter(e) {
        if(e.shiftKey){
          this.__updateInput('\n');
        }else if(!e.isComposing){
          let selectionStart = this.vmdEditor.selectionStart;
          let cursor = selectionStart;
          let content = this.vmdEditor.value;
          let pattern = /^(> ).*|^(\d+ ).*|^(- ).*/
          let lineStart = "";
          let i = selectionStart - 1;
          for(; i >= 0; --i){
            if(content[i] === '\n'){
              break;
            }
            lineStart = content[i] + lineStart
          }
          let needDel = content[selectionStart] === '\n' || content.length === selectionStart
          let delPattern = /^(\d+)\. $|^- $|^> $/
          if(needDel && delPattern.test(lineStart)){
            if(i === -1){
              i = 0;
            }
            this.vmdEditor.value = content.substr(0,i) + "\n\n" + content.substr(selectionStart)
            cursor += lineStart.length;
            console.log(cursor)
            this.__setSelection(cursor, cursor);
          }else{
            let replaceText = '\n'
            let orderedListPattern = /^(\d+)\. .*/
            if(lineStart){
              if(lineStart.startsWith("> ")){
                replaceText = "\n> "
              }else if(lineStart.startsWith("- ")){
                replaceText = "\n- "
              }else if(orderedListPattern.test(lineStart)){
                let num = parseInt(lineStart.match(orderedListPattern));
                replaceText = "\n" + (num + 1) + ". "
              }
            }
            this.__replaceSelection(replaceText);
          }
        }
      },
      addStrong() {
        let chunk, cursor, selected = this.__getSelection(), content = this.__getContent();

        chunk = selected.text;

        // 替换选择内容并将光标设置到chunk内容前
        if (content.substr(selected.start - 2, 2) === '**'
          && content.substr(selected.end, 2) === '**') {
          this.__setSelection(selected.start - 2, selected.end + 2);
          this.__replaceSelection(chunk);
          cursor = selected.start - 2;
        } else {
          this.__replaceSelection('**' + chunk + '**');
          cursor = selected.start + 2;
        }

        // 设置选择内容
        this.__setSelection(cursor, cursor + chunk.length);
        this.__updateInput()
      },
      addItalic() {
        let chunk, cursor, selected = this.__getSelection(), content = this.__getContent();

        chunk = selected.text;

        // 替换选择内容并将光标设置到chunk内容前
        if (content.substr(selected.start - 1, 1) === '_'
          && content.substr(selected.end, 1) === '_') {
          this.__setSelection(selected.start - 1, selected.end + 1);
          this.__replaceSelection(chunk);
          cursor = selected.start - 1;
        } else {
          this.__replaceSelection('_' + chunk + '_');
          cursor = selected.start + 1;
        }

        // 设置选择内容
        this.__setSelection(cursor, cursor + chunk.length);
        this.__updateInput()
      },
      addStrikethrough() {
        let chunk, cursor, selected = this.__getSelection(), content = this.__getContent();

        chunk = selected.text;

        // 替换选择内容并将光标设置到chunk内容前
        if (content.substr(selected.start - 2, 2) === '~~'
          && content.substr(selected.end, 2) === '~~') {
          this.__setSelection(selected.start - 2, selected.end + 2);
          this.__replaceSelection(chunk);
          cursor = selected.start - 2;
        } else {
          this.__replaceSelection('~~' + chunk + '~~');
          cursor = selected.start + 2;
        }

        // 设置选择内容
        this.__setSelection(cursor, cursor + chunk.length);
        this.__updateInput()
      },
      addHeading() {
        let chunk, cursor, selected = this.__getSelection(), content = this.__getContent(), pointer, prevChar;

        chunk = selected.text;

        // 替换选择内容并将光标设置到chunk内容前
        if ((pointer = 4, content.substr(selected.start - pointer, pointer) === '### ')
          || (pointer = 3, content.substr(selected.start - pointer, pointer) === '###')) {
          this.__setSelection(selected.start - pointer, selected.end);
          this.__replaceSelection(chunk);
          cursor = selected.start - pointer;
        } else if (selected.start > 0 && (prevChar = content.substr(selected.start - 1, 1), !!prevChar && prevChar !== '\n')) {
          this.__replaceSelection('\n\n### ' + chunk);
          cursor = selected.start + 6;
        } else {
          // 元素前的空字符串
          this.__replaceSelection('### ' + chunk);
          cursor = selected.start + 4;
        }

        // 设置选择内容
        this.__setSelection(cursor, cursor + chunk.length);
        this.__updateInput()
      },
      addLine() {
        this.__updateInput('\n' + this.__localize('lineText'));
      },
      addQuote() {
        let chunk, cursor, selected = this.__getSelection();


          if (selected.text.indexOf('\n') < 0) {
            chunk = selected.text;

            this.__replaceSelection('> ' + chunk);

            // 设置光标
            cursor = selected.start + 2;
          } else {
            let list = [];

            list = selected.text.split('\n');
            chunk = list[0];

            for (let i in list){
              list[i] = '> ' + list[i]
            }

            this.__replaceSelection( list.join('\n'));

            // 设置光标
            cursor = selected.start + 4;
          }
        

        // 设置选择内容
        //this.__setSelection(cursor, cursor + chunk.length);
        this.__updateInput()
      },
      addCode() {
        let chunk, cursor, selected = this.__getSelection(), content = this.__getContent();

        chunk = selected.text;

        // 替换选择内容并将光标设置到chunk内容前
        if (content.substr(selected.start - 4, 4) === '```\n'
          && content.substr(selected.end, 4) === '\n```') {
          this.__setSelection(selected.start - 4, selected.end + 4);
          this.__replaceSelection(chunk);
          cursor = selected.start - 4;
        } else if (content.substr(selected.start - 1, 1) === '`'
          && content.substr(selected.end, 1) === '`') {
          this.__setSelection(selected.start - 1, selected.end + 1);
          this.__replaceSelection(chunk);
          cursor = selected.start - 1;
        } else if (content.indexOf('\n') > -1) {
          this.__replaceSelection('```\n' + chunk + '\n```');
          cursor = selected.start + 4;
        } else {
          this.__replaceSelection('`' + chunk + '`');
          cursor = selected.start + 1;
        }

        // 设置选择内容
        this.__setSelection(cursor, cursor + chunk.length);
        this.__updateInput()
      },
      addLink() {
        let chunk, cursor, selected = this.__getSelection(), link;

        chunk = selected.text;

        link = prompt(this.__localize('linkTip'), 'http://');

        let urlRegex = new RegExp('^((http|https)://|(mailto:)|(//))[a-z0-9]', 'i');
        if (link !== null && link !== '' && link !== 'http://' && urlRegex.test(link)) {
          let div = document.createElement('div');
          div.appendChild(document.createTextNode(link));
          let sanitizedLink = div.innerHTML;

          // 替换选择内容并将光标设置到chunk内容前
          this.__replaceSelection('[' + chunk + '](' + sanitizedLink + ')');
          cursor = selected.start + 1;

          // 设置选择内容
          this.__setSelection(cursor, cursor + chunk.length);
        }
        this.__updateInput()
      },
      addImage() {
        let chunk, cursor, selected = this.__getSelection(), link;

        chunk = selected.text;

        link = prompt(this.__localize('imageTip'), 'http://');

        let urlRegex = new RegExp('^((http|https)://|(//))[a-z0-9]', 'i');
        if (link !== null && link !== '' && link !== 'http://' && urlRegex.test(link)) {
          let div = document.createElement('div');
          div.appendChild(document.createTextNode(link));
          let sanitizedLink = div.innerHTML;

          // 替换选择内容并将光标设置到chunk内容前
          this.__replaceSelection('\n![' + chunk + '](' + sanitizedLink + ' "' + this.__localize('imageTitle') + '")');
          cursor = selected.start + 3;

          // 设置选择内容
          this.__setSelection(cursor, cursor + chunk.length);
        }
        this.__updateInput()
      },
      addTable() {
        let chunk, cursor, selected = this.__getSelection();

        if (selected.length === 0) {
          // 提供额外的内容
          chunk = this.__localize('tableText');
        } else {
          chunk = selected.text;
        }

        // 替换选择内容并将光标设置到chunk内容前
        this.__replaceSelection(chunk);
        cursor = selected.start;

        // 设置选择内容
        this.__setSelection(cursor, cursor + chunk.length);
        this.__updateInput()
      },
      addUl() {
        let chunk, cursor, selected = this.__getSelection();

        if (selected.text.indexOf('\n') < 0) {
          chunk = selected.text;

          this.__replaceSelection('- ' + chunk);

          // 设置光标
          cursor = selected.start + 2;
        } else {
          let list = [];

          list = selected.text.split('\n');
          chunk = list[0];

          for(let i in list){
            list[i] = '- ' + list[i]
          }

          this.__replaceSelection(list.join('\n'));

          // 设置光标
          cursor = selected.start + 4;
        }
        

        // 设置选择内容
        this.__setSelection(cursor, cursor + chunk.length);
        this.__updateInput()
      },
      addOl() {
        let chunk, cursor, selected = this.__getSelection();

        if (selected.text.indexOf('\n') < 0) {
          chunk = selected.text;

          this.__replaceSelection('1. ' + chunk);

          // 设置光标
          cursor = selected.start + 3;
        } else {
          let list = [];

          list = selected.text.split('\n');
          chunk = list[0];

          for(let i = 0; i < list.length; ++i){
            list[i] = (i+1) + '. ' + list[i]
          }


          this.__replaceSelection(list.join('\n'));

          // 设置光标
          cursor = selected.start + 5;
        }

        // 设置选择内容
        this.__setSelection(cursor, cursor + chunk.length);
        this.__updateInput()
      },
      fullscreen() {

      },
      __saveDom() {
        this.vmd = this.$refs.vmd;
        this.vmdBody = this.$refs.vmdBody;
        this.vmdHeader = this.$refs.vmdHeader;
        this.vmdFooter = this.$refs.vmdFooter;
        this.vmdEditor = this.$refs.vmdEditor;
        this.vmdPreview = this.$refs.vmdPreview;
      },
      __removeDom() {
        this.vmd = null;
        this.vmdBody = null;
        this.vmdHeader = null;
        this.vmdFooter = null;
        this.vmdEditor = null;
        this.vmdPreview = null
      },
      __resize() {
        let vmdHeaderOffset = this.vmdHeader ? this.vmdHeader.offsetHeight : 0,
        vmdFooterOffset = this.vmdFooter ? this.vmdFooter.offsetHeight : 0;
        this.vmdBody.style.height = (this.vmd.offsetHeight - vmdHeaderOffset - vmdFooterOffset) + 'px';

      },
      __updateInput(txt) {
        if (txt) {
          this.vmdEditor.value += txt
        }

        if (!this.$props.value) {
          this.vmdInput = this.vmdEditor.value;
        } else {
          this.$emit('input', this.vmdEditor.value);
        }
        this.vmdEditor.focus()
      },
      __localize(tag) {
        return locale[this.lang][tag]
      },
      /**
       * 获取编辑器的值
       */
      __getContent() {
        return this.vmdEditor.value
      },
      /**
       * 获取选择的内容
       */
      __getSelection() {
        let e = this.vmdEditor;
        return (
          ('selectionStart' in e && function () {
            let l = e.selectionEnd - e.selectionStart;
            return {start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l)};
          }) ||

          /* 如果浏览器不支持 */
          function () {
            return null;
          }
        )();
      },
      /**
       * 设置选择的内容
       * @param start
       * @param end
       */
      __setSelection(start, end) {
        let e = this.vmdEditor;
        return (
          ('selectionStart' in e && function () {
            e.selectionStart = start;
            e.selectionEnd = end;
            return null;
          }) ||

          /* 如果浏览器不支持 */
          function () {
            return null;
          }
        )();
      },
      /**
       * 替换选择的内容
       * @param text
       */
      __replaceSelection(text) {
        let e = this.vmdEditor;
        return (
          ('selectionStart' in e && function () {
            e.value = e.value.substr(0, e.selectionStart) + text + e.value.substr(e.selectionEnd, e.value.length);
            // Set cursor to the last replacement end
            e.selectionStart = e.value.length;
            return null;
          }) ||

          /* 如果浏览器不支持 */
          function () {
            e.value += text;
            return null;
          }
        )();
      }
    },  // Change watchers
    watch: {
      // When our notes change, we save them
      notes: {
        // The method name
        handler: 'saveNotes',
        // We need this to watch each note's properties inside the array
        deep: true,
      },
      // Let's save the selection too
      selectedId (val, oldVal) {
        localStorage.setItem('selected-id', val)
      },
    },
  }
</script>

<style scoped>

  *:focus {
    outline: none;
  }

  *, :after, :before {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  .material-icons {
    font-size: 24px;
    line-height: 1;
    vertical-align: middle;
    margin: -3px;
    padding-bottom: 1px;
  }

  button {
    border-radius: 3px;
    border: none;
    display: inline-block;
    padding: 4px 6px;
    cursor: pointer;
  }

  button:hover {
    background: #63c89b;
  }

  .toolbar {
    padding: 4px;
    box-sizing: border-box;
  }

  .txt {
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px;
  }

  .root {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .side-bar {
    background: #f8f8f8;
    width: 20%;
    box-sizing: border-box;
    margin-left: 2px;
  }
  .note {
    padding: 10px;
    cursor: pointer;
  }

  .note:hover {
    background: #ade2ca;
  }
  .notes {
    flex: auto 1 1;
    overflow: auto;
  }
  .note.selected {
    background: #40b883;
    color: white;
  }
  .vmd {
    position: relative;
    width: 80%;
    height: 99%;
    overflow: hidden;
    border: thin solid #ddd;
    text-align: left;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    -webkit-transition: all .3s linear;
    -moz-transition: all .3s linear;
    -ms-transition: all .3s linear;
    -o-transition: all .3s linear;
    transition: all .3s linear;
    margin: 2px;
  }

  .vmd.active {
    border-color: #4395ff;
  }

  .vmd .vmd-header, .vmd .vmd-footer {
    display: block;
    padding: 6px;
    border-bottom: thin solid #ddd;
    background: #f5f5f5;
  }

  .vmd .vmd-header {
    border-bottom: thin solid #ddd;
  }

  .vmd .vmd-footer {
    border-top: thin solid #ddd;
  }

  .vmd .vmd-body {
    height: inherit;
  }

  .vmd-body .vmd-editor, .vmd-body .vmd-preview {
    display: block;
    padding: .8rem;
    height: inherit;
    width: 50%;
    min-height: 100px;
    float: left;
    overflow: auto;
    box-sizing: border-box;
    border-left: solid 4px #f8f8f8;
  }

  .vmd-body .vmd-editor {
    color: #3d4043;
    font-size: 1rem;
    line-height: 1.2rem;
    border: 0;
    resize: none;
    /*background: #00d1b2;*/
  }

  .vmd-body .vmd-preview {
    background: #fff;
  }

  .vmd-btn {
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px;
  }

  .vmd-btn:hover {
    color: #333;
    text-decoration: none;
  }

  .vmd-btn:active,
  .vmd-btn.active {
    background-image: none;
    outline: 0;
    -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);
  }

  .vmd-btn:focus {
    outline: none;
  }

  .vmd-btn-default {
    color: #333;
    background-color: #fff;
    border-color: #ccc;
  }

  .vmd-btn-default:hover {
    color: #333;
    background-color: #e6e6e6;
    border-color: #adadad;
  }

  .vmd-btn-default:active,
  .vmd-btn-default.active {
    color: #333;
    background-color: #e6e6e6;
    border-color: #adadad;
  }

  .vmd-btn-borderless {
    padding-top: 7px;
    padding-bottom: 7px;
    border: 0;
  }

  .vmd-btn-borderless, .vmd-btn-borderless:hover, .vmd-btn-borderless:active, .vmd-btn-borderless.active {
    box-shadow: none;
    background-color: transparent;
  }

  .vmd-btn-default:hover.vmd-btn-borderless {
    opacity: .5;
  }

  .vmd-btn-default:active.vmd-btn-borderless, .vmd-btn-default.active.vmd-btn-borderless {
    opacity: .7;
  }

  .vmd-btn-group {
    position: relative;
    display: inline-block;
    vertical-align: middle;
  }

  .vmd-btn-group > .vmd-btn {
    position: relative;
    float: left;
  }

  .vmd-btn-group > .vmd-btn:hover,
  .vmd-btn-group > .vmd-btn:focus,
  .vmd-btn-group > .vmd-btn:active,
  .vmd-btn-group > .vmd-btn.active {
    z-index: 2;
  }

  .vmd-btn-group .vmd-btn + .vmd-btn,
  .vmd-btn-group .vmd-btn + .vmd-btn-group,
  .vmd-btn-group .vmd-btn-group + .vmd-btn,
  .vmd-btn-group .vmd-btn-group + .vmd-btn-group {
    margin-left: -1px;
  }

  .vmd-btn-group > .vmd-btn:not(:first-child):not(:last-child):not(.dropdown-toggle) {
    border-radius: 0;
  }

  .vmd-btn-group > .vmd-btn:first-child {
    margin-left: 0;
  }

  .vmd-btn-group > .vmd-btn:first-child:not(:last-child):not(.dropdown-toggle) {
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }

  .vmd-btn-group > .vmd-btn:last-child:not(:first-child) {
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
  }

  .vmd-btn-group > .vmd-btn-group {
    float: left;
  }

  .vmd-btn-group > .vmd-btn-group:not(:first-child):not(:last-child) > .vmd-btn {
    border-radius: 0;
  }

  .vmd-btn-group > .vmd-btn-group:first-child:not(:last-child) > .vmd-btn:last-child {
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }

  .vmd-btn-group > .vmd-btn-group:last-child:not(:first-child) > .vmd-btn:first-child {
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
  }

  .vmd-body:before, .vmd-body:after,
  .vmd-btn-group:before, .vmd-btn-group:after {
    display: table;
    content: '';
  }

  .vmd-body:after,
  .vmd-btn-group:after {
    clear: both;
  }
</style>
