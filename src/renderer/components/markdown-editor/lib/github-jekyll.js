export default class GitHubJekyll{
    constructor(content){
        this._content = content;
        console.log('GitHubJekyll');
        this.parse();
    }

    parse(){
        let contentMatcher = this._content.match(/---([\s\S]*?)---([\s\S]*)/);
        this._body = contentMatcher[2];

        let linePattern = /([a-zA-Z]+): (.*)/;
        let rawLines = contentMatcher[1].split('\n');
        this._heads = [];
        for(let index in rawLines){
            let line = rawLines[index];
            if(line.trim().length > 0){
                let m = line.match(linePattern)
                if(m){
                    this._heads.push({
                        "key": m[1],
                        "value": m[2],
                    });
                }
            }
        }
    }

    getHeadItem(key){
        return this._heads.find(item => item.key === key);
    }

    setHeadItem(key, val){
        let item = this.getHeadItem(key);
        if(item){
            item.value = val;
        }else{
            this._heads.push({key: key, value: val});
        }
    }

    get head(){
        let headStr = this._heads.map(item => `${item.key}: ${item.value}`).join('\n');
        return `---\n${headStr}\n---`;
    }

    get body(){
        return this._body;
    }

    get content(){
        return `${this.head}${this.body}`;
    }
}