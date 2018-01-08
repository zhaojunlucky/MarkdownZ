const electron = require('electron');
const clipboard = electron.clipboard;

export default class MEditor{
    constructor(editor){
        this.editor = editor;
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

    get value(){
        return this.editor.getValue();
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
        this.editor.replaceSelection(text);
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

    surroundBy(start, end, val){
        let endLine = this.editor.doc.getLine(end.line);
        if(start.ch >= val.length && end.ch + val.length >= endLine.length){
            let startLine = this.editor.doc.getLine(start.line);
            
            return startLine.slice(start.ch - val.length, start.ch) == val && endLine.substring(end.ch, end.ch + val.length) == val;
        }
        return false;
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
        let sels = this.editor.doc.listSelections();
        let selText = this.editor.doc.getSelection();
        let start = sels[0].anchor;
        let end = sels[0].head;
        if(this.surroundBy(start, end, surroundText)){
            start.ch -= surroundText.length;
            end.ch += surroundText.length;
            this.editor.doc.replaceRange(selText, start, end);
        } else{
            this.addNormalText(surroundText + selText + surroundText);
        }
    }

    addHeading(heading){
        let sels = this.editor.doc.listSelections();
        let selText = this.editor.doc.getSelection();
        let start = sels[0].anchor;
        let end = sels[0].head;
        let startLine = this.editor.doc.getLine(start.line);
        start.ch = 0;
        if(startLine.startsWith(heading)){
            this.editor.doc.replaceRange(start, end, selText.slice(heading.length));
        } else{
            this.editor.doc.replaceRange(start, end, heading + selText);
        }
    }

    addListPrefixText(prefixCallback, isItemCallback, rmItemCallback){
        let sels = this.editor.doc.listSelections();
        let start = sels[0].anchor;
        let end = sels[0].head;
        let lines = [];
        let needRemove = false;
        start.ch = 0;
        end.ch = this.editor.doc.getLine(end.line).length - 1;
        for(let i = start.line; i <= end.line; ++i){
            let line = this.editor.doc.getLine(i);
            if(!needRemove && isItemCallback(line)){
                needRemove = true;
            }
            lines.append(line);
        }

        for(let i = 0; i < lines.length; ++i){
            lines[i] = needRemove? rmItemCallback(lines[i]) : prefixCallback(i + 1) + lines[i];
        }
        this.editor.doc.replaceRange(start, end, lines.join(MEditor.Markdown.enter));
    }

    addOl() {
        let orderedListPattern = /^(\d+)\. (.*)/
        this.addListPrefixText(function(index){
            return MEditor.Markdown.ol.replace('{num}', index);
        }, function(line){
            return orderedListPattern.test(line);
        }, function(line){
            return line.match(orderedListPattern)[2];
        });
    }

    addSimplePrefix(prefix){
        this.addListPrefixText(function(index){
            return prefix;
        }, function(line){
            return line.startsWith(prefix);
        }, function(line){
            return line.slice(prefix.length);
        });
    }

    addUl(){
        this.addSimplePrefix(MEditor.Markdown.ul);
    }

    addQuote(){
        this.addSimplePrefix(MEditor.Markdown.quote);
    }

    addTable(){
        if(this.editor.doc.getSelection().length === 0){
            let l = this.getCursorLine(this.selection.start);
            let newLine = MEditor.Markdown.enter.repeat(2);
            this.addNormalText(newLine + MEditor.Markdown.table);
        }
    }

}