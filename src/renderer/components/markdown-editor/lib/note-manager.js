const dateFormat = require('dateformat');

import DataProvider from './data-provider'
import Note from './note'

export default class NoteManager{
    constructor(dataProvider){
        console.log('NoteManager');
        this.dataProvider = dataProvider;
        this._notes = [];
        let that = this;
        this.dataProvider.loadNotes().forEach(function(el){
                that._notes.push(new Note(el));
        });
    }

    get notes(){
        return this._notes;
    }

    findNoteById(id, defaultNote = null){
        return this.notes.find(note => note.id === id) || defaultNote;
    }

    addNote(title){
        if(!title){
            for(let i = this.notes.length + 1;;++i){
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
          content: Note.NoteTemplate.replace("<date>", dateFormat(date, "yyyy-mm-dd HH:MM:ss o")),
          created: date.getTime(),
          github: false,
        }

        let note = new Note(data);
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

    get rawNotes(){
        let arr = [];
        this.notes.forEach(function(el){
            arr.push(el.data);
        });
        return arr;
    }
}