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
    <label for="val">${arg.title}</label>
    <input id="val" value="${arg.val}" autofocus />
    <button onclick="ok()">Ok</button>
    <button onclick="window.close()">Cancel</button>
    <style>
    body {"Helvetica Neue", Helvetica, Arial, sans-serif} 
    button {appearance: none;user-select: none;
    background-image: linear-gradient(#ededed, #ededed 38%, #dedede);
    font-family: Ubuntu, Arial, sans-serif;min-height: 2em;
    min-width: 4emborder: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 2px;box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.75);
    color: #444;font: inherit;margin: 0 1px 0 0;
    text-shadow: 0 1px 0 rgb(240, 240, 240);}

    label,input {margin-bottom: 10px; width: 100%; display:block;} </style>
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
