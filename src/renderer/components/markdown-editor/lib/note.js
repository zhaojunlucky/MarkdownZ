import RedoUndo from './redoundo'

export default class Note{
    constructor(data){
        console.log('Note');
        this._data = data;
        this.undoredo = new RedoUndo(20);
    }

    static get NoteTemplate(){
        return '---\nlayout: post\ndate: <date>\ncategories: cat1 cat2\n---\n'
    }

    static get About(){
        return '# Markdown Editor by MagicworldZ\n> Another notes application which can integrate with GitHub Jekyll'
    }

    static get DefaultNote(){
        const note = {
            id: null,
            title: 'Default Note',
            content: Note.About,
            created: null,
        }
        return note;
    }

    onReplace(oldVal, newVal){
        this.content = newVal;
        this.undoredo.push(oldVal);
    }

    get data(){
        return this._data;
    }

    get id(){
        return this.data.id;
    }

    get title(){
        return this.data.title;
    }

    set title(val){
        this.data.title = val;
    }

    get content(){
        return this.data.content;
    }

    set content(val){
        this.undoredo.push(val);
        this.data.content = val;
    }

    get created(){
        return this.data.created;
    }

    get github(){
        return this.data.github;
    }

    set github(val){
        this.data.github = val;
    }

    get ghcontent(){
        let title = `title: "${this.title}"`;
        let updateDate = "update: " + dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss o");
        let updateContent = `\n${title}\n${updateDate}\n`;
        let start = content.indexOf('---');
        return content.slice(0, start + 3) + updateContent + content.slice(start + 4);
    }

    get ghfilename(){
        let start = this.content.indexOf('---');
        let end = this.content.indexOf(start + 3, '---');
        let str = this.content.slice(start, end);
        let datePattern = /date: (\d{4}-\d{2}-\d{2})/

        let title = this.selectedNote.title;
        let date = null;
        matcher = str.match(datePattern);
        if(matcher != null){
          date = matcher[1];
        }

        if(date){
          return date + '-' + title.replace(/(\s+)/g,'-') + '.markdown';
        }

        return null;
    }
}