export default class RedoUndoStack{
    constructor(oldArr, currentVal){
        this.stack = oldArr.slice();
        this.stack.push(currentVal);
        this.current = this.stack.length - 1;
        console.log('aa');
    }

    prev(){
        if(this.current > 0){
            this.current -= 1;
            return this.stack[this.current];
        }
        return null;
    }

    next(){
        if(this.current < this.stack.length - 1){
            this.current += 1
            return this.stack[this.current];
        }
        return null;
    }

    validate(){
        if(this.current <= 0){
            return [];
        }else{
            return this.stack.slice(0, this.current - 1);
        }
    }
}