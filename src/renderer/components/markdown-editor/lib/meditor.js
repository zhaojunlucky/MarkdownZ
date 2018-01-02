const electron = require('electron');
const clipboard = electron.clipboard;

export default class MEditor{
    constructor(editor){
        this.editor = editor;

        this.undoStack = [];
        this.redoStack = [];
        this.eventListener = {"onReplace": null};
    }

    static get Markdown (){
        return {
            "tab": "    ",
            "bold": "**{text}**",
        };
    }

    get value(){
        return this.editor.value;
    }

    get selection(){
        let e = this.editor;
        let len = e.selectionEnd - e.selectionStart;
        return {
            start: e.selectionStart, 
            end: e.selectionEnd, 
            length: len, 
            text: e.value.substr(e.selectionStart, len)
        };
    }

    setSelection(start, end){
        this.editor.selectionStart = start;
        this.editor.selectionEnd = end;
    }

    replaceSelection(text, callback){
        let sel = this.selection;
        let oldVal = this.value;
        // do replace
        this.editor.value = this.editor.value.substr(0, sel.start) + text + this.editor.value.substring(sel.end);
        if(callback){
            let newSel = callback(sel);
            if(newSel){
                this.setSelection(newSel.start, newSel.end);
            }
        }
        // undo redo setting

        if(this.eventListener.onReplace){
            this.eventListener.onReplace(oldVal, this.value)
        }
    }

    selectAll(){
        this.setSelection(0, this.value.length);
    }

    copySelection(){
        clipboard.writeText(this.selection.text);
    }

    addTab(){
        this.replaceSelection(MEditor.Markdown.tab, function(sel){
            let start = sel.start + MEditor.Markdown.tab.length;
            return {"start": start, "end": start};
        });
    }

    addOl() {

    }


}