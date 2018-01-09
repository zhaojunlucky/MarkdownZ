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
        this.editor.doc.replaceSection(text);
    }

    getSelection(){
        let sels = this.editor.doc.listSelections();
        return {
            start: sels[0].anchor,
            end: sels[0].head,
            text: this.editor.doc.getSelection(),
        };
    }

    replace(text, start, end, sel){
        this.editor.doc.replaceRange(text, start, end);
        if(sel){
            this.editor.doc.setSelection(sel.start, sel.end);
            this.editor.doc.setCursor(sel.start);
        }
    }

    addEnter(){
        let txt = '';
        let sel = this.getSelection();
        let start = sel.start;
        let end = sel.end;

        let line = this.editor.doc.getLine(start.line);
        /*
         * - test
         * - (if press enter here need delete -)
         */
        let delPattern = /^(\d+)\. $|^- $|^> $/
        if(line.length == start.ch && delPattern.test(line)){
            txt = MEditor.Markdown.enter.repeat(2);
            start.ch = 0;
        }else{
            txt = MEditor.Markdown.enter;
            let orderedListPattern = /^(\d+)\. .*/;
            if(line.startsWith(MEditor.Markdown.ul)){
                txt += MEditor.Markdown.ul;
            }else if(line.startsWith(MEditor.Markdown.quote)){
                txt += MEditor.Markdown.quote;
            }else if(orderedListPattern.test(line)){
                let numStr = line.match(orderedListPattern);
                if(start.ch >= numStr.length + 1){
                    let num = parseInt(numStr);
                    txt += MEditor.Markdown.ol.replace("{num}", (num + 1));
                }
            }
        }
        this.replace(txt, start, end);
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

    calcSelection(text, rStart, rEnd, startTuning, endTuning){
        let newSel = {
            start: {line: rStart.line, ch, rStart.ch},
            end: {line: rEnd.line, ch, rEnd.ch},
        }

        let lines = text.split(MEditor.Markdown.enter);
        newSel.end.line = rStart.line + lines.length - 1;
        newSel.start.ch = Math.max(newSel.ch + startTuning, 0);
        newSel.end.ch = lines.length > 1 ? lines[lines.length - 1].length : newSel.start.ch + text.length;

        newSel.end.ch = Math.max(newSel.end.ch + endTuning, 0);

        return newSel;
    }

    addSurroundText(surroundText){
        let sel = this.getSelection();
        let selText = sel.text;
        let start = sel.start;
        let end = sel.end;

        if(this.surroundBy(start, end, surroundText)){
            start.ch -= surroundText.length;
            end.ch += surroundText.length;
            let newSel = this.calcSelection(selText, start, end, 0, 0);
            this.replace(selText, start, end, newSel);

        } else{
            let text = surroundText + selText + surroundText;
            let newSel = this.calcSelection(text, start, end, surroundText.length, surroundText.length*-1);
            this.replace(text, start, end, newSel);
        }
    }

    addHeading(heading){
        let sel = this.getSelection();
        let selText = sel.text;
        let start = sel.start;
        let end = sel.end;
        let startLine = this.editor.doc.getLine(start.line);
        start.ch = 0;
        if(startLine.startsWith(heading)){
            let text = selText.slice(heading.length);
            let newSel = this.calcSelection(text, start, end, 0, 0);
            this.replace(text, start, end, newSel);
        } else{
            let text = heading + selText;
            let newSel = this.calcSelection(text, start, end, 0, 0);
            this.replace(text, start, end, newSel);
        }
    }

    addListPrefixText(prefixCallback, isItemCallback, rmItemCallback){
        let sel = this.getSelection();
        let start = sel.start;
        let end = sel.end;
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
        let text = lines.join(MEditor.Markdown.enter);
        let newSel = this.calcSelection(text, start, end, 0, 0);
        this.replace(text, start, end, newSel);
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
            let newLine = MEditor.Markdown.enter.repeat(2);
            this.addNormalText(newLine + MEditor.Markdown.table);
        }
    }

}