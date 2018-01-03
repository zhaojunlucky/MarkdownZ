export default class RedoUndo{
    constructor(size){
        this.undoStack = [];
        this.redoStack = [];
        this.max = size;
        this.capacity = this.max * 2;
    }

    push(val){
        this.undoStack.push(val);
        if(this.redoStack.length){
            this.redoStack = [];
        }
        if(this.undoStack.length > this.capacity){
            this.undoStack = this.undoStack.slice[this.max];
        }
    }

    get canUndo() {
        return this.undoStack.length > 0;
    }

    get canRedo() {
        return this.redoStack.length > 0;
    }

    get undo(){
        let val = this.undoStack.pop();
        if(val){
            this.redoStack.push(val);
        }
        
        return val;
    }

    get redo(){
        let val = this.redoStack.pop();
        if(val){
            this.undoStack.push(val);
        }
        return val;
    }
}