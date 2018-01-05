import DataProvider from './lib/data-provider'

export default class NoteManager{
    constructor(){
        this.dataProvider = new DataProvider();
        this.notes = [];
        let that = this;
        this.dataProvider.loadNotes().forEach(function(el){
                that.notes.push(new Note(el));
        });
    }

    getNoteById(id){
        this.notes.find(note => note.id === id);
    }

    addNote(title){
        if(!title){
            for(let i = this.length;;++i){
                title = `New note ${i}`;
                if(!this.notes.find(note => note.title === title)){
                    break;
                }
            }
        }
         // Default new note
        const date = new Date();
        const data = {
          id: String(date.getTime()),
          title: title,
          content: this.vmdInput,
          created: date.getTime(),
          github: false,
        }
        data.content = data.content.replace("<date>", dateFormat(date, "yyyy-mm-dd HH:MM:ss o"))
        let note = new Note();
        this.notes.push(note);
        return note;
    }

    remoteNote(note){
        return remoteNoteById(note.id);
    }

    remoteNoteById(id){
        const index = this.notes.findIndex(note => note.id === id);
        if(index >= 0) {
            const note = this.notes[index];
            this.removeByIndex(index);
            return note;
        }
        return null;
    }

    removeByIndex(index){
        this.notes.splice(index, 1);
    }

    get length(){
        return this.notes.length;
    }

    get rawData(){
        let arr = [];
        this.notes.forEach(function(el){
            arr.push(el.data);
        });
        return arr;
    }
}