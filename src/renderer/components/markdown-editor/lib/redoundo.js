export default class RedoUndo{
    constructor(size){
        this.undoStack = [];
        this.redoStack = [];
        this.max = size;
        this.capacity = this.max * 2;
        this.current = null;
        console.log('RedoUndo');
    }

    push(oldVal, newVal){
        this.undoStack.push(oldVal);
        if(this.redoStack.length > 1 || !this.redoStack.length){
            this.redoStack = [newVal];
        } else{
            this.redoStack[0] = newVal;
        }
        if(this.undoStack.length > this.capacity){
            this.undoStack = this.undoStack.slice[this.max];
        }
    }

    get canUndo() {
        return this.undoStack.length > 0 && this.redoStack.length < this.max;
    }

    get canRedo() {
        return this.redoStack.length > 0;
    }

    undo(){
        let val = this.undoStack.pop();
        if(val && this.undoStack.length % this.max != 0){
            this.redoStack.push(val);
        }
        
        return val;
    }

    redo(){
        let val = this.redoStack.pop();
        if(val && this.redoStack.length != 0){
            this.undoStack.push(val);
        }
        return val;
    }
}