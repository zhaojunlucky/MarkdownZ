<template>
  <div id="notebook">
    <aside class="side-bar">
      <div class="toolbar">
        <button @click="addNode" :title="addButtonTitle"><i class="material-icons">add</i>Add note</button>
      </div>
      <div class="notes">
        <div class="note" v-for="note of this.notes" @click="selectNote(note)" :class="{selected: note === selectedNote}">
          {{ note.title }}
        </div>
      </div>
    </aside>
    <template v-if="selectedNote">
      <section class="main">
        <div class="toolbar">
          <button><i class="fa fa-bold" aria-hidden="true"></i>
</button>
          <input v-model="selectedNote.title" placeholder="Note title"></input>
          <button title="Remove note"><i class="material-icons">delete</i></button>
        </div>
        <textarea v-model="selectedNote.content"></textarea>
        <div class="toolbar status-bar">
          <span class="date">
            <span class="label">Created</span>
            <span class="value">{{ selectedNote.created | date }}</span>
          </span>
          <span class="lines">
            <span class="label">Lines</span>
            <span class="value">{{ linesCount }}</span>
          </span>
          <span class="words">
            <span class="label">Words</span>
            <span class="value">{{ wordsCount }}</span>
          </span>
          <span class="characters">
            <span class="label">Characters</span>
            <span class="value">{{ charactersCount }}</span>
          </span>
        </div>
      </section>
    </template>
    <aside class="preview" v-html="notePerview"></aside>
  </div>
</template>

<script>
  import marked from 'marked'
  import hljs from 'highlight.js'
  
  marked.setOptions({
    highlight: function (code) {
      return hljs ? hljs.highlightAuto(code).value : code
    }
  });

  export default {
    data () {
      return {
        notes: JSON.parse(localStorage.getItem('notes')) || [],
        selectedId: localStorage.getItem('selected-id') || null,
      }
    },
    methods: {
        addNode() {
          const time = Date.now()
          const note = {
            id: String(time),
            title: 'New note ' + (this.notes.length + 1),
            content: '**Hi!** This notebook is using [markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) for formatting!',
            created: time,
            favorite: false,
          }
          this.notes.push(note)
          this.selectNote(note)
        },
        selectNote(note){
          this.selectedId = note.id
        },
        saveNotes() {
          localStorage.setItem('notes', JSON.stringify(this.notes))
          //console.log('Notes saved! ', new Date())
        }
    },
    computed: {
      notePerview () {
        return this.selectedNote? marked(this.selectedNote.content): ''
      },
      addButtonTitle() {
        return this.notes.length + ' note(s) already'
      },
      selectedNote(){
        return this.notes.find(note => note.id === this.selectedId)
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
    watch: {
      // content: {
      //   handler(val, oldVal){
      //     localStorage.setItem('content', val)
      //   },
      // },
      notes: 'saveNotes',
      selectedId(val){
        localStorage.setItem('selected-id', val)
      }
    },
  }
</script>

<style scoped>

  .material-icons {
    font-size: 24px;
    line-height: 1;
    vertical-align: middle;
    margin: -3px;
    padding-bottom: 1px;
  }

  #notebook > * {
    float: left;
    display: flex;
    flex-direction: column;
    height: 95vh;

    > * {
      flex: auto 0 0;
    }
  }

  .side-bar {
    background: #f8f8f8;
    width: 20%;
    box-sizing: border-box;
  }

  .note {
    padding: 16px;
    cursor: pointer;
  }

  .note:hover {
    background: #ade2ca;
  }

  .note .icon {
    float: right;
  }

  button,
  input,
  textarea {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    box-sizing: border-box;
    outline: none !important;
  }

  button,
  .note.selected {
    background: #40b883;
    color: white;
  }

  button {
    border-radius: 3px;
    border: none;
    display: inline-block;
    padding: 8px 12px;
    cursor: pointer;
  }

  button:hover {
    background: #63c89b;
  }

  input {
    border: solid 2px #ade2ca;
    border-radius: 3px;
    padding: 6px 10px;
    background: #f0f9f5;
    color: #666;
  }

  input:focus {
    border-color: #40b883;
    background: white;
    color: black;
  }

  button,
  input {
    height: 34px;
  }

  .main, .preview {
    width: 40%;
  }

  .toolbar {
    padding: 4px;
    box-sizing: border-box;
  }

  .status-bar {
    color: #777;
  }

  .status-bar > span {
    margin-right: 6px;
    white-space: nowrap;
  }

  .status-bar .label {
    color: #bbb;
  }

  textarea {
    resize: none;
    border: none;
    box-sizing: border-box;
    margin: 0 4px;
    font-family: monospace;
  }

  textarea, .notes, .preview {
    flex: auto 1 1;
    overflow: auto;
  }

  .preview {
    padding: 12px;
    box-sizing: border-box;
    border-left: solid 4px #f8f8f8;
  }

  .preview p:first-child {
    margin-top: 0;
  }

  a {
    color: #40b883;
  }

  h1,
  h2,
  h3 {
    margin: 10px 0 4px;
    color: #40b883;
  }

  h1 {
    font-size: 2em;
  }

  h2 {
    font-size: 1.5em;
  }

  h3 {
    font-size: 1.2em;
  }

  h4 {
    font-size: 1.1em;
    font-weight: normal;
  }

</style>
