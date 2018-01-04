export default class DataProvider{
    constructor(){
        this.keys = {
            "selectdId": "selected-id",
            "notes": "notes",
        }
    }

    save(key, val){
        localStorage.setItem(key, val);
    }

    get(key){
        return localStorage.getItem(key);
    }

    getJSON(key, defaultJSON){
        try{
            return JSON.parse(this.get(key)) || defaultJSON;
        }catch(e){
            console.log(e);
        }
        return defaultJSON;
    }

    saveNotes(notes){
        if(Array.isArray(notes)){
            this.save(this.keys.notes, JSON.stringify(notes))
        }
    }

    loadNotes(){
        return this.getJSON(this.keys.notes, []);
    }

    saveSelectedNoteId(noteId){
        if(typeof noteId != "undefined"){
            this.save(this.keys.selectdId, noteId)
        }
    }

    loadSelectedNoteId(){
        let selId = this.get(this.keys.selectdId);
        return selId == "null"? null : selId;
    }

}