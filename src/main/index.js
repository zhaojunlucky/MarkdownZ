import { app, BrowserWindow, electron, ipcMain  } from 'electron'

//const ipcMain = electron.ipcMain || electron.remote.ipcMain;

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  var promptResponse
  ipcMain.on('prompt', function(eventRet, arg) {
    promptResponse = null
    var promptWindow = new BrowserWindow({
      width: 400,
      height: 200,
      show: false,
      resizable: true,
      movable: false,
      alwaysOnTop: true,
      frame: false
    })
    arg.val = arg.val || ''
    
    const promptHtml = `
    <body class="smalltalk">
      <div class="page">
          <header>${ arg.title }</header>
          <div class="content-area">
              <input id="val" value="${arg.val}" autofocus />
          </div>
          <div class="action-area">
              <div class="button-strip"> 
              <button onclick="ok()">Ok</button>
              <button onclick="window.close()">Cancel</button>
              </div>
          </div>
      </div>
    </body>
    
    <style>.smalltalk {
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
    <script>
      function ok(){
        require('electron').ipcRenderer.send('prompt-response', document.getElementById('val').value);
        window.close();
      }
    </script>`
    promptWindow.loadURL('data:text/html,' + promptHtml)
    promptWindow.show()
    promptWindow.on('closed', function() {
      eventRet.returnValue = promptResponse
      promptWindow = null
    })
  })
  ipcMain.on('prompt-response', function(event, arg) {
    if (arg === ''){ arg = null }
    promptResponse = arg
  })

}

 

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
