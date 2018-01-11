export default class SingleOperation{
    constructor(){
        this.concurrent = {};
    }

    canOperate(key){
        if(this.concurrent.hasOwnProperty(key)){
            return false;
        }else{
            this.concurrent[key] = key;
        }
        return true;
    }

    removeOp(key){
        delete this.concurrent.key;
    }
}