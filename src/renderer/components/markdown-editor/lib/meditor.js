import RedoUndo from './redoundo'

const electron = require('electron');
const clipboard = electron.clipboard;

export default class MEditor{
    constructor(editor){
        this.editor = editor;

        this.undoRedo = new RedoUndo(15);
        this.eventListener = {"onReplace": null};
        console.log('ee')
    }

    static get Markdown (){
        return {
            "tab": "    ",
            "bold": "**",
            "enter": "\n",
            "ul": "- ",
            "quote": "> ",
            "ol": "{num}. ",
            "italic": "*",
            "strikethrough": "~~",
            "code": "`",
            "hr": "\n----------\n",
            "h1": "# ",
            "h2": "## ",
            "h3": "### ",
            "table": "header 1 | header 2\n---|---\nrow 1 col 1 | row 1 col 2\nrow 2 col 1 | row 2 col 2\n",
        };
    }

    static get About(){
        return `# Markdown Editor by MagicworldZ
> Another notes application which can integrate with GitHub Jekyll`
    }

    static get NoteTemplate(){
        return '---\nlayout: post\ndate: <date>\ncategories: cat1 cat2\n---\n'
    }

    get value(){
        return this.editor.value;
    }

    get selection(){
        return this.getSelection(this.editor.selectionStart, this.editor.selectionEnd);
    }

    getSelection(start, end){
        let len = end - start;
        return {
            start : start,
            end: end,
            length: len,
            text: this.value.substr(start, len)
        }
    }

    setSelection(start, end){
        this.editor.selectionStart = start;
        this.editor.selectionEnd = end;
    }

    replace(sel, text, callback){
        let oldVal = this.value;
        // do replace
        this.editor.value = this.editor.value.substr(0, sel.start) + text + this.editor.value.substring(sel.end);
        if(callback){
            let newSel = callback(sel);
            if(newSel){
                this.setSelection(newSel.start, newSel.end);
            }
        }

        this.editor.focus();
        // undo redo setting
        this.undoRedo.push(oldVal);
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
        this.addNormalText(MEditor.Markdown.tab);
    }

    addHorizonRule(){
        this.addNormalText(MEditor.Markdown.hr);
    }

    addNormalText(text){
        this.replace(this.selection, text, function(oldSel){
            let start = oldSel.start + text.length;
            return {"start": start, "end": start};
        });
    }

    addEnter(e){
        let txt = '';
        let sel = this.selection;
        let start = sel.start;
        let end = sel.end;
        let newSel = {
            start: start,
            end: end
        }
        if(e.shiftKey){
            txt = MEditor.Markdown.enter;
        } else if(!e.isComposing){
            let line = this.getCursorLine(start);
            /*
             * - test
             * - (if press enter here need delete -)
             */
            let delPattern = /^(\d+)\. $|^- $|^> $/
            if(sel.start == line.line.length + line.start && delPattern.test(line.line)){
                txt = MEditor.Markdown.enter.repeat(2);
                start = line.start;
            }else{
                txt = MEditor.Markdown.enter;
                let orderedListPattern = /^(\d+)\. .*/;
                if(line.line.startsWith(MEditor.Markdown.ul)){
                    txt += MEditor.Markdown.ul;
                }else if(line.line.startsWith(MEditor.Markdown.quote)){
                    txt += MEditor.Markdown.quote;
                }else if(orderedListPattern.test(line.line)){
                    let numStr = line.line.match(orderedListPattern);
                    if(start >= line.start + numStr.length + 1){
                        let num = parseInt(numStr);
                        txt += MEditor.Markdown.ol.replace("{num}", (num + 1));
                    }
                    
                }

            }
            newSel.start = start + txt.length;
            newSel.end = newSel.start;
        }
        if(txt){
            this.replace(this.getSelection(start, end), txt, function(oldSel){
                return newSel;
            });
        }
    }

    getCursorLine(start){
        let i = this.value.lastIndexOf('\n', start);
        if(i != start){
            ++i;
        }
        let j = this.value.indexOf('\n', start);
        if(j != start){
            j = j > 0 ? j - 1 : this.value.length - 1;
        }

        return {
            line: this.value.slice(i, j + 1),
            start: i,
            end: j
        };
    }

    surroundBy(sel, val){
        let len = val.length;
        return this.value.substr(sel.start - len, len) === val &&
            this.value.substr(sel.end, len) === val;
    }

    addBold(){
        this.addSurroundText(MEditor.Markdown.bold);
    }

    addItalic(){
        this.addSurroundText(MEditor.Markdown.italic);
    }

    addStrikethrough(){
        this.addSurroundText(MEditor.Markdown.strikethrough);
    }

    addCode(){
        this.addSurroundText(MEditor.Markdown.code);
    }

    addSurroundText(surroundText){
        let len = surroundText.length;
        let sel = this.selection;
        let start = sel.start;
        let end = sel.end;
        let txt = sel.text;
        let newSel = {
            start: start,
            end: end,
        }
        if(this.surroundBy(sel, surroundText)){
            newSel.start = start - len;
            newSel.end = newSel.end - len;

            start = start - len;
            end = end + len;
            
        }else{
            txt = surroundText + txt + surroundText;
            newSel.start = start + len;
            newSel.end = end + len;
        }

        this.replace(this.getSelection(start, end), txt, function(oldSel){
            return newSel;
        });

    }

    addHeading(heading){
        let sel = this.selection;
        let line = this.getCursorLine(sel.start);
        let txt = heading;
        let start = line.start;
        let end = line.start;
        let newSel = {
            start : sel.end,
            end : sel.end,
        }

        if(line.line.startsWith(heading)){
            txt = '';
            start = line.start;
            end = start + heading.length;
            newSel.start = newSel.end = sel.end - heading.length;
        } else{
            newSel.start = newSel.end = sel.end + heading.length;
        }

        this.replace(this.getSelection(start, end), txt, function(oldSel){
            return newSel;
        });
    }

    addListPrefixText(prefixCallback){
        let sel = this.selection;
        let txt = '';
        if(sel.text.indexOf(MEditor.Markdown.enter) < 0){
            txt = prefixCallback(1) + sel.text;
        }else{
            let list = sel.text.split(MEditor.Markdown.enter);

            for(let i = 0; i < list.length; ++i){
                list[i] = prefixCallback(i + 1) + list[i]
            }

            txt = list.join(MEditor.Markdown.enter);
        }
        this.replace(sel, txt, function(oldSel){
            return {"start": sel.start, "end": sel.start + txt.length};
        });
    }

    addOl() {
        this.addListPrefixText(function(index){
            return MEditor.Markdown.ol.replace('{num}', index);
        });
    }

    addUl(){
        this.addListPrefixText(function(index){
            return MEditor.Markdown.ul;
        });
    }

    addQuote(){
        this.addListPrefixText(function(index){
            return MEditor.Markdown.quote;
        });
    }

    addTable(){
        if(this.selection.length === 0){
            let newLine = this.getCursorLine(this.selection.start).line.length > 1 ? MEditor.Markdown.enter: '';
            this.addNormalText(newLine + MEditor.Markdown.table);
        }
    }

}