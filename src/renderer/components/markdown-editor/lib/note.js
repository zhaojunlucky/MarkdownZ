import GitHubJekyll from './github-jekyll'
const dateFormat = require('dateformat')

export default class Note{
    constructor(data){
        console.log('Note');
        this._data = data;
        this._history = null;
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

    set history(val){
        this._history = val;
    }

    get history(){
        return this._history;
    }

    get ghcontent(){
        try{
            let gj = new GitHubJekyll(this.content);
            gj.setHeadItem("title", this.title);
            let updateDate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss o");
            gj.setHeadItem("update", updateDate);
            return gj.content;
        }catch(e){
            return this.content;
        }
    }

    get ghfilename(){
        try{
            let gj = new GitHubJekyll(this.content);
            const date = gj.getHeadItem("date");
            if(date){
                let m = date.value.match(/(\d{4}-\d{2}-\d{2})/);
                if(m){
                    return m[1] + '-' + this.title.replace(/(\s+)/g,'-') + '.markdown';
                }
            }
        }catch(e){
            console.log(e);
        }
        return null;
    }
}