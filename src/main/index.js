import { app, BrowserWindow, electron, ipcMain  } from 'electron'

//const ipcMain = electron.ipcMain || electron.remote.ipcMain;
import promptUtil from './prompt'

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

  var promptResponse;
  ipcMain.on('prompt', function(eventRet, arg) {
      promptResponse = null;
      var promptWindow = new BrowserWindow({
        width: 400,
        height: 200 + (25 * arg.inputs.length) ,
        show: false,
        resizable: false,
        movable: false,
        alwaysOnTop: false,
        parent: mainWindow,
        model: true,
        frame: false
    })
    arg.val = arg.val || ''

    promptWindow.loadURL('data:text/html,' + promptUtil.getHTMLTemplate(arg))
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
