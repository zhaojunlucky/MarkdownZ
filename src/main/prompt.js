export default class PromptUtil{
    static getHTMLTemplate(arg){
        const promptHtml = `
            <body class="smalltalk">
                <div class="page">
                    <header>${ arg.title }</header>
                    <div class="content-area">
                      ${
                        arg.inputs.map((item, i) =>
                            `<div>${item.msg}:<input id="${item.name}" value="${item.val}"/></div>`
                        ).join('')
                      }
                    </div>
                    <div class="action-area">
                        <span class="error-msg" id="error-msg"></span>
                        <div class="button-strip"> 
                            <button onclick="ok()">Ok</button>
                            <button onclick="window.close()">Cancel</button>
                        </div>
                    </div>
                </div>
                <style>
                    .smalltalk {
                        display: flex;
                        
                        align-items: center;
                        flex-direction: column;
                        justify-content: center;
                        width: 100%;
                        transition: 200ms opacity;
                        height:100%;
                        bottom: 0;
                        left: 0;
                        overflow: auto;
                        padding: 0px;
                        margin: 0px;
                        position: fixed;
                        right: 0;
                        top: 0;
                        
                        z-index: 100;
                    }

                    .smalltalk + .smalltalk {
                        transition: ease 1s;
                        display: none;
                    }

                    .smalltalk .page {
                        border-radius: 3px;
                        background: white;
                        box-shadow: 0 4px 23px 5px rgba(0, 0, 0, .2), 0 2px 6px rgba(0, 0, 0, .15);
                        color: #333;
                        min-width: 400px;
                        padding: 0;
                        position: relative;
                        z-index: 0;
                    }
                    .page{
                      width: 100%;
                      height: 100%;
                    }

                    @media only screen and (max-width: 500px) {
                        .smalltalk .page {
                            min-width: 0;
                        }
                    }
                    .smalltalk .page header {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: 500px;
                        
                        user-select: none;
                        color: #333;
                        font-size: 120%;
                        font-weight: bold;
                        margin: 0;
                        padding: 14px 17px;
                        text-shadow: white 0 1px 2px;
                    }

                     .page .content-area {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        
                        padding: 6px 17px;
                        
                    }

                     .page .action-area {
                        padding: 14px 17px;
                    }

                    button {
                        font-family: Ubuntu, Arial, sans-serif;
                    }

                    .smalltalk button, .smalltalk .smalltalk {
                        min-height: 2em;
                        min-width: 4em;
                    }

                    .smalltalk button {
                        appearance: none;
                        user-select: none;
                        background-image: linear-gradient(#ededed, #ededed 38%, #dedede);
                        
                        border: 1px solid rgba(0, 0, 0, 0.25);
                        border-radius: 2px;
                        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.75);
                        color: #444;
                        font: inherit;
                        margin: 0 1px 0 0;
                        text-shadow: 0 1px 0 rgb(240, 240, 240);
                    }

                    .smalltalk button::-moz-focus-inner {
                        border: 0;
                    }

                    .smalltalk button:enabled:active {
                        background-image: linear-gradient(#e7e7e7, #e7e7e7 38%, #d7d7d7);
                        box-shadow: none;
                        text-shadow: none;
                    }

                    .smalltalk .page .button-strip {
                        display: flex;
                        
                        flex-direction: row;
                        justify-content: flex-end;
                    }

                    .error-msg{
                      display: flex;
                      color: red;
                      flex-direction: row;
                      justify-content: flex-start;
                    }

                    .smalltalk .page .button-strip > button {
                        margin-left: 10px;
                    }

                    .smalltalk input {
                        width: 100%;
                        border: 1px solid #bfbfbf;
                        border-radius: 2px;
                        box-sizing: border-box;
                        color: #444;
                        font: inherit;
                        margin: 0;
                        min-height: 2em;
                        padding: 3px;
                        outline: none;
                    }

                    .smalltalk button:enabled:focus, .smalltalk input:enabled:focus {
                        transition: border-color 200ms;
                        border-color: rgb(77, 144, 254);
                        outline: none;
                    }
                </style>

                <script type="text/javascript">
                  let inputsNames = "${arg.inputs.map((item,i)=> item.name).join(",")}";
                  let requiredStr = "${arg.inputs.map((item,i)=>String(item.required)).join(",")}";

                  function getVal(id){
                    return document.getElementById(id).value;
                  }
                  function ok(){
                    let ret = '{';
                    const items = inputsNames.split(',');
                    const required = requiredStr.split(',');
                    for(let i in items){
                      let item = items[i];
                      let val = getVal(item).trim();

                      if(required[i] == "true" && !val){
                        document.getElementById('error-msg').innerHTML = "Please input '<strong>" + item + "</strong>'";
                        return;
                      }
                      ret += '"' + item + '":"' + val + '"';
                      if(i != items.length - 1){
                        ret += ',';
                      } 
                    }
                    ret += "}";
                    require('electron').ipcRenderer.send('prompt-response', ret);
                    window.close();  
                  }
                </script>
            </body>`
        return promptHtml;
    }

}