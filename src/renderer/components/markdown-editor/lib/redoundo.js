import RedoUndoStack from './redoundo-stack'

export default class RedoUndo{
    constructor(size){
        this.stack = [];
        this.size = size;
        this.redoundoStack = null;
        console.log('RedoUndo');
    }

    push(oldVal, newVal){
        if(this.redoundoStack){
            this.stack = this.redoundoStack.validate();
            this.redoundoStack = null;
        }

        this.stack.push(oldVal);
        if(this.stack.length > this.size){
            this.stack = this.stack.slice(this.length - this.size);
        }
        this.current = newVal;
    }

    get canUndo() {
        return this.stack.length > 0 && (this.index == -1 || this.index > 0);
    }

    get canRedo() {
        return this.stack.length> 0 && this.index < this.stack.length - 1;
    }

    undo(){
        if(!this.redoundoStack){
            this.redoundoStack = new RedoUndoStack(this.stack, this.current);
        }
        return this.redoundoStack.prev();
    }

    redo(){
        if(this.redoundoStack){
            return this.redoundoStack.next();
        }
        return null;
    }
}